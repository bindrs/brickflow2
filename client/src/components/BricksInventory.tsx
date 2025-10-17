import { useState } from "react";
import { Box, PlusIcon, SearchIcon, EditIcon, Trash2Icon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/contexts/AppContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBrickSchema, type InsertBrick } from "@shared/schema";

export default function BricksInventory() {
  const { bricks, isLoadingBricks, createBrick, updateBrick, deleteBrick } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingBrick, setEditingBrick] = useState<any>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const form = useForm<InsertBrick>({
    resolver: zodResolver(insertBrickSchema),
    defaultValues: {
      type: "",
      description: "",
      currentStock: 0,
      minStock: 1000,
      unitPrice: "0"
    }
  });

  const brickTypes = ["A+", "B", "Khanger", "clay bricks", "Rora"];

  const editForm = useForm<InsertBrick>({
    resolver: zodResolver(insertBrickSchema),
  });

  const filteredBricks = bricks?.filter(brick =>
    brick.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brick.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const onSubmit = async (data: InsertBrick) => {
    try {
      await createBrick(data);
      form.reset();
      setShowAddDialog(false);
    } catch (error) {
      console.error('Failed to create brick:', error);
    }
  };

  const onEdit = async (data: InsertBrick) => {
    if (!editingBrick) return;
    try {
      await updateBrick(editingBrick.id, data);
      setEditingBrick(null);
    } catch (error) {
      console.error('Failed to update brick:', error);
    }
  };

  const handleEdit = (brick: any) => {
    setEditingBrick(brick);
    editForm.reset({
      type: brick.type,
      description: brick.description,
      currentStock: brick.currentStock,
      minStock: brick.minStock,
      unitPrice: brick.unitPrice
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this brick type?')) {
      try {
        await deleteBrick(id);
      } catch (error) {
        console.error('Failed to delete brick:', error);
      }
    }
  };

  if (isLoadingBricks) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="glass-effect border-brick-light/30 hover-lift">
        <CardHeader className="border-b border-brick-light/20">
          <div className="flex items-center justify-between">
            <CardTitle className="text-brick-dark text-2xl font-bold">Bricks Inventory</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <SearchIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-brick-primary/60" />
                <Input
                  placeholder="Search bricks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 border-brick-light/50 focus:border-brick-primary rounded-xl"
                  data-testid="search-bricks"
                />
              </div>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button className="gradient-brick hover:shadow-brick-lg transition-all duration-300 text-white font-semibold py-2 px-6 rounded-xl" data-testid="button-add-brick">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Bricks
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Brick Type</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Brick Type *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-brick-type">
                                  <SelectValue placeholder="Select brick type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {brickTypes.map((t) => (
                                  <SelectItem key={t} value={t}>
                                    {t}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description *</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-brick-description" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="currentStock"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Stock *</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field} 
                                  onChange={e => field.onChange(parseInt(e.target.value))}
                                  data-testid="input-current-stock"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="minStock"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Min Stock *</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field} 
                                  onChange={e => field.onChange(parseInt(e.target.value))}
                                  data-testid="input-min-stock"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="unitPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unit Price (PKR) *</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-unit-price" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" className="gradient-brick hover:shadow-brick-lg transition-all duration-300 text-white font-semibold rounded-xl" data-testid="button-save-brick">
                          Save Brick
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-brick-accent/50 to-brick-light/30">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-brick-dark uppercase tracking-wider">
                    Brick Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-brick-dark uppercase tracking-wider">
                    Current Stock
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-brick-dark uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-brick-dark uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-brick-dark uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/50 divide-y divide-brick-light/30">
                {filteredBricks.map((brick) => (
                  <tr key={brick.id} data-testid={`brick-row-${brick.id}`} className="hover:bg-brick-accent/20 transition-colors duration-200">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-12 h-12 gradient-brick rounded-xl flex items-center justify-center mr-4 shadow-brick">
                          <Box className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-brick-dark" data-testid={`brick-type-${brick.id}`}>
                            {brick.type}
                          </div>
                          <div className="text-sm text-brick-primary/60">{brick.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm font-semibold text-brick-dark" data-testid={`brick-stock-${brick.id}`}>
                        {brick.currentStock.toLocaleString()} units
                      </div>
                      <div className="text-sm text-brick-primary/60">Min: {brick.minStock.toLocaleString()} units</div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-semibold text-brick-dark" data-testid={`brick-price-${brick.id}`}>
                      PKR{parseFloat(brick.unitPrice).toFixed(2)}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <Badge 
                        className={`${
                          brick.currentStock > brick.minStock ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 
                          brick.currentStock > 0 ? 'bg-amber-100 text-amber-800 border-amber-200' : 
                          'bg-red-100 text-red-800 border-red-200'
                        } font-medium px-3 py-1 rounded-full`}
                        data-testid={`brick-status-${brick.id}`}
                      >
                        {brick.currentStock > brick.minStock ? 'In Stock' : 
                         brick.currentStock > 0 ? 'Low Stock' : 'Out of Stock'}
                      </Badge>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-medium space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-all duration-200"
                        onClick={() => handleEdit(brick)}
                        data-testid={`button-edit-${brick.id}`}
                      >
                        <EditIcon className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-all duration-200"
                        onClick={() => handleDelete(brick.id)}
                        data-testid={`button-delete-${brick.id}`}
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredBricks.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No bricks found matching your search criteria
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingBrick} onOpenChange={() => setEditingBrick(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Brick Type</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEdit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brick Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-brick-type">
                          <SelectValue placeholder="Select brick type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {brickTypes.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-edit-brick-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="currentStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Stock *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={e => field.onChange(parseInt(e.target.value))}
                          data-testid="input-edit-current-stock"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="minStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min Stock *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={e => field.onChange(parseInt(e.target.value))}
                          data-testid="input-edit-min-stock"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={editForm.control}
                name="unitPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Price (PKR) *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-edit-unit-price" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setEditingBrick(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-brick-primary hover:bg-brick-secondary" data-testid="button-update-brick">
                  Update Brick
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
