

"use client"

import { useState, useEffect } from "react";
import { type User } from "@/lib/placeholder-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoreHorizontal, Trash2, Edit, View, Loader2 } from "lucide-react";
import { format } from 'date-fns';
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { db, docToJSON } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<User | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<User | null>(null);
  const [customerToView, setCustomerToView] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      try {
        const customersSnapshot = await getDocs(collection(db, 'customers'));
        const customerList = customersSnapshot.docs.map(doc => docToJSON(doc) as User);
        setCustomers(customerList);
      } catch (error) {
        console.error("Failed to fetch customers:", error);
        toast({
          variant: 'destructive',
          title: 'Error Fetching Customers',
          description: 'Could not load customer data. Please ensure you are logged in as an admin and have deployed the latest Firestore security rules.',
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchCustomers();
  }, [toast]);

  const handleSaveChanges = async () => {
    if (!customerToEdit) return;
    setIsSaving(true);
    try {
      const docRef = doc(db, 'customers', customerToEdit.id);
      await setDoc(docRef, customerToEdit, { merge: true });
      setCustomers(customers.map(u => u.id === customerToEdit.id ? customerToEdit : u));
      toast({ title: "Success", description: "Customer updated successfully." });
      setCustomerToEdit(null);
    } catch (error) {
      console.error("Error updating customer: ", error);
      toast({ variant: 'destructive', title: "Error", description: "Could not update customer." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!customerToDelete) return;
    try {
      await deleteDoc(doc(db, 'customers', customerToDelete.id));
      setCustomers(customers.filter(u => u.id !== customerToDelete.id));
      toast({ title: "Success", description: "Customer deleted successfully." });
    } catch (error) {
      console.error("Error deleting customer: ", error);
      toast({ variant: 'destructive', title: "Error", description: "Could not delete customer." });
    } finally {
      setCustomerToDelete(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Customers</CardTitle>
          <CardDescription>Manage your customers and view their details.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Registered</TableHead>
                <TableHead className="hidden lg:table-cell">Last Login</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : customers.length > 0 ? customers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="person face" />
                        <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="grid gap-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.mobileNumber || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {user.points?.toLocaleString() || 0}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'Active' ? 'default' : 'secondary'}>{user.status}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{new Date(user.registeredDate).toLocaleDateString()}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {format(new Date(user.lastLogin), "PPP p")}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setCustomerToView(user)}>
                          <View className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setCustomerToEdit(user)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => setCustomerToDelete(user)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No customers found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!customerToView} onOpenChange={(open) => !open && setCustomerToView(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          {customerToView && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={customerToView.avatar} alt={customerToView.name} />
                  <AvatarFallback>{customerToView.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{customerToView.name}</h3>
                  <p className="text-sm text-muted-foreground">{customerToView.email}</p>
                  <Badge variant={customerToView.status === 'Active' ? 'default' : 'secondary'} className="mt-1">
                    {customerToView.status}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Mobile Number</Label>
                  <p className="text-sm font-medium">{customerToView.mobileNumber || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Points</Label>
                  <p className="text-sm font-medium">{customerToView.points || 0}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Role</Label>
                  <p className="text-sm font-medium">{customerToView.role}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">User ID</Label>
                  <p className="text-sm font-mono text-muted-foreground truncate" title={customerToView.id}>{customerToView.id}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Registered</Label>
                  <p className="text-sm font-medium">{new Date(customerToView.registeredDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Last Login</Label>
                  <p className="text-sm font-medium">{format(new Date(customerToView.lastLogin), "PPP p")}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setCustomerToView(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!customerToEdit} onOpenChange={(open) => !open && setCustomerToEdit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          {customerToEdit && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={customerToEdit.name} onChange={(e) => setCustomerToEdit({ ...customerToEdit, name: e.target.value })} disabled={isSaving} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={customerToEdit.email} onChange={(e) => setCustomerToEdit({ ...customerToEdit, email: e.target.value })} disabled={isSaving} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={customerToEdit.status}
                  onValueChange={(value: 'Active' | 'Inactive') => setCustomerToEdit({ ...customerToEdit, status: value })}
                  disabled={isSaving}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <p className="text-sm p-2 bg-secondary rounded-md border">{customerToEdit.role}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCustomerToEdit(null)} disabled={isSaving}>Cancel</Button>
            <Button onClick={handleSaveChanges} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!customerToDelete} onOpenChange={(open) => !open && setCustomerToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the customer account for {customerToDelete?.name}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCustomerToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
