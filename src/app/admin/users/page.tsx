"use client";

import { useState, useMemo, useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { type User, users as placeholderUsers } from "@/lib/placeholder-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Shield,
  ShieldCheck,
  ShieldAlert,
  UserPlus,
  UserCheck,
  Mail,
  Phone,
  Building2,
  Calendar,
  Clock,
  Key,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  RotateCcw,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  Loader2,
  Sparkles,
  Info,
  Copy,
  Check,
  RefreshCw,
  ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import { collection, getDocs, addDoc, doc, setDoc, deleteDoc, docToJSON } from "@/lib/db";
import { db } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";

// ==========================================
// PERMISSIONS CONFIGURATION
// ==========================================
export const PERMISSION_GROUPS = [
  {
    group: "Catalog & Inventory",
    items: [
      { id: "manage_products", label: "Manage Products", description: "Create, update, pricing, stock, & archive items" },
      { id: "manage_categories", label: "Manage Categories", description: "Category taxonomy, banners, & navigation" },
      { id: "manage_brands", label: "Manage Brands", description: "Brand registries, logos, & showcase settings" },
      { id: "manage_suppliers", label: "Manage Suppliers", description: "Supplier directory, contacts, & catalog sync" },
    ],
  },
  {
    group: "Sales & Fulfillment",
    items: [
      { id: "manage_orders", label: "Manage Orders", description: "Inspect orders, update fulfillment, & tracking IDs" },
      { id: "manage_customers", label: "Manage Customers", description: "Customer accounts, addresses, & loyalty points" },
      { id: "manage_reviews", label: "Moderate Reviews", description: "Review approvals, replies, & rating moderation" },
      { id: "manage_transactions", label: "Payment & Transactions", description: "View transaction IDs, bKash & SSL verification" },
    ],
  },
  {
    group: "Marketing & Growth",
    items: [
      { id: "manage_coupons", label: "Discount Coupons", description: "Promotional campaigns, percentage & fixed vouchers" },
      { id: "manage_banners", label: "Hero & Promo Banners", description: "Storefront promo banners & announcement bars" },
      { id: "manage_seo", label: "SEO & Content", description: "Meta descriptions, keywords, & AI visibility" },
    ],
  },
  {
    group: "System & Governance",
    items: [
      { id: "manage_users", label: "Manage Staff", description: "Invite, update roles, & configure permissions" },
      { id: "manage_settings", label: "Store Settings", description: "Payment gateways, shipping methods, & tax" },
      { id: "view_reports", label: "Financial Reports", description: "Export CSVs, gross margins, & revenue analytics" },
    ],
  },
];

const ALL_PERMISSION_IDS = PERMISSION_GROUPS.flatMap((g) => g.items.map((i) => i.id));
const MANAGER_PRESET_IDS = [
  "manage_products",
  "manage_categories",
  "manage_brands",
  "manage_suppliers",
  "manage_orders",
  "manage_customers",
  "manage_reviews",
  "manage_coupons",
  "view_reports",
];
const STAFF_PRESET_IDS = ["manage_orders", "manage_customers", "manage_reviews"];

const DEPARTMENT_PRESETS = [
  "System Administration",
  "Inventory & Operations",
  "Customer Support & Dispatch",
  "E-Commerce & Merchandising",
  "Finance & Accounts",
  "Marketing & Promotions",
  "IT & Security",
];

// ==========================================
// ZOD VALIDATION SCHEMA
// ==========================================
const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  mobileNumber: z.string().optional(),
  department: z.string().min(1, "Department is required."),
  role: z.enum(["Admin", "Manager", "Staff"], { required_error: "Role is required." }),
  status: z.enum(["Active", "Inactive"], { required_error: "Status is required." }),
  avatar: z.string().optional(),
  bio: z.string().optional(),
  permissions: z.array(z.string()).default([]),
});

type UserFormData = z.infer<typeof userSchema>;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter and search states
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");

  // Modal dialog states
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [userToView, setUserToView] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState("profile");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { toast } = useToast();

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      mobileNumber: "",
      department: "Customer Support & Dispatch",
      role: "Staff",
      status: "Active",
      avatar: "",
      bio: "",
      permissions: STAFF_PRESET_IDS,
    },
  });

  // Watch role & permissions in form
  const currentRole = form.watch("role");
  const currentPermissions = form.watch("permissions") || [];
  const currentAvatar = form.watch("avatar");
  const currentName = form.watch("name");

  // Load staff records from Firestore or fallback
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const userList = usersSnapshot.docs.map((docSnap) => docToJSON(docSnap) as User);

      if (userList.length > 0) {
        setUsers(userList);
      } else {
        // Fallback to seed staff from placeholder
        const fallbackStaff: User[] = placeholderUsers
          .filter((u) => u.role !== "Customer")
          .map((u, idx) => ({
            ...u,
            id: u.uid || `staff_seed_${idx + 1}`,
            department: u.department || (u.role === "Admin" ? "System Administration" : u.role === "Manager" ? "Inventory & Operations" : "Customer Support & Dispatch"),
            permissions: u.permissions || (u.role === "Admin" ? ALL_PERMISSION_IDS : u.role === "Manager" ? MANAGER_PRESET_IDS : STAFF_PRESET_IDS),
            mobileNumber: u.mobileNumber || "+880 1711-000000",
            bio: u.bio || `Internal ${u.role} team member handling platform operations.`,
          }));
        setUsers(fallbackStaff);
      }
    } catch (error) {
      console.error("Failed to fetch users, using placeholder fallback:", error);
      const fallbackStaff: User[] = placeholderUsers
        .filter((u) => u.role !== "Customer")
        .map((u, idx) => ({
          ...u,
          id: u.uid || `staff_seed_${idx + 1}`,
          department: u.department || (u.role === "Admin" ? "System Administration" : u.role === "Manager" ? "Inventory & Operations" : "Customer Support & Dispatch"),
          permissions: u.permissions || (u.role === "Admin" ? ALL_PERMISSION_IDS : u.role === "Manager" ? MANAGER_PRESET_IDS : STAFF_PRESET_IDS),
          mobileNumber: u.mobileNumber || "+880 1711-000000",
          bio: u.bio || `Internal ${u.role} team member handling platform operations.`,
        }));
      setUsers(fallbackStaff);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter only staff members (exclude customers)
  const staffMembers = useMemo(() => {
    return users.filter((u) => u.role !== "Customer");
  }, [users]);

  // Derived filtered staff list
  const filteredStaff = useMemo(() => {
    return staffMembers.filter((staff) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        staff.name.toLowerCase().includes(q) ||
        staff.email.toLowerCase().includes(q) ||
        (staff.mobileNumber && staff.mobileNumber.toLowerCase().includes(q)) ||
        (staff.department && staff.department.toLowerCase().includes(q));

      const matchesRole = roleFilter === "all" || staff.role === roleFilter;
      const matchesStatus = statusFilter === "all" || staff.status === statusFilter;
      const matchesDept = departmentFilter === "all" || staff.department === departmentFilter;

      return matchesSearch && matchesRole && matchesStatus && matchesDept;
    });
  }, [staffMembers, searchQuery, roleFilter, statusFilter, departmentFilter]);

  // Metric stats
  const stats = useMemo(() => {
    const total = staffMembers.length;
    const admins = staffMembers.filter((u) => u.role === "Admin").length;
    const managers = staffMembers.filter((u) => u.role === "Manager").length;
    const active = staffMembers.filter((u) => u.status === "Active").length;
    return { total, admins, managers, active };
  }, [staffMembers]);

  // Unique departments for filter dropdown
  const uniqueDepartments = useMemo(() => {
    const depts = new Set<string>();
    staffMembers.forEach((s) => {
      if (s.department) depts.add(s.department);
    });
    return Array.from(depts);
  }, [staffMembers]);

  // Open Form Dialog (Add or Edit)
  const handleOpenForm = (user?: User | null) => {
    setActiveFormTab("profile");
    if (user) {
      setUserToEdit(user);
      form.reset({
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber || "",
        department: user.department || "Customer Support & Dispatch",
        role: user.role as "Admin" | "Manager" | "Staff",
        status: user.status,
        avatar: user.avatar || "",
        bio: user.bio || "",
        permissions: user.permissions || (user.role === "Admin" ? ALL_PERMISSION_IDS : user.role === "Manager" ? MANAGER_PRESET_IDS : STAFF_PRESET_IDS),
      });
    } else {
      setUserToEdit(null);
      form.reset({
        name: "",
        email: "",
        mobileNumber: "",
        department: "Customer Support & Dispatch",
        role: "Staff",
        status: "Active",
        avatar: "",
        bio: "",
        permissions: STAFF_PRESET_IDS,
      });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setUserToEdit(null);
  };

  // Open View Details Dialog
  const handleOpenView = (user: User) => {
    setUserToView(user);
    setIsViewOpen(true);
  };

  const handleCloseView = () => {
    setIsViewOpen(false);
    setUserToView(null);
  };

  // Switch from View to Edit
  const handleSwitchToEdit = () => {
    if (userToView) {
      const targetUser = userToView;
      handleCloseView();
      setTimeout(() => {
        handleOpenForm(targetUser);
      }, 150);
    }
  };

  // Quick preset application for permissions
  const handleApplyPermissionPreset = (preset: "admin" | "manager" | "staff" | "clear") => {
    if (preset === "admin") {
      form.setValue("permissions", ALL_PERMISSION_IDS, { shouldDirty: true });
    } else if (preset === "manager") {
      form.setValue("permissions", MANAGER_PRESET_IDS, { shouldDirty: true });
    } else if (preset === "staff") {
      form.setValue("permissions", STAFF_PRESET_IDS, { shouldDirty: true });
    } else {
      form.setValue("permissions", [], { shouldDirty: true });
    }
  };

  // Quick avatar generator
  const handleGenerateInitialsAvatar = () => {
    const name = form.getValues("name") || "Staff Member";
    const initial = encodeURIComponent(name.charAt(0).toUpperCase());
    const bgColors = ["4f46e5", "059669", "d97706", "dc2626", "0891b2", "7c3aed"];
    const randomBg = bgColors[Math.floor(Math.random() * bgColors.length)];
    const avatarUrl = `https://ui-avatars.com/api/?name=${initial}&background=${randomBg}&color=fff&size=160&bold=true`;
    form.setValue("avatar", avatarUrl, { shouldDirty: true });
  };

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "Copied to clipboard", description: text });
  };

  // Save handler (Add or Update)
  const onSubmit: SubmitHandler<UserFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      const finalAvatar =
        data.avatar?.trim() ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=0284c7&color=fff&size=160&bold=true`;

      if (userToEdit) {
        // Update existing user document
        const userDocRef = doc(db, "users", userToEdit.id);
        const updatedData: User = {
          ...userToEdit,
          name: data.name,
          email: data.email,
          mobileNumber: data.mobileNumber || "",
          department: data.department,
          role: data.role,
          status: data.status,
          avatar: finalAvatar,
          bio: data.bio || "",
          permissions: data.permissions,
        };

        try {
          await setDoc(userDocRef, updatedData);
        } catch (dbErr) {
          console.warn("Firestore update skipped, applying locally:", dbErr);
        }

        setUsers((prev) => prev.map((u) => (u.id === userToEdit.id ? updatedData : u)));
        toast({
          title: "Staff Member Updated",
          description: `${data.name}'s profile and access permissions have been saved.`,
        });
      } else {
        // Create new user document
        const newStaffDoc: Omit<User, "id"> = {
          uid: `staff_${Date.now()}`,
          name: data.name,
          email: data.email,
          mobileNumber: data.mobileNumber || "",
          department: data.department,
          role: data.role,
          status: data.status,
          avatar: finalAvatar,
          bio: data.bio || "",
          permissions: data.permissions,
          registeredDate: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          points: 100,
        };

        let newId = `staff_${Date.now()}`;
        try {
          const docRef = await addDoc(collection(db, "users"), newStaffDoc);
          newId = docRef.id;
        } catch (dbErr) {
          console.warn("Firestore insert skipped, applying locally:", dbErr);
        }

        const createdStaff: User = { ...newStaffDoc, id: newId };
        setUsers((prev) => [createdStaff, ...prev]);
        toast({
          title: "Staff Member Added",
          description: `${data.name} has been successfully added to internal staff.`,
        });
      }

      handleCloseForm();
    } catch (error) {
      console.error("Error saving user:", error);
      toast({
        variant: "destructive",
        title: "Error Saving Staff",
        description: "Failed to save staff member record. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete user handler
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      try {
        await deleteDoc(doc(db, "users", userToDelete.id));
      } catch (dbErr) {
        console.warn("Firestore delete skipped, applying locally:", dbErr);
      }

      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      toast({
        title: "Staff Member Removed",
        description: `${userToDelete.name} has been removed from internal staff.`,
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not remove staff member.",
      });
    } finally {
      setUserToDelete(null);
    }
  };

  // Helper for role badge colors
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "Admin":
        return (
          <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30 flex items-center gap-1">
            <ShieldAlert className="h-3 w-3" />
            Admin
          </Badge>
        );
      case "Manager":
        return (
          <Badge className="bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30 flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" />
            Manager
          </Badge>
        );
      default:
        return (
          <Badge className="bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-500/30 flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Staff
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* TOP HEADER & ACTION BAR                                  */}
      {/* ========================================================= */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Staff & Access Control</h1>
            <Badge variant="outline" className="border-primary/30 text-primary">
              Internal Team
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Manage administrative staff, departmental roles, and granular access permissions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchUsers} disabled={isLoading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button onClick={() => handleOpenForm()} className="gap-2 shadow-sm">
            <UserPlus className="h-4 w-4" />
            <span>Add Staff Member</span>
          </Button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* METRIC CARDS                                             */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="border-border/60 shadow-sm bg-gradient-to-br from-card to-card/50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Staff</p>
              <h3 className="text-2xl font-bold">{stats.total}</h3>
              <p className="text-[11px] text-muted-foreground">Authorized team members</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm bg-gradient-to-br from-card to-card/50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Administrators</p>
              <h3 className="text-2xl font-bold text-rose-600 dark:text-rose-400">{stats.admins}</h3>
              <p className="text-[11px] text-muted-foreground">Full system access</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm bg-gradient-to-br from-card to-card/50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Managers</p>
              <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.managers}</h3>
              <p className="text-[11px] text-muted-foreground">Catalog & order supervisors</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm bg-gradient-to-br from-card to-card/50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Staff</p>
              <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.active}</h3>
              <p className="text-[11px] text-muted-foreground">Login permitted</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ========================================================= */}
      {/* FILTER & SEARCH TOOLBAR                                   */}
      {/* ========================================================= */}
      <Card className="border-border/60 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search staff by name, email, phone, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background/50"
              />
            </div>

            {/* Dropdown Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Role filter */}
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[130px] h-9 text-xs">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Staff">Staff</SelectItem>
                </SelectContent>
              </Select>

              {/* Status filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[125px] h-9 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              {/* Department filter */}
              {uniqueDepartments.length > 0 && (
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-[160px] h-9 text-xs">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {uniqueDepartments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Reset filter button */}
              {(searchQuery || roleFilter !== "all" || statusFilter !== "all" || departmentFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setRoleFilter("all");
                    setStatusFilter("all");
                    setDepartmentFilter("all");
                  }}
                  className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  Reset
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================= */}
      {/* STAFF TABLE                                              */}
      {/* ========================================================= */}
      <Card className="border-border/60 shadow-sm overflow-hidden">
        <CardHeader className="p-4 sm:p-6 border-b bg-muted/20">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Staff Directory</CardTitle>
              <CardDescription>
                Showing {filteredStaff.length} of {staffMembers.length} staff accounts
              </CardDescription>
            </div>
            <Badge variant="secondary" className="font-mono text-xs">
              {filteredStaff.length} Result{filteredStaff.length === 1 ? "" : "s"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-[280px]">Staff Member</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Registered</TableHead>
                <TableHead className="hidden lg:table-cell">Last Login</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="h-7 w-7 animate-spin text-primary" />
                      <p className="text-xs text-muted-foreground">Loading staff accounts...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredStaff.length > 0 ? (
                filteredStaff.map((staff) => (
                  <TableRow key={staff.id} className="hover:bg-muted/40 transition-colors">
                    {/* Member & Email */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-border shadow-xs">
                          <AvatarImage src={staff.avatar} alt={staff.name} />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                            {staff.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium text-sm text-foreground truncate">{staff.name}</span>
                          <span className="text-xs text-muted-foreground truncate">{staff.email}</span>
                          {staff.mobileNumber && (
                            <span className="text-[11px] text-muted-foreground/80 flex items-center gap-1 mt-0.5">
                              <Phone className="h-3 w-3" />
                              {staff.mobileNumber}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Department */}
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs text-foreground/80">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate max-w-[140px]">{staff.department || "Operations"}</span>
                      </div>
                    </TableCell>

                    {/* Role */}
                    <TableCell>{getRoleBadge(staff.role)}</TableCell>

                    {/* Status */}
                    <TableCell>
                      {staff.status === "Active" ? (
                        <Badge variant="outline" className="border-emerald-500/40 text-emerald-600 bg-emerald-500/10 gap-1.5 text-xs font-medium">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-muted text-muted-foreground bg-muted/40 gap-1.5 text-xs">
                          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                          Inactive
                        </Badge>
                      )}
                    </TableCell>

                    {/* Registered Date */}
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                      {staff.registeredDate ? format(new Date(staff.registeredDate), "MMM d, yyyy") : "N/A"}
                    </TableCell>

                    {/* Last Login */}
                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                      {staff.lastLogin ? format(new Date(staff.lastLogin), "MMM d, h:mm a") : "Never"}
                    </TableCell>

                    {/* Actions Menu */}
                    <TableCell className="text-right pr-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost" className="h-8 w-8 hover:bg-muted">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuLabel>Staff Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleOpenView(staff)} className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4 text-primary" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenForm(staff)} className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4 text-indigo-600" />
                            Edit Staff Member
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive cursor-pointer focus:text-destructive"
                            onClick={() => setUserToDelete(staff)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove Staff
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="h-8 w-8 text-muted-foreground/50" />
                      <p className="text-sm font-medium">No staff members found</p>
                      <p className="text-xs text-muted-foreground">
                        {searchQuery || roleFilter !== "all" || statusFilter !== "all"
                          ? "Try adjusting your search filters"
                          : "Click 'Add Staff Member' to register team members"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ========================================================= */}
      {/* ADD / EDIT STAFF MEMBER MODAL                             */}
      {/* ========================================================= */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-2xl lg:max-w-3xl max-h-[92vh] flex flex-col p-0 overflow-hidden shadow-2xl">
          {/* Pinned Header */}
          <DialogHeader className="p-6 pb-4 border-b bg-muted/20 shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                {userToEdit ? <Edit className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
              </div>
              <div className="min-w-0 pr-8">
                <DialogTitle className="text-xl font-bold truncate">
                  {userToEdit ? `Edit Staff Member: ${userToEdit.name}` : "Add New Staff Member"}
                </DialogTitle>
                <DialogDescription className="text-xs mt-0.5">
                  {userToEdit
                    ? "Update contact credentials, assigned department, and granular administrative permissions."
                    : "Register an internal team member, select their role, and assign administrative permissions."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Modal Form with 3 Tabs */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
              <Tabs
                value={activeFormTab}
                onValueChange={setActiveFormTab}
                className="flex-1 flex flex-col min-h-0"
              >
                {/* Pinned Tab Bar */}
                <div className="px-6 pt-3 pb-2 border-b bg-background shrink-0">
                  <TabsList className="grid grid-cols-3 w-full h-10">
                    <TabsTrigger value="profile" className="text-xs gap-1.5">
                      <UserCheck className="h-3.5 w-3.5" />
                      <span>Profile & Account</span>
                    </TabsTrigger>
                    <TabsTrigger value="role" className="text-xs gap-1.5">
                      <Shield className="h-3.5 w-3.5" />
                      <span>Role & Department</span>
                    </TabsTrigger>
                    <TabsTrigger value="permissions" className="text-xs gap-1.5">
                      <Key className="h-3.5 w-3.5" />
                      <span>Permissions ({currentPermissions.length})</span>
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Scrollable Tab Content Container */}
                <div className="flex-1 overflow-y-auto modal-scrollbar p-6 space-y-6">
                  {/* TAB 1: PROFILE & CONTACT */}
                  <TabsContent value="profile" className="mt-0 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Full Name */}
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold">
                              Full Name <span className="text-rose-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Tanvir Rahman" {...field} />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      {/* Email Address */}
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold">
                              Work Email <span className="text-rose-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="staff@example.com" {...field} />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      {/* Phone / Mobile */}
                      <FormField
                        control={form.control}
                        name="mobileNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold">Mobile / Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="+880 1711-234567" {...field} />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      {/* Department */}
                      <FormField
                        control={form.control}
                        name="department"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold">
                              Department <span className="text-rose-500">*</span>
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Department" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {DEPARTMENT_PRESETS.map((dept) => (
                                  <SelectItem key={dept} value={dept}>
                                    {dept}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Avatar URL & Generator */}
                    <div className="space-y-3 pt-2 border-t border-border/50">
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-xs font-semibold">Profile Avatar</FormLabel>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleGenerateInitialsAvatar}
                          className="h-7 text-xs gap-1"
                        >
                          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                          Auto Generate Avatar
                        </Button>
                      </div>

                      <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 border-2 border-primary/20 shrink-0 shadow-sm">
                          <AvatarImage src={currentAvatar} alt={currentName || "Staff"} />
                          <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {(currentName || "Staff")
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-1.5">
                          <FormField
                            control={form.control}
                            name="avatar"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input placeholder="https://images.unsplash.com/... or auto-generate" {...field} />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                          <p className="text-[11px] text-muted-foreground">
                            Provide an image URL or click Auto Generate to create a colorful initials avatar.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Staff Bio / Responsibilities */}
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem className="pt-2 border-t border-border/50">
                          <FormLabel className="text-xs font-semibold">Role Responsibilities / Bio</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Brief description of duties, warehouse coverage, or customer tier responsibilities..."
                              className="resize-none h-20 text-xs"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  {/* TAB 2: ROLE & DEPARTMENT */}
                  <TabsContent value="role" className="mt-0 space-y-5">
                    {/* Role Selection Cards */}
                    <div className="space-y-3">
                      <FormLabel className="text-xs font-semibold">Select Administrative Authority</FormLabel>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Admin Card */}
                        <div
                          onClick={() => {
                            form.setValue("role", "Admin", { shouldDirty: true });
                            handleApplyPermissionPreset("admin");
                          }}
                          className={`cursor-pointer rounded-xl border p-4 transition-all ${
                            currentRole === "Admin"
                              ? "border-rose-500 bg-rose-500/10 shadow-sm ring-1 ring-rose-500"
                              : "border-border hover:border-rose-300 hover:bg-muted/30"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="h-8 w-8 rounded-lg bg-rose-500/20 text-rose-600 flex items-center justify-center">
                              <ShieldAlert className="h-4 w-4" />
                            </div>
                            {currentRole === "Admin" && (
                              <Badge className="bg-rose-500 text-white text-[10px] h-5 px-1.5">Selected</Badge>
                            )}
                          </div>
                          <h4 className="font-semibold text-sm">Administrator</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            Full root authority over settings, financial ledgers, staff access, and API configurations.
                          </p>
                        </div>

                        {/* Manager Card */}
                        <div
                          onClick={() => {
                            form.setValue("role", "Manager", { shouldDirty: true });
                            handleApplyPermissionPreset("manager");
                          }}
                          className={`cursor-pointer rounded-xl border p-4 transition-all ${
                            currentRole === "Manager"
                              ? "border-indigo-500 bg-indigo-500/10 shadow-sm ring-1 ring-indigo-500"
                              : "border-border hover:border-indigo-300 hover:bg-muted/30"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="h-8 w-8 rounded-lg bg-indigo-500/20 text-indigo-600 flex items-center justify-center">
                              <ShieldCheck className="h-4 w-4" />
                            </div>
                            {currentRole === "Manager" && (
                              <Badge className="bg-indigo-500 text-white text-[10px] h-5 px-1.5">Selected</Badge>
                            )}
                          </div>
                          <h4 className="font-semibold text-sm">Manager</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            Supervises product catalog, categories, supplier logistics, order queues, and coupons.
                          </p>
                        </div>

                        {/* Staff Card */}
                        <div
                          onClick={() => {
                            form.setValue("role", "Staff", { shouldDirty: true });
                            handleApplyPermissionPreset("staff");
                          }}
                          className={`cursor-pointer rounded-xl border p-4 transition-all ${
                            currentRole === "Staff"
                              ? "border-emerald-500 bg-emerald-500/10 shadow-sm ring-1 ring-emerald-500"
                              : "border-border hover:border-emerald-300 hover:bg-muted/30"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
                              <Shield className="h-4 w-4" />
                            </div>
                            {currentRole === "Staff" && (
                              <Badge className="bg-emerald-500 text-white text-[10px] h-5 px-1.5">Selected</Badge>
                            )}
                          </div>
                          <h4 className="font-semibold text-sm">Support Staff</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            Day-to-day operations: managing customer inquiries, order status updates, and review moderation.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Account Status Switch / Select */}
                    <div className="pt-3 border-t border-border/50">
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-xs font-semibold">Account Login Status</FormLabel>
                            <div className="flex items-center gap-3">
                              <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select Status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Active">Active (Permitted)</SelectItem>
                                  <SelectItem value="Inactive">Inactive (Suspended)</SelectItem>
                                </SelectContent>
                              </Select>
                              <span className="text-xs text-muted-foreground">
                                {field.value === "Active"
                                  ? "Account is enabled for admin dashboard login."
                                  : "Account is disabled. Login will be rejected."}
                              </span>
                            </div>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Authentication Notice Card */}
                    <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 flex items-start gap-3">
                      <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                      <div className="space-y-1 text-xs">
                        <p className="font-semibold text-blue-900 dark:text-blue-200">
                          Firebase Authentication Credentials
                        </p>
                        <p className="text-blue-700/90 dark:text-blue-300/80 leading-relaxed">
                          Staff members sign in using their registered work email address. If they have not set an initial password yet, they can initialize it via the password reset portal or standard Firebase Auth invite link.
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  {/* TAB 3: PERMISSIONS MATRIX */}
                  <TabsContent value="permissions" className="mt-0 space-y-5">
                    {/* Presets Row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-muted/40 border border-border/60">
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-primary" />
                        <span className="text-xs font-semibold">Quick Presets:</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleApplyPermissionPreset("admin")}
                          className="h-7 text-xs"
                        >
                          All (Admin)
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleApplyPermissionPreset("manager")}
                          className="h-7 text-xs"
                        >
                          Manager Preset
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleApplyPermissionPreset("staff")}
                          className="h-7 text-xs"
                        >
                          Support Preset
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleApplyPermissionPreset("clear")}
                          className="h-7 text-xs text-muted-foreground hover:text-destructive"
                        >
                          Clear All
                        </Button>
                      </div>
                    </div>

                    {/* Permissions Grid Grouped */}
                    <div className="space-y-4">
                      {PERMISSION_GROUPS.map((group) => (
                        <div key={group.group} className="space-y-2.5">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
                            {group.group}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                            {group.items.map((perm) => {
                              const isChecked = currentPermissions.includes(perm.id);
                              return (
                                <div
                                  key={perm.id}
                                  onClick={() => {
                                    const next = isChecked
                                      ? currentPermissions.filter((id) => id !== perm.id)
                                      : [...currentPermissions, perm.id];
                                    form.setValue("permissions", next, { shouldDirty: true });
                                  }}
                                  className={`cursor-pointer rounded-lg border p-3 flex items-start gap-3 transition-colors ${
                                    isChecked
                                      ? "border-primary/50 bg-primary/5"
                                      : "border-border/60 hover:bg-muted/30"
                                  }`}
                                >
                                  <Checkbox
                                    checked={isChecked}
                                    onCheckedChange={(checked) => {
                                      const next = checked
                                        ? [...currentPermissions, perm.id]
                                        : currentPermissions.filter((id) => id !== perm.id);
                                      form.setValue("permissions", next, { shouldDirty: true });
                                    }}
                                    className="mt-0.5"
                                  />
                                  <div className="space-y-0.5 min-w-0">
                                    <p className="text-xs font-semibold leading-tight">{perm.label}</p>
                                    <p className="text-[11px] text-muted-foreground leading-snug">
                                      {perm.description}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </div>
              </Tabs>

              {/* Pinned Action Footer */}
              <DialogFooter className="p-4 px-6 border-t bg-muted/20 shrink-0 flex items-center justify-between sm:justify-between">
                <Button type="button" variant="outline" size="sm" onClick={handleCloseForm}>
                  Cancel
                </Button>
                <div className="flex items-center gap-2">
                  {activeFormTab !== "permissions" && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (activeFormTab === "profile") setActiveFormTab("role");
                        else if (activeFormTab === "role") setActiveFormTab("permissions");
                      }}
                      className="text-xs"
                    >
                      Next Step →
                    </Button>
                  )}
                  <Button type="submit" size="sm" disabled={isSubmitting} className="gap-2">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Saving Staff...</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-4 w-4" />
                        <span>{userToEdit ? "Save Changes" : "Create Staff Member"}</span>
                      </>
                    )}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* VIEW DETAILS MODAL                                        */}
      {/* ========================================================= */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-2xl lg:max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden shadow-2xl">
          {userToView && (
            <>
              {/* Pinned Header */}
              <DialogHeader className="p-6 pb-4 border-b bg-muted/20 shrink-0">
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14 border-2 border-primary/20 shrink-0 shadow-sm">
                    <AvatarImage src={userToView.avatar} alt={userToView.name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-base">
                      {userToView.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 pr-8">
                    <div className="flex flex-wrap items-center gap-2">
                      <DialogTitle className="text-xl font-bold truncate">{userToView.name}</DialogTitle>
                      {getRoleBadge(userToView.role)}
                      {userToView.status === "Active" ? (
                        <Badge variant="outline" className="border-emerald-500/40 text-emerald-600 bg-emerald-500/10 text-[11px]">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground text-[11px]">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                      <span>{userToView.email}</span>
                      {userToView.department && (
                        <>
                          <span>•</span>
                          <span className="font-medium text-foreground/80">{userToView.department}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </DialogHeader>

              {/* Scrollable Inspector Body */}
              <div className="flex-1 overflow-y-auto modal-scrollbar p-6 space-y-6">
                {/* Highlights Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-xl border p-3 bg-muted/20">
                    <p className="text-[11px] text-muted-foreground uppercase font-medium">Department</p>
                    <p className="text-xs font-semibold mt-1 truncate">{userToView.department || "Operations"}</p>
                  </div>
                  <div className="rounded-xl border p-3 bg-muted/20">
                    <p className="text-[11px] text-muted-foreground uppercase font-medium">Phone Number</p>
                    <p className="text-xs font-semibold mt-1 truncate">{userToView.mobileNumber || "Not recorded"}</p>
                  </div>
                  <div className="rounded-xl border p-3 bg-muted/20">
                    <p className="text-[11px] text-muted-foreground uppercase font-medium">Registered Date</p>
                    <p className="text-xs font-semibold mt-1 truncate">
                      {userToView.registeredDate ? format(new Date(userToView.registeredDate), "MMM d, yyyy") : "N/A"}
                    </p>
                  </div>
                  <div className="rounded-xl border p-3 bg-muted/20">
                    <p className="text-[11px] text-muted-foreground uppercase font-medium">Last Login</p>
                    <p className="text-xs font-semibold mt-1 truncate">
                      {userToView.lastLogin ? format(new Date(userToView.lastLogin), "MMM d, h:mm a") : "Never"}
                    </p>
                  </div>
                </div>

                {/* Bio / Responsibilities */}
                {userToView.bio && (
                  <div className="rounded-xl border p-4 bg-muted/10 space-y-1.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Staff Overview & Scope
                    </h4>
                    <p className="text-xs text-foreground/90 leading-relaxed">{userToView.bio}</p>
                  </div>
                )}

                {/* Assigned Permissions Inspection */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Assigned Permissions ({userToView.permissions?.length || 0} of {ALL_PERMISSION_IDS.length})
                    </h4>
                    <Badge variant="outline" className="text-[10px]">
                      {userToView.role} Authority
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {PERMISSION_GROUPS.flatMap((g) => g.items).map((perm) => {
                      const hasPerm = (userToView.permissions || []).includes(perm.id);
                      return (
                        <div
                          key={perm.id}
                          className={`rounded-lg border p-2.5 flex items-center justify-between text-xs ${
                            hasPerm
                              ? "border-emerald-500/30 bg-emerald-500/5 text-foreground"
                              : "border-border/40 bg-muted/15 text-muted-foreground opacity-60"
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <p className="font-medium truncate">{perm.label}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{perm.description}</p>
                          </div>
                          {hasPerm ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                          ) : (
                            <XCircle className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* System Identifiers & Security */}
                <div className="rounded-xl border p-4 bg-muted/20 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    System & Authentication Identifiers
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-background border">
                      <span className="text-muted-foreground text-[11px]">Database Doc ID:</span>
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <span>{userToView.id.slice(0, 16)}...</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopy(userToView.id, "docId")}
                          className="h-6 w-6"
                        >
                          {copiedId === "docId" ? (
                            <Check className="h-3 w-3 text-emerald-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-background border">
                      <span className="text-muted-foreground text-[11px]">Firebase Auth UID:</span>
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <span>{userToView.uid.slice(0, 16)}...</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopy(userToView.uid, "uid")}
                          className="h-6 w-6"
                        >
                          {copiedId === "uid" ? (
                            <Check className="h-3 w-3 text-emerald-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pinned Footer */}
              <DialogFooter className="p-4 px-6 border-t bg-muted/20 shrink-0 flex items-center justify-between sm:justify-between">
                <Button variant="outline" size="sm" onClick={handleCloseView}>
                  Close
                </Button>
                <Button size="sm" onClick={handleSwitchToEdit} className="gap-2">
                  <Edit className="h-4 w-4" />
                  <span>Edit Staff Member</span>
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* DELETE CONFIRMATION ALERT DIALOG                          */}
      {/* ========================================================= */}
      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <ShieldAlert className="h-5 w-5" />
              Remove Staff Account?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs leading-relaxed">
              This action will permanently revoke administrative access and delete the internal record for{" "}
              <strong className="text-foreground">{userToDelete?.name}</strong> ({userToDelete?.email}). They will no
              longer be able to access the admin dashboard or fulfill store operations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Confirm Revocation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
