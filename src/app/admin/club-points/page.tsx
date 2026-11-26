"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { User } from "@/lib/placeholder-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PlusCircle, MinusCircle, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ClubPointsPage() {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pointsToAdjust, setPointsToAdjust] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEnabled, setIsEnabled] = useState(true);
  const [pointSystemType, setPointSystemType] = useState<'amount' | 'product'>('amount');
  const [earningAmount, setEarningAmount] = useState(100);
  const [earningPoints, setEarningPoints] = useState(10);
  const [redeemPoints, setRedeemPoints] = useState(1000);
  const [redeemValue, setRedeemValue] = useState(10);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  useEffect(() => {
    fetch('/api/data/customers')
      .then(r => (r.ok ? r.json() : []))
      .then((data: any[]) => {
        if (Array.isArray(data)) {
          setCustomers(data.map((u: any) => ({
            id: u.uid || u._id,
            uid: u.uid || u._id,
            name: u.name || 'Customer',
            email: u.email || '',
            mobileNumber: u.mobileNumber,
            avatar: u.avatar || '',
            registeredDate: u.registeredDate || '',
            status: u.status || 'Active',
            lastLogin: u.lastLogin || '',
            role: u.role || 'Customer',
            points: u.points || 0,
          })));
        }
      })
      .catch(() => {});

    fetch('/api/data/admin_settings?id=club_points')
      .then(r => (r.ok ? r.json() : null))
      .then((cfg) => {
        if (!cfg) return;
        if (typeof cfg.isEnabled === 'boolean') setIsEnabled(cfg.isEnabled);
        if (cfg.pointSystemType) setPointSystemType(cfg.pointSystemType);
        if (cfg.earningAmount !== undefined) setEarningAmount(Number(cfg.earningAmount));
        if (cfg.earningPoints !== undefined) setEarningPoints(Number(cfg.earningPoints));
        if (cfg.redeemPoints !== undefined) setRedeemPoints(Number(cfg.redeemPoints));
        if (cfg.redeemValue !== undefined) setRedeemValue(Number(cfg.redeemValue));
      })
      .catch(() => {});
  }, []);

  const handleSaveConfig = async () => {
    setIsSavingConfig(true);
    try {
      const res = await fetch('/api/data/admin_settings/club_points', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isEnabled,
          pointSystemType,
          earningAmount,
          earningPoints,
          redeemPoints,
          redeemValue,
        }),
      });
      if (!res.ok) throw new Error('Save failed');
      toast({ title: 'Saved', description: 'Club point configurations saved.' });
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not save club point settings.' });
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleAdjustPoints = async (adjustment: 'add' | 'remove') => {
    if (!selectedUser || pointsToAdjust <= 0) return;

    const currentPoints = selectedUser.points || 0;
    const newPoints = adjustment === 'add'
      ? currentPoints + pointsToAdjust
      : Math.max(0, currentPoints - pointsToAdjust);

    try {
      const res = await fetch(`/api/data/customers/${encodeURIComponent(selectedUser.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points: newPoints }),
      });
      if (!res.ok) throw new Error('Update failed');

      setCustomers(prev => prev.map(u => (u.id === selectedUser.id ? { ...u, points: newPoints } : u)));
      toast({ title: 'Points Updated', description: `${selectedUser.name} now has ${newPoints} points.` });
      setSelectedUser(null);
      setPointsToAdjust(0);
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not update customer points.' });
    }
  };

  const filteredUsers = customers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={Boolean(selectedUser)} onOpenChange={(open) => !open && setSelectedUser(null)}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Club Point System</h1>

        <Tabs defaultValue="configurations">
          <TabsList>
            <TabsTrigger value="configurations">Configurations</TabsTrigger>
            <TabsTrigger value="user-points">Customer Points</TabsTrigger>
          </TabsList>

          <TabsContent value="configurations" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Club Point Configurations</CardTitle>
                <CardDescription>Set up the rules for earning and redeeming points.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="flex items-center justify-between p-4 border rounded-md">
                  <div>
                    <Label htmlFor="enable-system" className="text-base font-medium">Enable Club Point System</Label>
                    <p className="text-sm text-muted-foreground">Turn the entire points system on or off.</p>
                  </div>
                  <Switch id="enable-system" checked={isEnabled} onCheckedChange={setIsEnabled} />
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-medium">Point System Type</Label>
                  <p className="text-sm text-muted-foreground">Choose how customers earn points.</p>
                  <RadioGroup value={pointSystemType} onValueChange={(value) => setPointSystemType(value as 'amount' | 'product')} className="mt-2 space-y-1">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="amount" id="type-amount" />
                      <Label htmlFor="type-amount" className="font-normal">Amount Spend Based</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="product" id="type-product" />
                      <Label htmlFor="type-product" className="font-normal">Product Based</Label>
                    </div>
                  </RadioGroup>
                </div>

                {pointSystemType === 'amount' && (
                  <div className="space-y-4 p-4 border rounded-md">
                    <h3 className="text-lg font-medium">Earning Points (By Amount)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="earning-amount">Amount Spent</Label>
                        <Input id="earning-amount" type="number" value={earningAmount} onChange={(e) => setEarningAmount(Number(e.target.value) || 0)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="earning-points">Points Earned</Label>
                        <Input id="earning-points" type="number" value={earningPoints} onChange={(e) => setEarningPoints(Number(e.target.value) || 0)} />
                      </div>
                    </div>
                  </div>
                )}

                {pointSystemType === 'product' && (
                  <div className="p-4 border-dashed border-2 rounded-md text-center bg-secondary">
                    <p className="text-sm text-muted-foreground">
                      Points are assigned to individual products. You can set the point value when{' '}
                      <Link href="/admin/products" className="text-primary underline">adding or editing a product</Link>.
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Redeeming Points</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="redeem-points">Points to Redeem</Label>
                      <Input id="redeem-points" type="number" value={redeemPoints} onChange={(e) => setRedeemPoints(Number(e.target.value) || 0)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="redeem-value">Discount Value</Label>
                      <Input id="redeem-value" type="number" value={redeemValue} onChange={(e) => setRedeemValue(Number(e.target.value) || 0)} />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveConfig} disabled={isSavingConfig}>
                  {isSavingConfig ? 'Saving...' : 'Save Configurations'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="user-points" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle>Customer Points Management</CardTitle>
                    <CardDescription>View and manage points for individual customers.</CardDescription>
                  </div>
                  <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search by name or email..." className="pl-8" onChange={(e) => setSearchTerm(e.target.value)} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead className="text-right">Current Points</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-4">
                              <Avatar className="h-9 w-9">
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <div className="grid gap-1">
                                <p className="text-sm font-medium leading-none">{user.name}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">{user.points?.toLocaleString() || 0}</TableCell>
                          <TableCell className="text-right">
                            <DialogTrigger asChild onClick={() => setSelectedUser(user)}>
                              <Button variant="outline">Adjust Points</Button>
                            </DialogTrigger>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {filteredUsers.length === 0 && (
                  <div className="text-center p-8 text-muted-foreground">No customers found.</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Points for {selectedUser?.name}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p>Current Points: <span className="font-bold">{selectedUser?.points?.toLocaleString() || 0}</span></p>
            <div className="space-y-2">
              <Label htmlFor="points-to-adjust">Points to Add or Remove</Label>
              <Input
                id="points-to-adjust"
                type="number"
                value={pointsToAdjust > 0 ? pointsToAdjust : ''}
                onChange={(e) => setPointsToAdjust(parseInt(e.target.value, 10) || 0)}
                placeholder="Enter amount"
              />
            </div>
          </div>
          <DialogFooter className="grid grid-cols-2 gap-4">
            <Button variant="destructive" onClick={() => handleAdjustPoints('remove')} disabled={pointsToAdjust <= 0}>
              <MinusCircle className="mr-2 h-4 w-4" />
              Remove Points
            </Button>
            <Button onClick={() => handleAdjustPoints('add')} className="bg-green-600 hover:bg-green-700" disabled={pointsToAdjust <= 0}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Points
            </Button>
          </DialogFooter>
        </DialogContent>
      </div>
    </Dialog>
  );
}
