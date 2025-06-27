
"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { attributes as initialAttributes, type Attribute } from "@/lib/placeholder-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MoreHorizontal, PlusCircle, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const attributeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Attribute name is required"),
  values: z.string().min(1, "At least one value is required"),
});

type AttributeFormData = z.infer<typeof attributeSchema>;

export default function AttributesPage() {
  const [attributes, setAttributes] = useState<Attribute[]>(initialAttributes);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [attributeToEdit, setAttributeToEdit] = useState<Attribute | null>(null);
  const [attributeToDelete, setAttributeToDelete] = useState<Attribute | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AttributeFormData>({
    resolver: zodResolver(attributeSchema),
  });

  const handleOpenForm = (attribute?: Attribute) => {
    setAttributeToEdit(attribute || null);
    reset(attribute ? { ...attribute, values: attribute.values.join(', ') } : { name: "", values: "" });
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setAttributeToEdit(null);
    setIsFormOpen(false);
  };

  const handleSaveAttribute: SubmitHandler<AttributeFormData> = (data) => {
    const attributeData = {
      name: data.name,
      values: data.values.split(',').map(v => v.trim()).filter(Boolean),
    };

    if (attributeToEdit) {
      setAttributes(attributes.map(a => a.id === attributeToEdit.id ? { ...a, ...attributeData } : a));
    } else {
      const newAttribute: Attribute = { ...attributeData, id: `attr-${Date.now()}` };
      setAttributes([...attributes, newAttribute]);
    }
    handleCloseForm();
  };

  const handleDeleteAttribute = () => {
    if (!attributeToDelete) return;
    setAttributes(attributes.filter(a => a.id !== attributeToDelete.id));
    setAttributeToDelete(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Product Attributes</CardTitle>
              <CardDescription>Manage attributes like size and color for product variations.</CardDescription>
            </div>
            <Button onClick={() => handleOpenForm()}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Attribute
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Attribute Name</TableHead>
                <TableHead>Values</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attributes.map((attribute) => (
                <TableRow key={attribute.id}>
                  <TableCell className="font-medium">{attribute.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                        {attribute.values.map(value => <Badge key={value} variant="secondary">{value}</Badge>)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleOpenForm(attribute)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => setAttributeToDelete(attribute)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Showing <strong>1-{attributes.length}</strong> of <strong>{attributes.length}</strong> attributes.
          </div>
        </CardFooter>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{attributeToEdit ? "Edit Attribute" : "Add New Attribute"}</DialogTitle>
            <DialogDescription>
              Fill in the details for the attribute.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleSaveAttribute)}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Attribute Name</Label>
                <Input id="name" {...register("name")} placeholder="e.g. Color" />
                {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="values">Values (comma-separated)</Label>
                <Textarea id="values" {...register("values")} placeholder="e.g. Red, Green, Blue" />
                {errors.values && <p className="text-destructive text-sm">{errors.values.message}</p>}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={handleCloseForm}>Cancel</Button>
              <Button type="submit">Save Attribute</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!attributeToDelete} onOpenChange={(open) => !open && setAttributeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the attribute "{attributeToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAttribute} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
