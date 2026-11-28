"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  Send,
  ExternalLink,
  MessageSquare,
  Inbox,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  RefreshCw,
  Search,
  Building2,
  Settings,
  Sparkles,
  ArrowUpRight,
  Filter,
} from "lucide-react";
import { doc, getDoc, setDoc } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: "unread" | "read" | "replied";
  createdAt: string;
  adminRecipient?: string;
  mailDispatched?: boolean;
  mailSimulated?: boolean;
};

type StoreSettings = {
  storeName: string;
  companyName: string;
  storeTagline: string;
  logo: string;
  address: string;
  phone: string;
  email: string;
  contactNotificationEmail?: string;
};

const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: "eMotionView",
  companyName: "eMotionView Ltd.",
  storeTagline: "The Biggest Smart Gadget & SmartPhone Collection in Bangladesh",
  logo: "/api/r2/proxy?key=general%2F1780921429643-motion-logo.webp",
  address: "10/25 (9th Commercial Floor), Eastern Plaza, 70 Bir Uttam C.R Datta Road, Hatirpool, Dhaka-1205",
  phone: "09677460460",
  email: "motionview22@gmail.com.bd",
  contactNotificationEmail: "motionview22@gmail.com.bd",
};

export default function ContactUsSettingsPage() {
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("inbox");
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "unread" | "read" | "replied">("all");

  // Selected Message Modal
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Notification Email Override in Page Settings
  const [customNotificationEmail, setCustomNotificationEmail] = useState("");
  const [isSavingEmail, setIsSavingEmail] = useState(false);

  // Fetch messages and general settings
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch General Settings
      const docRef = doc({} as any, "settings", "general");
      const docSnap = await getDoc(docRef);
      if (docSnap && docSnap.exists()) {
        const data = docSnap.data();
        const loaded: StoreSettings = {
          storeName: data.storeName || DEFAULT_STORE_SETTINGS.storeName,
          companyName: data.companyName || DEFAULT_STORE_SETTINGS.companyName,
          storeTagline: data.storeTagline || DEFAULT_STORE_SETTINGS.storeTagline,
          logo: data.logo || DEFAULT_STORE_SETTINGS.logo,
          address: data.address || DEFAULT_STORE_SETTINGS.address,
          phone: data.phone || DEFAULT_STORE_SETTINGS.phone,
          email: data.email || DEFAULT_STORE_SETTINGS.email,
          contactNotificationEmail: data.contactNotificationEmail || data.email || DEFAULT_STORE_SETTINGS.email,
        };
        setStoreSettings(loaded);
        setCustomNotificationEmail(loaded.contactNotificationEmail || loaded.email);
      }

      // 2. Fetch Contact Messages from API
      const res = await fetch("/api/contact");
      if (res.ok) {
        const resData = await res.json();
        if (resData.success && Array.isArray(resData.messages)) {
          setMessages(resData.messages);
        }
      }
    } catch (err) {
      console.error("Error loading contact settings & messages:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load contact messages or store settings.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter messages
  const filteredMessages = messages.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.message.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const unreadCount = messages.filter((m) => m.status === "unread").length;
  const repliedCount = messages.filter((m) => m.status === "replied").length;

  // View full message detail
  const handleOpenDetail = async (msg: ContactMessage) => {
    setSelectedMessage(msg);
    setIsDetailModalOpen(true);

    // If message is unread, automatically mark as read
    if (msg.status === "unread") {
      try {
        await fetch("/api/contact", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: msg.id, status: "read" }),
        });
        setMessages((prev) =>
          prev.map((item) => (item.id === msg.id ? { ...item, status: "read" } : item))
        );
        setSelectedMessage({ ...msg, status: "read" });
      } catch (err) {
        console.error("Failed to auto-mark read:", err);
      }
    }
  };

  // Change status of selected message
  const handleUpdateStatus = async (newStatus: "unread" | "read" | "replied") => {
    if (!selectedMessage) return;
    setIsUpdatingStatus(true);
    try {
      const res = await fetch("/api/contact", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedMessage.id, status: newStatus }),
      });
      if (!res.ok) throw new Error("Status update failed");

      setMessages((prev) =>
        prev.map((item) => (item.id === selectedMessage.id ? { ...item, status: newStatus } : item))
      );
      setSelectedMessage((prev) => (prev ? { ...prev, status: newStatus } : null));

      toast({
        title: "Status Updated",
        description: `Inquiry marked as ${newStatus}.`,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update inquiry status.",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Delete message
  const handleDeleteMessage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this inquiry message?")) return;
    try {
      const res = await fetch(`/api/contact?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");

      setMessages((prev) => prev.filter((item) => item.id !== id));
      if (selectedMessage?.id === id) {
        setIsDetailModalOpen(false);
      }
      toast({ title: "Deleted", description: "Message removed successfully." });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Could not delete message." });
    }
  };

  // Save Designated Notification Email
  const handleSaveNotificationEmail = async () => {
    if (!customNotificationEmail.trim() || !customNotificationEmail.includes("@")) {
      toast({ variant: "destructive", title: "Invalid Email", description: "Please enter a valid email address." });
      return;
    }

    setIsSavingEmail(true);
    try {
      const docRef = doc({} as any, "settings", "general");
      await setDoc(docRef, { contactNotificationEmail: customNotificationEmail.trim() }, { merge: true });

      setStoreSettings((prev) => ({
        ...prev,
        contactNotificationEmail: customNotificationEmail.trim(),
      }));

      toast({
        title: "Settings Saved",
        description: `Contact submissions will now notify: ${customNotificationEmail.trim()}`,
      });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update notification email." });
    } finally {
      setIsSavingEmail(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Contact Us Page & Inquiries</h1>
            <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
              Active Two-Column UI
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage contact details, routing email, view customer form submissions, and inspect the live storefront page.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button asChild variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
            <Link href="/contact" target="_blank" rel="noopener noreferrer">
              <span>View Live /contact</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </Button>

          <Button asChild variant="default" size="sm" className="h-9 gap-1.5 text-xs">
            <Link href="/admin/settings/general">
              <Settings className="h-3.5 w-3.5" />
              <span>General Settings</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Designated Notification Email */}
        <Card className="border border-border/60 shadow-xs">
          <CardHeader className="p-4 pb-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase flex items-center justify-between">
              <span>Designated Email</span>
              <Mail className="h-4 w-4 text-primary" />
            </p>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <p className="text-sm font-bold text-foreground truncate font-mono">
              {storeSettings.contactNotificationEmail || storeSettings.email}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">Configured in General Settings</p>
          </CardContent>
        </Card>

        {/* Total Inquiries */}
        <Card className="border border-border/60 shadow-xs">
          <CardHeader className="p-4 pb-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase flex items-center justify-between">
              <span>Total Inquiries</span>
              <Inbox className="h-4 w-4 text-sky-500" />
            </p>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <p className="text-2xl font-extrabold text-foreground font-mono">{messages.length}</p>
            <p className="text-[11px] text-muted-foreground mt-1">Recorded via storefront form</p>
          </CardContent>
        </Card>

        {/* Unread Inquiries */}
        <Card className="border border-border/60 shadow-xs">
          <CardHeader className="p-4 pb-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase flex items-center justify-between">
              <span>Pending Review</span>
              <MessageSquare className="h-4 w-4 text-amber-500" />
            </p>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="flex items-center gap-2">
              <p className="text-2xl font-extrabold text-amber-600 font-mono">{unreadCount}</p>
              {unreadCount > 0 && (
                <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/30">
                  New
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">{repliedCount} marked as replied</p>
          </CardContent>
        </Card>

        {/* Captcha Security */}
        <Card className="border border-border/60 shadow-xs">
          <CardHeader className="p-4 pb-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase flex items-center justify-between">
              <span>Anti-Spam Security</span>
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
            </p>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-mono">
                5 + 4 = [ ]
              </Badge>
              <span className="text-xs font-semibold text-foreground">Active</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Randomized arithmetic challenge</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted/50 p-1 border">
          <TabsTrigger value="inbox" className="text-xs gap-2">
            <Inbox className="h-3.5 w-3.5" />
            <span>Inquiries Inbox</span>
            {unreadCount > 0 && (
              <Badge className="h-4 px-1.5 text-[10px] bg-primary text-primary-foreground ml-1">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-xs gap-2">
            <Settings className="h-3.5 w-3.5" />
            <span>Notification & Email Routing</span>
          </TabsTrigger>
          <TabsTrigger value="preview" className="text-xs gap-2">
            <Eye className="h-3.5 w-3.5" />
            <span>Storefront 2-Column Preview</span>
          </TabsTrigger>
        </TabsList>

        {/* ========================================================= */}
        {/* TAB 1: INQUIRIES INBOX                                    */}
        {/* ========================================================= */}
        <TabsContent value="inbox" className="space-y-4">
          <Card className="border border-border/60 shadow-xs">
            <CardHeader className="p-4 sm:p-6 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    Customer Inquiries & Messages
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Messages submitted via the contact form on /contact.
                  </CardDescription>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Status Filters */}
                  <div className="flex items-center rounded-lg border bg-muted/30 p-0.5 text-xs">
                    {(["all", "unread", "read", "replied"] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStatusFilter(s)}
                        className={`px-2.5 py-1 rounded-md capitalize font-medium transition-colors ${
                          statusFilter === s
                            ? "bg-background text-foreground shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchData}
                    className="h-8 text-xs gap-1.5"
                    title="Refresh messages"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Refresh</span>
                  </Button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="pt-3">
                <div className="relative">
                  <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search messages by customer name, email, subject, or keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9 pl-9 text-xs"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="w-[180px]">Customer</TableHead>
                    <TableHead className="w-[160px]">Topic / Subject</TableHead>
                    <TableHead className="hidden md:table-cell">Message Excerpt</TableHead>
                    <TableHead className="w-[110px]">Status</TableHead>
                    <TableHead className="w-[130px] hidden sm:table-cell">Received</TableHead>
                    <TableHead className="text-right pr-6 w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-xs text-muted-foreground">
                        <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
                        Loading contact submissions...
                      </TableCell>
                    </TableRow>
                  ) : filteredMessages.length > 0 ? (
                    filteredMessages.map((msg) => (
                      <TableRow
                        key={msg.id}
                        className={`hover:bg-muted/40 transition-colors ${
                          msg.status === "unread" ? "bg-primary/[0.02] font-medium" : ""
                        }`}
                      >
                        {/* Customer */}
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-foreground truncate max-w-[170px]">
                              {msg.name}
                            </span>
                            <span className="text-[11px] text-muted-foreground truncate max-w-[170px]">
                              {msg.email}
                            </span>
                            {msg.phone && (
                              <span className="text-[10px] text-muted-foreground font-mono">{msg.phone}</span>
                            )}
                          </div>
                        </TableCell>

                        {/* Subject */}
                        <TableCell>
                          <Badge variant="outline" className="text-[11px] font-medium max-w-[150px] truncate block">
                            {msg.subject}
                          </Badge>
                        </TableCell>

                        {/* Message Preview */}
                        <TableCell className="hidden md:table-cell">
                          <p className="text-xs text-muted-foreground truncate max-w-sm">{msg.message}</p>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-[10px] uppercase font-semibold ${
                              msg.status === "unread"
                                ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                                : msg.status === "replied"
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                                : "bg-muted text-muted-foreground border-border"
                            }`}
                          >
                            {msg.status}
                          </Badge>
                        </TableCell>

                        {/* Received Time */}
                        <TableCell className="text-xs text-muted-foreground hidden sm:table-cell font-mono">
                          {msg.createdAt ? format(new Date(msg.createdAt), "MMM d, h:mm a") : "Recent"}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right pr-6">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDetail(msg)}
                              className="h-7 px-2 text-xs gap-1"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">View</span>
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-600"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-36 text-center text-xs text-muted-foreground">
                        <Inbox className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                        No contact inquiries found matching your filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========================================================= */}
        {/* TAB 2: NOTIFICATION & EMAIL ROUTING CONFIGURATION         */}
        {/* ========================================================= */}
        <TabsContent value="settings" className="space-y-4">
          <Card className="border border-border/60 shadow-xs">
            <CardHeader className="p-6 pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                Contact Form Notification Email Destination
              </CardTitle>
              <CardDescription className="text-xs">
                Submissions from the /contact form are sent directly to this address. By default, it inherits from Store Email in General Settings.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 pt-0 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="notification-email" className="text-xs font-semibold">
                    Notification Recipient Email
                  </Label>
                  <Input
                    id="notification-email"
                    type="email"
                    value={customNotificationEmail}
                    onChange={(e) => setCustomNotificationEmail(e.target.value)}
                    placeholder="e.g. admin@emotionview.com.bd"
                    className="h-10 text-sm font-mono"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Inquiries submitted by customers are automatically emailed to this inbox.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Current General Settings Store Email</Label>
                  <div className="h-10 px-3 rounded-md border bg-muted/40 flex items-center font-mono text-xs text-muted-foreground">
                    {storeSettings.email}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    <Link href="/admin/settings/general" className="text-primary hover:underline">
                      Click here to edit General Settings store info
                    </Link>
                  </p>
                </div>
              </div>

              {/* Anti-Spam Security Indicator */}
              <div className="rounded-xl border bg-muted/20 p-4 space-y-2">
                <div className="flex items-center gap-2 text-foreground font-semibold text-xs">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span>Math Captcha Verification (5 + 4 = [ ])</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Every contact submission requires solving a randomized math question (such as 5 + 4 = 9) before submission is accepted. This eliminates automated spam bots and protects the server without intrusive third-party cookie trackers.
                </p>
              </div>
            </CardContent>

            <CardFooter className="p-6 pt-0 border-t border-border/50 flex justify-end gap-2">
              <Button
                onClick={handleSaveNotificationEmail}
                disabled={isSavingEmail}
                className="text-xs gap-1.5"
              >
                {isSavingEmail ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Save Designated Email</span>
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* ========================================================= */}
        {/* TAB 3: LIVE 2-COLUMN PREVIEW                              */}
        {/* ========================================================= */}
        <TabsContent value="preview" className="space-y-4">
          <Card className="border border-border/60 shadow-xs">
            <CardHeader className="p-4 sm:p-6 pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">Two-Column Contact Page Layout Preview</CardTitle>
                  <CardDescription className="text-xs">
                    Left: Form with submissions & math captcha • Right: Store name, Logo, email, hotline & address.
                  </CardDescription>
                </div>
                <Button asChild variant="outline" size="sm" className="h-8 text-xs gap-1">
                  <Link href="/contact" target="_blank">
                    <span>Open Live Page</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6">
              <div className="rounded-xl border p-4 sm:p-6 bg-muted/10 grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Mini-Preview */}
                <div className="lg:col-span-7 rounded-lg border bg-card p-4 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-bold text-xs flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5 text-primary" />
                      Contact Form (Left Side)
                    </span>
                    <Badge variant="outline" className="text-[10px]">Customer Facing</Badge>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="h-7 rounded border bg-muted/20 px-2 flex items-center text-muted-foreground text-[11px]">
                      Full Name *
                    </div>
                    <div className="h-7 rounded border bg-muted/20 px-2 flex items-center text-muted-foreground text-[11px]">
                      Email Address *
                    </div>
                    <div className="h-7 rounded border bg-muted/20 px-2 flex items-center text-muted-foreground text-[11px]">
                      Phone Number
                    </div>
                    <div className="h-7 rounded border bg-muted/20 px-2 flex items-center text-muted-foreground text-[11px]">
                      Inquiry Subject (Dropdown)
                    </div>
                    <div className="h-16 rounded border bg-muted/20 p-2 text-muted-foreground text-[11px]">
                      Message text...
                    </div>
                    {/* Math Captcha Mini Card */}
                    <div className="p-2 rounded border bg-primary/5 flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-primary">5 + 4 = [ ? ]</span>
                      <span className="text-[10px] text-muted-foreground">Math Captcha Security</span>
                    </div>
                    <div className="h-8 rounded bg-primary text-primary-foreground font-semibold flex items-center justify-center text-xs">
                      Send Message
                    </div>
                  </div>
                </div>

                {/* Right Mini-Preview */}
                <div className="lg:col-span-5 rounded-lg border bg-card p-4 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-bold text-xs flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-primary" />
                      Store Information (Right Side)
                    </span>
                    <Badge variant="outline" className="text-[10px]">From General Settings</Badge>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg border p-1 bg-muted/20 flex items-center justify-center overflow-hidden shrink-0">
                      {storeSettings.logo ? (
                        <Image src={storeSettings.logo} alt="Store logo" width={44} height={44} className="object-contain" />
                      ) : (
                        <Building2 className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-xs text-foreground">{storeSettings.storeName}</p>
                      <p className="text-[10px] text-muted-foreground">{storeSettings.companyName}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs pt-2 border-t">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span className="font-mono text-foreground font-bold">{storeSettings.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="font-mono text-foreground font-bold">{storeSettings.email}</span>
                    </div>
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 text-sky-600 shrink-0 mt-0.5" />
                      <span className="text-[11px] leading-tight">{storeSettings.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                      <span className="text-[11px]">Sat - Thu: 10am - 8pm</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ========================================================= */}
      {/* INQUIRY DETAIL MODAL                                      */}
      {/* ========================================================= */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-lg lg:max-w-xl max-h-[90vh] flex flex-col p-0 overflow-hidden shadow-2xl">
          {selectedMessage && (
            <>
              {/* Pinned Header */}
              <DialogHeader className="p-6 pb-4 border-b bg-muted/20 shrink-0">
                <div className="flex items-center justify-between pr-8">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <DialogTitle className="text-lg font-bold">{selectedMessage.subject}</DialogTitle>
                      <Badge
                        variant="outline"
                        className={`text-[10px] uppercase font-semibold ${
                          selectedMessage.status === "unread"
                            ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                            : selectedMessage.status === "replied"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                            : "bg-muted text-muted-foreground border-border"
                        }`}
                      >
                        {selectedMessage.status}
                      </Badge>
                    </div>
                    <DialogDescription className="text-xs text-muted-foreground">
                      From {selectedMessage.name} • {format(new Date(selectedMessage.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto modal-scrollbar p-6 space-y-4">
                {/* Submitter Quick Details */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-muted/20 p-3 rounded-lg border">
                  <div>
                    <span className="text-muted-foreground block text-[11px] font-semibold uppercase">Customer</span>
                    <span className="font-bold text-foreground text-sm">{selectedMessage.name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px] font-semibold uppercase">Email</span>
                    <a href={`mailto:${selectedMessage.email}`} className="text-primary font-medium hover:underline">
                      {selectedMessage.email}
                    </a>
                  </div>
                  {selectedMessage.phone && (
                    <div>
                      <span className="text-muted-foreground block text-[11px] font-semibold uppercase">Phone</span>
                      <a href={`tel:${selectedMessage.phone}`} className="font-mono text-foreground hover:underline">
                        {selectedMessage.phone}
                      </a>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground block text-[11px] font-semibold uppercase">Emailed To</span>
                    <span className="font-mono text-muted-foreground text-[11px]">
                      {selectedMessage.adminRecipient || storeSettings.email}
                    </span>
                  </div>
                </div>

                {/* Message Body */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Inquiry Message
                  </Label>
                  <div className="p-4 rounded-xl border bg-card text-foreground text-sm leading-relaxed whitespace-pre-wrap shadow-xs">
                    {selectedMessage.message}
                  </div>
                </div>

                {/* Status Toggle Buttons */}
                <div className="space-y-1.5 pt-2">
                  <Label className="text-xs font-semibold text-muted-foreground">Change Status</Label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant={selectedMessage.status === "unread" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleUpdateStatus("unread")}
                      disabled={isUpdatingStatus}
                      className="text-xs h-8"
                    >
                      Mark as Unread
                    </Button>
                    <Button
                      type="button"
                      variant={selectedMessage.status === "read" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleUpdateStatus("read")}
                      disabled={isUpdatingStatus}
                      className="text-xs h-8"
                    >
                      Mark as Read
                    </Button>
                    <Button
                      type="button"
                      variant={selectedMessage.status === "replied" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleUpdateStatus("replied")}
                      disabled={isUpdatingStatus}
                      className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                      Mark as Replied
                    </Button>
                  </div>
                </div>
              </div>

              {/* Pinned Footer */}
              <DialogFooter className="p-4 px-6 border-t bg-muted/10 shrink-0 flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteMessage(selectedMessage.id)}
                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 text-xs gap-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </Button>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsDetailModalOpen(false)} className="text-xs">
                    Close
                  </Button>
                  <Button asChild size="sm" className="text-xs gap-1.5 bg-primary text-primary-foreground">
                    <a
                      href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleUpdateStatus("replied")}
                    >
                      <Mail className="h-3.5 w-3.5" />
                      <span>Reply via Email</span>
                    </a>
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
