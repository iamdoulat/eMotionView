"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { type User, users as placeholderUsers } from "@/lib/placeholder-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Award,
  Coins,
  TrendingUp,
  Sparkles,
  PlusCircle,
  MinusCircle,
  Search,
  RotateCcw,
  Check,
  Star,
  Crown,
  Gift,
  Percent,
  History,
  Sliders,
  Settings2,
  Info,
  Loader2,
  RefreshCw,
  Eye,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Wallet,
  ShoppingBag,
  UserCheck
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

// ==========================================
// TYPES & TIER DEFINITIONS
// ==========================================
type PointTransaction = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: "credit" | "debit";
  amount: number;
  balanceAfter: number;
  reason: string;
  note?: string;
  date: string;
  adminName: string;
};

type VIPLevel = {
  name: "Bronze" | "Silver" | "Gold" | "Platinum";
  minPoints: number;
  maxPoints: number;
  badgeColor: string;
  multiplier: number;
  perks: string[];
};

const VIP_TIERS: VIPLevel[] = [
  {
    name: "Bronze",
    minPoints: 0,
    maxPoints: 499,
    badgeColor: "bg-amber-700/10 text-amber-700 border-amber-700/30",
    multiplier: 1.0,
    perks: ["Standard 1x point accrual", "Access to member-only seasonal promos"],
  },
  {
    name: "Silver",
    minPoints: 500,
    maxPoints: 1499,
    badgeColor: "bg-slate-400/15 text-slate-700 dark:text-slate-300 border-slate-400/30",
    multiplier: 1.1,
    perks: ["1.1x earning multiplier", "Free delivery coupon on birthdays", "Early access to flash sales"],
  },
  {
    name: "Gold",
    minPoints: 1500,
    maxPoints: 4999,
    badgeColor: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/40",
    multiplier: 1.25,
    perks: ["1.25x earning multiplier", "Exclusive Gold member vouchers", "Priority dispatch & packing"],
  },
  {
    name: "Platinum",
    minPoints: 5000,
    maxPoints: Infinity,
    badgeColor: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/40",
    multiplier: 1.5,
    perks: ["1.5x maximum earning multiplier", "Dedicated VIP concierge support", "Special unreleased product drops"],
  },
];

function getCustomerTier(points: number = 0): VIPLevel {
  if (points >= 5000) return VIP_TIERS[3];
  if (points >= 1500) return VIP_TIERS[2];
  if (points >= 500) return VIP_TIERS[1];
  return VIP_TIERS[0];
}

const INITIAL_TRANSACTIONS: PointTransaction[] = [
  {
    id: "tx_101",
    userId: "cust_1",
    userName: "Olivia Martin",
    userEmail: "olivia.martin@email.com",
    type: "credit",
    amount: 150,
    balanceAfter: 250,
    reason: "Order CashBack",
    note: "Order #ORD-8941 completed reward",
    date: new Date(Date.now() - 3600000 * 5).toISOString(),
    adminName: "Automated System",
  },
  {
    id: "tx_102",
    userId: "cust_2",
    userName: "Jackson Lee",
    userEmail: "jackson.lee@email.com",
    type: "credit",
    amount: 50,
    balanceAfter: 120,
    reason: "Promotional Bonus",
    note: "Black Friday Club Welcome Bonus",
    date: new Date(Date.now() - 3600000 * 24).toISOString(),
    adminName: "Admin User",
  },
  {
    id: "tx_103",
    userId: "cust_1",
    userName: "Olivia Martin",
    userEmail: "olivia.martin@email.com",
    type: "debit",
    amount: 100,
    balanceAfter: 100,
    reason: "Checkout Redemption",
    note: "Redeemed for ৳10 discount on order #ORD-8812",
    date: new Date(Date.now() - 3600000 * 48).toISOString(),
    adminName: "Automated System",
  },
];

export default function ClubPointsPage() {
  const { toast } = useToast();

  // Settings State
  const [isEnabled, setIsEnabled] = useState(true);
  const [pointSystemType, setPointSystemType] = useState<"amount" | "product">("amount");
  const [earningAmount, setEarningAmount] = useState(100);
  const [earningPoints, setEarningPoints] = useState(10);
  const [redeemPoints, setRedeemPoints] = useState(100);
  const [redeemValue, setRedeemValue] = useState(1);
  const [minRedeemPoints, setMinRedeemPoints] = useState(100);
  const [maxDiscountPercent, setMaxDiscountPercent] = useState(25);
  const [signupBonusPoints, setSignupBonusPoints] = useState(50);
  const [enableSignupBonus, setEnableSignupBonus] = useState(true);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // Data & Table State
  const [customers, setCustomers] = useState<User[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [transactions, setTransactions] = useState<PointTransaction[]>(INITIAL_TRANSACTIONS);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modal State
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [adjustOperation, setAdjustOperation] = useState<"add" | "remove">("add");
  const [pointsToAdjust, setPointsToAdjust] = useState<number>(50);
  const [adjustReason, setAdjustReason] = useState<string>("Manual Admin Reward");
  const [adjustNote, setAdjustNote] = useState<string>("");
  const [isSubmittingAdjust, setIsSubmittingAdjust] = useState(false);

  // Fetch Customers & Settings
  const fetchData = async () => {
    setIsLoadingCustomers(true);
    try {
      // 1. Fetch Customers
      const res = await fetch("/api/data/customers");
      const data = res.ok ? await res.json() : [];

      if (Array.isArray(data) && data.length > 0) {
        setCustomers(
          data.map((u: any) => ({
            id: u.uid || u._id || u.id,
            uid: u.uid || u._id || u.id,
            name: u.name || "Customer",
            email: u.email || "",
            mobileNumber: u.mobileNumber,
            avatar: u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || "Customer")}&background=0284c7&color=fff`,
            registeredDate: u.registeredDate || new Date().toISOString(),
            status: u.status || "Active",
            lastLogin: u.lastLogin || new Date().toISOString(),
            role: "Customer",
            points: Number(u.points) || 0,
          }))
        );
      } else {
        // Fallback to placeholder customers
        const fallback = placeholderUsers
          .filter((u) => u.role === "Customer")
          .map((u, idx) => ({
            ...u,
            id: u.uid || `cust_seed_${idx + 1}`,
            points: u.points !== undefined ? u.points : (idx + 1) * 125,
            avatar: u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=0284c7&color=fff`,
          }));
        setCustomers(fallback);
      }
    } catch {
      // Fallback on error
      const fallback = placeholderUsers
        .filter((u) => u.role === "Customer")
        .map((u, idx) => ({
          ...u,
          id: u.uid || `cust_seed_${idx + 1}`,
          points: u.points !== undefined ? u.points : (idx + 1) * 125,
          avatar: u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=0284c7&color=fff`,
        }));
      setCustomers(fallback);
    } finally {
      setIsLoadingCustomers(false);
    }

    // 2. Fetch Settings
    try {
      const cfgRes = await fetch("/api/data/admin_settings?id=club_points");
      const cfg = cfgRes.ok ? await cfgRes.json() : null;
      if (cfg) {
        if (typeof cfg.isEnabled === "boolean") setIsEnabled(cfg.isEnabled);
        if (cfg.pointSystemType) setPointSystemType(cfg.pointSystemType);
        if (cfg.earningAmount !== undefined) setEarningAmount(Number(cfg.earningAmount));
        if (cfg.earningPoints !== undefined) setEarningPoints(Number(cfg.earningPoints));
        if (cfg.redeemPoints !== undefined) setRedeemPoints(Number(cfg.redeemPoints));
        if (cfg.redeemValue !== undefined) setRedeemValue(Number(cfg.redeemValue));
        if (cfg.minRedeemPoints !== undefined) setMinRedeemPoints(Number(cfg.minRedeemPoints));
        if (cfg.maxDiscountPercent !== undefined) setMaxDiscountPercent(Number(cfg.maxDiscountPercent));
        if (cfg.signupBonusPoints !== undefined) setSignupBonusPoints(Number(cfg.signupBonusPoints));
        if (typeof cfg.enableSignupBonus === "boolean") setEnableSignupBonus(cfg.enableSignupBonus);
      }
    } catch {
      // Settings stay on default
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Save Settings
  const handleSaveConfig = async () => {
    setIsSavingConfig(true);
    try {
      const res = await fetch("/api/data/admin_settings/club_points", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isEnabled,
          pointSystemType,
          earningAmount,
          earningPoints,
          redeemPoints,
          redeemValue,
          minRedeemPoints,
          maxDiscountPercent,
          signupBonusPoints,
          enableSignupBonus,
          updatedAt: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      toast({
        title: "Configuration Saved",
        description: "Club point rules and redemption rates have been updated successfully.",
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Could not save club point settings to server.",
      });
    } finally {
      setIsSavingConfig(false);
    }
  };

  // Open Adjust Points Dialog
  const handleOpenAdjust = (user: User) => {
    setSelectedUser(user);
    setPointsToAdjust(50);
    setAdjustOperation("add");
    setAdjustReason("Manual Admin Reward");
    setAdjustNote("");
    setIsAdjustOpen(true);
  };

  // Open Details Dialog
  const handleOpenDetails = (user: User) => {
    setSelectedUser(user);
    setIsDetailsOpen(true);
  };

  // Submit Point Adjustment
  const handleExecuteAdjustment = async () => {
    if (!selectedUser || pointsToAdjust <= 0) return;
    setIsSubmittingAdjust(true);

    const currentPoints = selectedUser.points || 0;
    const delta = adjustOperation === "add" ? pointsToAdjust : -pointsToAdjust;
    const newPoints = Math.max(0, currentPoints + delta);

    try {
      // Update customer in database
      const res = await fetch(`/api/data/customers/${encodeURIComponent(selectedUser.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points: newPoints }),
      });
      if (!res.ok) {
        // Try fallback to /api/data/users
        await fetch(`/api/data/users/${encodeURIComponent(selectedUser.id)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ points: newPoints }),
        });
      }

      // Record transaction log locally
      const newTx: PointTransaction = {
        id: `tx_${Date.now()}`,
        userId: selectedUser.id,
        userName: selectedUser.name,
        userEmail: selectedUser.email,
        type: adjustOperation === "add" ? "credit" : "debit",
        amount: pointsToAdjust,
        balanceAfter: newPoints,
        reason: adjustReason,
        note: adjustNote.trim() || undefined,
        date: new Date().toISOString(),
        adminName: "Admin User",
      };

      setTransactions((prev) => [newTx, ...prev]);
      setCustomers((prev) => prev.map((u) => (u.id === selectedUser.id ? { ...u, points: newPoints } : u)));

      toast({
        title: adjustOperation === "add" ? "Points Credited" : "Points Deducted",
        description: `${selectedUser.name}'s balance updated to ${newPoints.toLocaleString()} pts.`,
      });

      setIsAdjustOpen(false);
      setSelectedUser(null);
    } catch {
      toast({
        variant: "destructive",
        title: "Adjustment Failed",
        description: "Could not update customer points.",
      });
    } finally {
      setIsSubmittingAdjust(false);
    }
  };

  // KPI Metrics
  const stats = useMemo(() => {
    const totalPoints = customers.reduce((sum, u) => sum + (u.points || 0), 0);
    const membersWithPoints = customers.filter((u) => (u.points || 0) > 0).length;
    const ratePerPoint = redeemPoints > 0 ? redeemValue / redeemPoints : 0.01;
    const estimatedValueBDT = totalPoints * ratePerPoint;
    const topLoyaltyMember = [...customers].sort((a, b) => (b.points || 0) - (a.points || 0))[0];

    return {
      totalPoints,
      membersWithPoints,
      totalCustomers: customers.length,
      estimatedValueBDT,
      topLoyaltyMember,
    };
  }, [customers, redeemPoints, redeemValue]);

  // Filtered Customer List
  const filteredCustomers = useMemo(() => {
    return customers.filter((user) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        (user.mobileNumber && user.mobileNumber.toLowerCase().includes(q));

      const points = user.points || 0;
      const tier = getCustomerTier(points).name;
      const matchesTier = tierFilter === "all" || tier === tierFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "positive" && points > 0) ||
        (statusFilter === "zero" && points === 0);

      return matchesSearch && matchesTier && matchesStatus;
    });
  }, [customers, searchTerm, tierFilter, statusFilter]);

  // Conversion rate calculation for display
  const pointExchangeRateString = useMemo(() => {
    if (redeemPoints <= 0) return "100 Pts = ৳1.00 BDT";
    return `${redeemPoints} Pts = ৳${redeemValue.toFixed(2)} BDT`;
  }, [redeemPoints, redeemValue]);

  const earningRateString = useMemo(() => {
    if (earningAmount <= 0) return "Spend ৳100 → Earn 10 Pts";
    return `Spend ৳${earningAmount} → Earn ${earningPoints} Pts`;
  }, [earningAmount, earningPoints]);

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* TOP HEADER & ACTION CONTROLS                             */}
      {/* ========================================================= */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Club Points & Loyalty System</h1>
            <Badge
              variant="outline"
              className={
                isEnabled
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 gap-1.5"
                  : "bg-muted text-muted-foreground border-border gap-1.5"
              }
            >
              <span className={`h-1.5 w-1.5 rounded-full ${isEnabled ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"}`} />
              {isEnabled ? "System Active" : "System Disabled"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Configure customer cashback reward formulas, redemption conversion thresholds, and manage loyalty balances.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoadingCustomers} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${isLoadingCustomers ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button onClick={handleSaveConfig} disabled={isSavingConfig} className="gap-2 shadow-sm">
            {isSavingConfig ? <Loader2 className="h-4 w-4 animate-spin" /> : <Settings2 className="h-4 w-4" />}
            <span>Save Rules</span>
          </Button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* EXECUTIVE KPI SUMMARY CARDS                              */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Points In Circulation */}
        <Card className="border-border/60 shadow-sm bg-gradient-to-br from-card to-card/50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <Coins className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Points Issued</p>
              <h3 className="text-2xl font-bold text-foreground truncate">{stats.totalPoints.toLocaleString()} Pts</h3>
              <p className="text-[11px] text-muted-foreground truncate">
                Circulation Value: ~৳{stats.estimatedValueBDT.toFixed(2)} BDT
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Loyalty Members */}
        <Card className="border-border/60 shadow-sm bg-gradient-to-br from-card to-card/50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Award className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Members</p>
              <h3 className="text-2xl font-bold text-foreground">
                {stats.membersWithPoints}{" "}
                <span className="text-xs font-normal text-muted-foreground">/ {stats.totalCustomers}</span>
              </h3>
              <p className="text-[11px] text-muted-foreground">
                {stats.totalCustomers > 0
                  ? `${Math.round((stats.membersWithPoints / stats.totalCustomers) * 100)}% member participation`
                  : "0% participation"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Earning Formula */}
        <Card className="border-border/60 shadow-sm bg-gradient-to-br from-card to-card/50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Earning Policy</p>
              <h3 className="text-sm font-bold text-foreground truncate">{earningRateString}</h3>
              <p className="text-[11px] text-muted-foreground truncate">
                {pointSystemType === "amount" ? "Spend amount based" : "Per-product specified"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Redemption Policy */}
        <Card className="border-border/60 shadow-sm bg-gradient-to-br from-card to-card/50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <Wallet className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Redemption Policy</p>
              <h3 className="text-sm font-bold text-foreground truncate">{pointExchangeRateString}</h3>
              <p className="text-[11px] text-muted-foreground truncate">Min {minRedeemPoints} pts required</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ========================================================= */}
      {/* MAIN 4 TABS NAVIGATION                                   */}
      {/* ========================================================= */}
      <Tabs defaultValue="configurations" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full h-auto p-1 bg-muted/60 border border-border/50">
          <TabsTrigger value="configurations" className="text-xs py-2 gap-2">
            <Sliders className="h-4 w-4" />
            <span>Rules & Conversion</span>
          </TabsTrigger>
          <TabsTrigger value="customer-points" className="text-xs py-2 gap-2">
            <Coins className="h-4 w-4" />
            <span>Customer Balances ({customers.length})</span>
          </TabsTrigger>
          <TabsTrigger value="tiers" className="text-xs py-2 gap-2">
            <Crown className="h-4 w-4 text-amber-500" />
            <span>VIP Loyalty Tiers</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs py-2 gap-2">
            <History className="h-4 w-4" />
            <span>Points Ledger ({transactions.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* ========================================================= */}
        {/* TAB 1: RULES & CONVERSIONS                                */}
        {/* ========================================================= */}
        <TabsContent value="configurations" className="space-y-6 mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Rule Configs */}
            <div className="lg:col-span-2 space-y-6">
              {/* Master Toggle Card */}
              <Card className="border-border/60 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold">Master Loyalty Program Switch</CardTitle>
                      <CardDescription className="text-xs">
                        Enable or temporarily suspend club points accrual and checkout redemptions.
                      </CardDescription>
                    </div>
                    <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="rounded-lg bg-muted/40 p-3 text-xs flex items-center justify-between text-muted-foreground">
                    <span>
                      Current Status:{" "}
                      <strong className={isEnabled ? "text-emerald-600 font-semibold" : "text-rose-600 font-semibold"}>
                        {isEnabled ? "Loyalty Engine Active" : "Loyalty Engine Disabled"}
                      </strong>
                    </span>
                    <span className="text-[11px]">
                      {isEnabled
                        ? "Shoppers can earn and redeem points at checkout."
                        : "Point accrual and point discounts are suspended."}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Earning Rules Card */}
              <Card className="border-border/60 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Points Earning Rules
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Choose how customers earn reward points when shopping on eMotionView.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* System Type Selector Cards */}
                  <RadioGroup
                    value={pointSystemType}
                    onValueChange={(val) => setPointSystemType(val as "amount" | "product")}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  >
                    {/* Amount Based */}
                    <div
                      onClick={() => setPointSystemType("amount")}
                      className={`cursor-pointer rounded-xl border p-4 transition-all ${
                        pointSystemType === "amount"
                          ? "border-primary bg-primary/5 ring-1 ring-primary shadow-xs"
                          : "border-border/70 hover:bg-muted/30"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="amount" id="type-amount" />
                          <Label htmlFor="type-amount" className="font-semibold text-sm cursor-pointer">
                            Order Amount Based
                          </Label>
                        </div>
                        {pointSystemType === "amount" && (
                          <Badge className="bg-primary text-primary-foreground text-[10px] h-5">Selected</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                        Automatically grants points based on total spend in BDT on completed orders.
                      </p>
                    </div>

                    {/* Product Based */}
                    <div
                      onClick={() => setPointSystemType("product")}
                      className={`cursor-pointer rounded-xl border p-4 transition-all ${
                        pointSystemType === "product"
                          ? "border-primary bg-primary/5 ring-1 ring-primary shadow-xs"
                          : "border-border/70 hover:bg-muted/30"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="product" id="type-product" />
                          <Label htmlFor="type-product" className="font-semibold text-sm cursor-pointer">
                            Per-Product Specified
                          </Label>
                        </div>
                        {pointSystemType === "product" && (
                          <Badge className="bg-primary text-primary-foreground text-[10px] h-5">Selected</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                        Custom point reward values set on individual product entries in Catalog Management.
                      </p>
                    </div>
                  </RadioGroup>

                  {/* Amount Based Formula Inputs */}
                  {pointSystemType === "amount" ? (
                    <div className="p-4 rounded-xl border border-border/80 bg-muted/20 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Amount Accrual Formula
                        </h4>
                        <Badge variant="outline" className="text-[11px] font-mono text-primary">
                          {earningAmount > 0 ? `${((earningPoints / earningAmount) * 100).toFixed(1)}% Ratio` : "0%"}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="earning-amount" className="text-xs font-semibold">
                            For Every Spend Amount (৳ BDT)
                          </Label>
                          <Input
                            id="earning-amount"
                            type="number"
                            min="1"
                            value={earningAmount}
                            onChange={(e) => setEarningAmount(Number(e.target.value) || 0)}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="earning-points" className="text-xs font-semibold">
                            Customer Earns Points
                          </Label>
                          <Input
                            id="earning-points"
                            type="number"
                            min="1"
                            value={earningPoints}
                            onChange={(e) => setEarningPoints(Number(e.target.value) || 0)}
                          />
                        </div>
                      </div>

                      <div className="rounded-lg bg-background border p-3 text-xs text-muted-foreground flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>
                          Customer purchasing <strong>৳1,000</strong> of items receives{" "}
                          <strong className="text-primary font-bold">
                            {earningAmount > 0 ? Math.floor((1000 / earningAmount) * earningPoints) : 0} points
                          </strong>
                          .
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border border-dashed border-primary/40 bg-primary/5 space-y-2">
                      <p className="text-xs font-semibold text-primary flex items-center gap-1.5">
                        <ShoppingBag className="h-4 w-4" />
                        Catalog Product Management Integration
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Points are assigned per SKU. When adding or editing products in{" "}
                        <Link href="/admin/products" className="text-primary underline font-medium">
                          Product Catalog
                        </Link>
                        , configure the "Reward Points" field.
                      </p>
                    </div>
                  )}

                  {/* Bonus Reward Events */}
                  <div className="pt-2 border-t border-border/50 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Bonus Loyalty Triggers
                    </h4>
                    <div className="flex items-center justify-between p-3 rounded-xl border bg-muted/10">
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold">New Customer Welcome Bonus</p>
                        <p className="text-[11px] text-muted-foreground">
                          Automatically credit points upon initial account sign-up.
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Input
                          type="number"
                          className="w-20 h-8 text-xs text-right"
                          value={signupBonusPoints}
                          onChange={(e) => setSignupBonusPoints(Number(e.target.value) || 0)}
                          disabled={!enableSignupBonus}
                        />
                        <span className="text-xs text-muted-foreground">Pts</span>
                        <Switch checked={enableSignupBonus} onCheckedChange={setEnableSignupBonus} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Redemption & Conversion Card */}
              <Card className="border-border/60 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Coins className="h-4 w-4 text-amber-500" />
                    Points Redemption & Currency Conversion
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Define point-to-cash conversion value and redemption thresholds at checkout.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="redeem-points" className="text-xs font-semibold">
                        Points Required to Redeem
                      </Label>
                      <Input
                        id="redeem-points"
                        type="number"
                        min="1"
                        value={redeemPoints}
                        onChange={(e) => setRedeemPoints(Number(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="redeem-value" className="text-xs font-semibold">
                        Equals Discount Value (৳ BDT)
                      </Label>
                      <Input
                        id="redeem-value"
                        type="number"
                        min="0.1"
                        step="0.5"
                        value={redeemValue}
                        onChange={(e) => setRedeemValue(Number(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="min-redeem" className="text-xs font-semibold">
                        Minimum Points Balance to Unlock
                      </Label>
                      <Input
                        id="min-redeem"
                        type="number"
                        min="0"
                        value={minRedeemPoints}
                        onChange={(e) => setMinRedeemPoints(Number(e.target.value) || 0)}
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Customer must hold at least this balance before redemption slider activates.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="max-discount" className="text-xs font-semibold">
                        Maximum Order Subtotal Discount (%)
                      </Label>
                      <Input
                        id="max-discount"
                        type="number"
                        min="5"
                        max="100"
                        value={maxDiscountPercent}
                        onChange={(e) => setMaxDiscountPercent(Number(e.target.value) || 0)}
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Protects profit margins by capping point discount to percentage of cart.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Col: Live Storefront Checkout Simulator */}
            <div className="space-y-6">
              <Card className="border-border/60 shadow-sm bg-gradient-to-br from-card to-card/50">
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <CardTitle className="text-sm font-semibold">Storefront Checkout Simulator</CardTitle>
                  </div>
                  <CardDescription className="text-xs">
                    Live preview of how loyalty points render to customers on the checkout page.
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-4 space-y-4">
                  {/* Simulator Loyalty Banner */}
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-amber-600" />
                        <div>
                          <p className="text-xs font-bold text-foreground">Club Points Available</p>
                          <p className="text-[11px] text-muted-foreground">Balance: 500 Pts (~৳5.00 BDT)</p>
                        </div>
                      </div>
                      <Badge className="bg-amber-500 text-white text-[10px]">Silver Tier</Badge>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-amber-500/20">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Redeem Points:</span>
                        <strong className="text-primary font-bold">250 Pts (৳2.50 off)</strong>
                      </div>
                      <div className="h-2 rounded-full bg-amber-500/20 overflow-hidden">
                        <div className="h-full bg-amber-500 w-1/2 rounded-full" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Order Subtotal: ৳2,499</span>
                      <span className="text-emerald-600 font-medium">Earn +249 Pts on this order!</span>
                    </div>
                  </div>

                  {/* Summary Breakdown */}
                  <div className="space-y-2 text-xs">
                    <h5 className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                      Policy Key Metrics
                    </h5>
                    <div className="space-y-1.5 p-3 rounded-lg bg-muted/40 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Earning Rate:</span>
                        <span className="font-semibold">{earningRateString}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Exchange Rate:</span>
                        <span className="font-semibold">{pointExchangeRateString}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Threshold:</span>
                        <span className="font-semibold">{minRedeemPoints} pts min</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Max Discount:</span>
                        <span className="font-semibold">{maxDiscountPercent}% of order</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleSaveConfig}
                    disabled={isSavingConfig}
                    className="w-full gap-2 shadow-xs"
                    size="sm"
                  >
                    {isSavingConfig ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Save & Deploy Rules
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ========================================================= */}
        {/* TAB 2: CUSTOMER BALANCES TABLE                            */}
        {/* ========================================================= */}
        <TabsContent value="customer-points" className="space-y-4 mt-0">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="p-4 sm:p-6 pb-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="text-lg">Customer Loyalty Balances</CardTitle>
                  <CardDescription className="text-xs">
                    View customer loyalty accounts, assign manual bonuses, or adjust balances.
                  </CardDescription>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search name, email, phone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 h-9 text-xs"
                    />
                  </div>

                  {/* Tier Filter */}
                  <Select value={tierFilter} onValueChange={setTierFilter}>
                    <SelectTrigger className="w-[125px] h-9 text-xs">
                      <SelectValue placeholder="All Tiers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tiers</SelectItem>
                      <SelectItem value="Platinum">Platinum</SelectItem>
                      <SelectItem value="Gold">Gold</SelectItem>
                      <SelectItem value="Silver">Silver</SelectItem>
                      <SelectItem value="Bronze">Bronze</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Status Filter */}
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[130px] h-9 text-xs">
                      <SelectValue placeholder="Balance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Balances</SelectItem>
                      <SelectItem value="positive">With Points &gt; 0</SelectItem>
                      <SelectItem value="zero">Zero Points</SelectItem>
                    </SelectContent>
                  </Select>

                  {(searchTerm || tierFilter !== "all" || statusFilter !== "all") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearchTerm("");
                        setTierFilter("all");
                        setStatusFilter("all");
                      }}
                      className="h-9 px-2 text-xs text-muted-foreground"
                    >
                      <RotateCcw className="h-3.5 w-3.5 mr-1" />
                      Reset
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="w-[280px]">Customer</TableHead>
                    <TableHead>Loyalty Tier</TableHead>
                    <TableHead className="text-right">Current Points</TableHead>
                    <TableHead className="text-right">Est. Cash Value</TableHead>
                    <TableHead className="hidden md:table-cell">Member Since</TableHead>
                    <TableHead className="text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingCustomers ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          <p className="text-xs text-muted-foreground">Loading loyalty accounts...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredCustomers.length > 0 ? (
                    filteredCustomers.map((user) => {
                      const points = user.points || 0;
                      const tier = getCustomerTier(points);
                      const rate = redeemPoints > 0 ? redeemValue / redeemPoints : 0.01;
                      const cashValue = (points * rate).toFixed(2);

                      return (
                        <TableRow key={user.id} className="hover:bg-muted/40 transition-colors">
                          {/* Customer Avatar & Contact */}
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9 border shadow-2xs">
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                  {user.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .slice(0, 2)
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col min-w-0">
                                <span className="font-medium text-sm text-foreground truncate">{user.name}</span>
                                <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                                {user.mobileNumber && (
                                  <span className="text-[11px] text-muted-foreground/80">{user.mobileNumber}</span>
                                )}
                              </div>
                            </div>
                          </TableCell>

                          {/* VIP Tier Badge */}
                          <TableCell>
                            <Badge variant="outline" className={`${tier.badgeColor} text-xs gap-1 font-medium`}>
                              {tier.name === "Platinum" && <Sparkles className="h-3 w-3" />}
                              {tier.name === "Gold" && <Crown className="h-3 w-3" />}
                              {tier.name === "Silver" && <Star className="h-3 w-3" />}
                              {tier.name === "Bronze" && <Coins className="h-3 w-3" />}
                              {tier.name}
                            </Badge>
                          </TableCell>

                          {/* Points */}
                          <TableCell className="text-right">
                            <span className="font-bold text-sm text-foreground font-mono">
                              {points.toLocaleString()}
                            </span>
                            <span className="text-xs text-muted-foreground ml-1">pts</span>
                          </TableCell>

                          {/* Est Value */}
                          <TableCell className="text-right text-xs font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                            ৳{cashValue}
                          </TableCell>

                          {/* Member Since */}
                          <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                            {user.registeredDate ? format(new Date(user.registeredDate), "MMM d, yyyy") : "N/A"}
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="text-right pr-6">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenDetails(user)}
                                className="h-8 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Details</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenAdjust(user)}
                                className="h-8 text-xs gap-1 border-primary/30 text-primary hover:bg-primary/10"
                              >
                                <Coins className="h-3.5 w-3.5" />
                                <span>Adjust</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Coins className="h-8 w-8 text-muted-foreground/40" />
                          <p className="text-sm font-medium">No customers found</p>
                          <p className="text-xs text-muted-foreground">
                            Try adjusting your search query or tier filters.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========================================================= */}
        {/* TAB 3: VIP LOYALTY TIERS                                  */}
        {/* ========================================================= */}
        <TabsContent value="tiers" className="space-y-6 mt-0">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Crown className="h-5 w-5 text-amber-500" />
                    Loyalty Membership Tier Ladder
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Automatic tier graduation rewards high-frequency customers with accelerated earning multipliers and VIP perks.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs">
                  4 Active Levels
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {VIP_TIERS.map((tier) => {
                  const memberCount = customers.filter(
                    (u) => getCustomerTier(u.points || 0).name === tier.name
                  ).length;

                  return (
                    <div
                      key={tier.name}
                      className="rounded-xl border border-border/80 p-4 space-y-3 bg-gradient-to-br from-card to-card/50 shadow-2xs flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className={`${tier.badgeColor} font-bold text-xs gap-1`}>
                            {tier.name === "Platinum" && <Sparkles className="h-3 w-3" />}
                            {tier.name === "Gold" && <Crown className="h-3 w-3" />}
                            {tier.name === "Silver" && <Star className="h-3 w-3" />}
                            {tier.name === "Bronze" && <Coins className="h-3 w-3" />}
                            {tier.name}
                          </Badge>
                          <span className="text-xs font-mono font-semibold text-primary">
                            {tier.multiplier}x Rate
                          </span>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground uppercase font-medium tracking-wider">
                            Threshold
                          </p>
                          <p className="text-sm font-bold text-foreground">
                            {tier.minPoints.toLocaleString()} {tier.maxPoints === Infinity ? "+ pts" : `– ${tier.maxPoints.toLocaleString()} pts`}
                          </p>
                        </div>

                        <div className="space-y-1.5 pt-2 border-t border-border/50">
                          <p className="text-[11px] font-semibold text-foreground/80">Tier Privileges:</p>
                          <ul className="space-y-1 text-[11px] text-muted-foreground">
                            {tier.perks.map((perk, i) => (
                              <li key={i} className="flex items-start gap-1.5 leading-snug">
                                <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0 mt-0.5" />
                                <span>{perk}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-border/50 text-xs text-muted-foreground flex items-center justify-between">
                        <span>Enrolled Shoppers:</span>
                        <strong className="text-foreground">{memberCount}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========================================================= */}
        {/* TAB 4: POINTS TRANSACTION AUDIT LEDGER                    */}
        {/* ========================================================= */}
        <TabsContent value="history" className="space-y-4 mt-0">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="p-4 sm:p-6 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <History className="h-4 w-4 text-primary" />
                    Points Transaction Ledger & Audit Trail
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Complete immutable log of manual credits, order cashbacks, and customer checkout redemptions.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="font-mono text-xs">
                  {transactions.length} Records
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Event Type</TableHead>
                    <TableHead className="text-right">Points Changed</TableHead>
                    <TableHead className="text-right">Balance After</TableHead>
                    <TableHead className="hidden md:table-cell">Note / Reason</TableHead>
                    <TableHead className="hidden lg:table-cell">Initiated By</TableHead>
                    <TableHead className="text-right pr-6">Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length > 0 ? (
                    transactions.map((tx) => (
                      <TableRow key={tx.id} className="hover:bg-muted/40 transition-colors">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-xs text-foreground">{tx.userName}</span>
                            <span className="text-[11px] text-muted-foreground">{tx.userEmail}</span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              tx.type === "credit"
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[11px]"
                                : "bg-rose-500/10 text-rose-600 border-rose-500/30 text-[11px]"
                            }
                          >
                            {tx.type === "credit" ? (
                              <ArrowUpRight className="h-3 w-3 mr-1" />
                            ) : (
                              <ArrowDownRight className="h-3 w-3 mr-1" />
                            )}
                            {tx.reason}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right font-mono font-bold text-xs">
                          <span className={tx.type === "credit" ? "text-emerald-600" : "text-rose-600"}>
                            {tx.type === "credit" ? "+" : "-"}
                            {tx.amount.toLocaleString()} pts
                          </span>
                        </TableCell>

                        <TableCell className="text-right font-mono text-xs text-muted-foreground">
                          {tx.balanceAfter.toLocaleString()} pts
                        </TableCell>

                        <TableCell className="hidden md:table-cell text-xs text-muted-foreground max-w-xs truncate">
                          {tx.note || "Standard transaction"}
                        </TableCell>

                        <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                          {tx.adminName}
                        </TableCell>

                        <TableCell className="text-right pr-6 text-xs text-muted-foreground">
                          {format(new Date(tx.date), "MMM d, h:mm a")}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-28 text-center text-xs text-muted-foreground">
                        No loyalty point transactions recorded yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ========================================================= */}
      {/* ADJUST POINTS MODAL                                       */}
      {/* ========================================================= */}
      <Dialog open={isAdjustOpen} onOpenChange={setIsAdjustOpen}>
        <DialogContent className="sm:max-w-lg lg:max-w-xl max-h-[90vh] flex flex-col p-0 overflow-hidden shadow-2xl">
          {selectedUser && (
            <>
              {/* Pinned Header */}
              <DialogHeader className="p-6 pb-4 border-b bg-muted/20 shrink-0">
                <div className="flex items-center gap-3">
                  <Avatar className="h-11 w-11 border shadow-xs">
                    <AvatarImage src={selectedUser.avatar} alt={selectedUser.name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                      {selectedUser.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 pr-8">
                    <DialogTitle className="text-lg font-bold truncate">
                      Adjust Points for {selectedUser.name}
                    </DialogTitle>
                    <DialogDescription className="text-xs mt-0.5">
                      Current balance:{" "}
                      <strong className="text-foreground font-mono">
                        {(selectedUser.points || 0).toLocaleString()} pts
                      </strong>{" "}
                      • Tier:{" "}
                      <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ml-1">
                        {getCustomerTier(selectedUser.points || 0).name}
                      </span>
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto modal-scrollbar p-6 space-y-5">
                {/* Operation Toggle: Credit vs Debit */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Adjustment Operation</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant={adjustOperation === "add" ? "default" : "outline"}
                      onClick={() => setAdjustOperation("add")}
                      className={`h-10 text-xs gap-2 ${
                        adjustOperation === "add"
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                          : "border-border/70"
                      }`}
                    >
                      <PlusCircle className="h-4 w-4" />
                      Add Points (Credit)
                    </Button>
                    <Button
                      type="button"
                      variant={adjustOperation === "remove" ? "default" : "outline"}
                      onClick={() => setAdjustOperation("remove")}
                      className={`h-10 text-xs gap-2 ${
                        adjustOperation === "remove"
                          ? "bg-rose-600 hover:bg-rose-700 text-white"
                          : "border-border/70"
                      }`}
                    >
                      <MinusCircle className="h-4 w-4" />
                      Deduct Points (Debit)
                    </Button>
                  </div>
                </div>

                {/* Quick Amount Chips */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Quick Amount Presets</Label>
                  <div className="flex flex-wrap items-center gap-2">
                    {[50, 100, 250, 500, 1000].map((amt) => (
                      <Button
                        key={amt}
                        type="button"
                        variant={pointsToAdjust === amt ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => setPointsToAdjust(amt)}
                        className={`h-8 text-xs font-mono ${
                          pointsToAdjust === amt ? "border-primary bg-primary/10 text-primary font-bold" : ""
                        }`}
                      >
                        {adjustOperation === "add" ? "+" : "-"}
                        {amt}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Custom Amount Input */}
                <div className="space-y-1.5">
                  <Label htmlFor="custom-points" className="text-xs font-semibold">
                    Points Amount
                  </Label>
                  <Input
                    id="custom-points"
                    type="number"
                    min="1"
                    value={pointsToAdjust > 0 ? pointsToAdjust : ""}
                    onChange={(e) => setPointsToAdjust(parseInt(e.target.value, 10) || 0)}
                    placeholder="Enter points..."
                    className="font-mono"
                  />
                </div>

                {/* Projected Balance Preview */}
                <div className="p-3.5 rounded-xl border bg-muted/30 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-muted-foreground">Current Balance:</span>
                    <p className="font-mono font-semibold">{(selectedUser.points || 0).toLocaleString()} pts</p>
                  </div>
                  <div className="text-center font-bold text-base text-muted-foreground">
                    {adjustOperation === "add" ? "→" : "→"}
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground">Projected Balance:</span>
                    <p
                      className={`font-mono font-bold text-sm ${
                        adjustOperation === "add" ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {Math.max(
                        0,
                        (selectedUser.points || 0) + (adjustOperation === "add" ? pointsToAdjust : -pointsToAdjust)
                      ).toLocaleString()}{" "}
                      pts
                    </p>
                  </div>
                </div>

                {/* Reason Selector */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Reason Category</Label>
                  <Select value={adjustReason} onValueChange={setAdjustReason}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Select Reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Manual Admin Reward">Manual Admin Reward</SelectItem>
                      <SelectItem value="Account Compensation">Customer Service Compensation</SelectItem>
                      <SelectItem value="Order CashBack">Order CashBack Correction</SelectItem>
                      <SelectItem value="Promotional Bonus">Special Promotional Campaign</SelectItem>
                      <SelectItem value="Administrative Correction">Balance Audit Correction</SelectItem>
                      <SelectItem value="Refund / Return Deduction">Order Return / Refund Deduction</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Admin Note Textarea */}
                <div className="space-y-1.5">
                  <Label htmlFor="adjust-note" className="text-xs font-semibold">
                    Internal Note / Reference (Optional)
                  </Label>
                  <Textarea
                    id="adjust-note"
                    placeholder="e.g. Compensation for delayed order #ORD-9128..."
                    value={adjustNote}
                    onChange={(e) => setAdjustNote(e.target.value)}
                    className="h-18 resize-none text-xs"
                  />
                </div>
              </div>

              {/* Pinned Action Footer */}
              <DialogFooter className="p-4 px-6 border-t bg-muted/20 shrink-0 flex items-center justify-between sm:justify-between">
                <Button variant="outline" size="sm" onClick={() => setIsAdjustOpen(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleExecuteAdjustment}
                  disabled={pointsToAdjust <= 0 || isSubmittingAdjust}
                  className={`gap-2 ${
                    adjustOperation === "add"
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-rose-600 hover:bg-rose-700 text-white"
                  }`}
                >
                  {isSubmittingAdjust ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : adjustOperation === "add" ? (
                    <>
                      <PlusCircle className="h-4 w-4" />
                      <span>Credit {pointsToAdjust.toLocaleString()} Pts</span>
                    </>
                  ) : (
                    <>
                      <MinusCircle className="h-4 w-4" />
                      <span>Deduct {pointsToAdjust.toLocaleString()} Pts</span>
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* CUSTOMER LOYALTY DETAILS MODAL                            */}
      {/* ========================================================= */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-xl lg:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden shadow-2xl">
          {selectedUser && (
            <>
              {/* Pinned Header */}
              <DialogHeader className="p-6 pb-4 border-b bg-muted/20 shrink-0">
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14 border-2 border-primary/20 shrink-0 shadow-sm">
                    <AvatarImage src={selectedUser.avatar} alt={selectedUser.name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-base">
                      {selectedUser.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 pr-8">
                    <div className="flex flex-wrap items-center gap-2">
                      <DialogTitle className="text-xl font-bold truncate">{selectedUser.name}</DialogTitle>
                      <Badge
                        variant="outline"
                        className={`${getCustomerTier(selectedUser.points || 0).badgeColor} text-xs font-semibold`}
                      >
                        {getCustomerTier(selectedUser.points || 0).name} Member
                      </Badge>
                    </div>
                    <DialogDescription className="text-xs text-muted-foreground mt-0.5">{selectedUser.email}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              {/* Scrollable Inspector Body */}
              <div className="flex-1 overflow-y-auto modal-scrollbar p-6 space-y-6">
                {/* 4 Overview Mini Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-xl border p-3 bg-muted/20">
                    <p className="text-[11px] text-muted-foreground uppercase font-medium">Points Balance</p>
                    <p className="text-base font-bold text-foreground mt-1 font-mono">
                      {(selectedUser.points || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-xl border p-3 bg-muted/20">
                    <p className="text-[11px] text-muted-foreground uppercase font-medium">Est. Value</p>
                    <p className="text-base font-bold text-emerald-600 mt-1 font-mono">
                      ৳
                      {((selectedUser.points || 0) * (redeemPoints > 0 ? redeemValue / redeemPoints : 0.01)).toFixed(
                        2
                      )}
                    </p>
                  </div>
                  <div className="rounded-xl border p-3 bg-muted/20">
                    <p className="text-[11px] text-muted-foreground uppercase font-medium">Multiplier</p>
                    <p className="text-base font-bold text-primary mt-1 font-mono">
                      {getCustomerTier(selectedUser.points || 0).multiplier}x
                    </p>
                  </div>
                  <div className="rounded-xl border p-3 bg-muted/20">
                    <p className="text-[11px] text-muted-foreground uppercase font-medium">Member Since</p>
                    <p className="text-xs font-semibold text-foreground mt-1">
                      {selectedUser.registeredDate ? format(new Date(selectedUser.registeredDate), "MMM yyyy") : "N/A"}
                    </p>
                  </div>
                </div>

                {/* Tier Progress Bar */}
                {(() => {
                  const currentPts = selectedUser.points || 0;
                  const tier = getCustomerTier(currentPts);
                  const nextTier =
                    tier.name === "Bronze"
                      ? VIP_TIERS[1]
                      : tier.name === "Silver"
                      ? VIP_TIERS[2]
                      : tier.name === "Gold"
                      ? VIP_TIERS[3]
                      : null;

                  if (!nextTier) {
                    return (
                      <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-4 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Crown className="h-5 w-5 text-purple-600" />
                          <span className="font-bold text-purple-900 dark:text-purple-200">
                            Highest Tier Reached: Platinum VIP
                          </span>
                        </div>
                        <Badge className="bg-purple-600 text-white text-[10px]">1.5x Max Rate</Badge>
                      </div>
                    );
                  }

                  const needed = nextTier.minPoints - currentPts;
                  const progressPct = Math.min(
                    100,
                    Math.round(((currentPts - tier.minPoints) / (nextTier.minPoints - tier.minPoints)) * 100)
                  );

                  return (
                    <div className="rounded-xl border p-4 bg-muted/15 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold">
                          Tier Progression towards <strong>{nextTier.name}</strong>
                        </span>
                        <span className="text-muted-foreground font-mono">
                          {needed > 0 ? `${needed.toLocaleString()} more pts needed` : "Qualifies for promotion"}
                        </span>
                      </div>
                      <Progress value={progressPct} className="h-2" />
                      <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
                        <span>{tier.name} ({tier.minPoints} pts)</span>
                        <span>{nextTier.name} ({nextTier.minPoints} pts)</span>
                      </div>
                    </div>
                  );
                })()}

                {/* User's Recent Activity */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Point History for this Customer
                  </h4>
                  {transactions.filter((tx) => tx.userId === selectedUser.id).length > 0 ? (
                    <div className="rounded-xl border overflow-hidden">
                      <Table>
                        <TableBody>
                          {transactions
                            .filter((tx) => tx.userId === selectedUser.id)
                            .map((tx) => (
                              <TableRow key={tx.id} className="text-xs">
                                <TableCell className="font-medium">
                                  <Badge
                                    variant="outline"
                                    className={
                                      tx.type === "credit"
                                        ? "text-emerald-600 border-emerald-500/30 text-[10px]"
                                        : "text-rose-600 border-rose-500/30 text-[10px]"
                                    }
                                  >
                                    {tx.type === "credit" ? "+" : "-"}
                                    {tx.amount} pts
                                  </Badge>
                                </TableCell>
                                <TableCell>{tx.reason}</TableCell>
                                <TableCell className="text-muted-foreground">{tx.note || "System"}</TableCell>
                                <TableCell className="text-right text-muted-foreground">
                                  {format(new Date(tx.date), "MMM d, h:mm a")}
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground p-3 rounded-lg border bg-muted/10">
                      No points adjustments recorded yet for this user.
                    </p>
                  )}
                </div>
              </div>

              {/* Pinned Action Footer */}
              <DialogFooter className="p-4 px-6 border-t bg-muted/20 shrink-0 flex items-center justify-between sm:justify-between">
                <Button variant="outline" size="sm" onClick={() => setIsDetailsOpen(false)}>
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    const u = selectedUser;
                    setIsDetailsOpen(false);
                    setTimeout(() => handleOpenAdjust(u), 150);
                  }}
                  className="gap-2"
                >
                  <Coins className="h-4 w-4" />
                  <span>Adjust Points</span>
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
