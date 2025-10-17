import { useState } from "react";
import { PlusIcon, SearchIcon, TrashIcon, EditIcon, DollarSignIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/contexts/AppContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function ExpenseManagement() {
  const { expenses, isLoadingExpenses, createExpense, updateExpense, deleteExpense } = useApp();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [formData, setFormData] = useState({
    category: "",
    description: "",
    amount: "",
    expenseDate: new Date().toISOString().split('T')[0],
    paymentMethod: "",
    notes: ""
  });

  const categories = [
    "Raw Materials",
    "Labor",
    "Transportation",
    "Utilities",
    "Maintenance",
    "Equipment",
    "Other"
  ];

  const paymentMethods = [
    "Cash",
    "Bank Transfer",
    "Cheque",
    "Credit Card",
    "Mobile Payment"
  ];

  const filteredExpenses = expenses?.filter(expense =>
    expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.category.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category || !formData.description || !formData.amount || !formData.paymentMethod) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const expenseData = {
        category: formData.category,
        description: formData.description,
        amount: parseFloat(formData.amount),
        expenseDate: new Date(formData.expenseDate),
        paymentMethod: formData.paymentMethod,
        notes: formData.notes || undefined
      };

      if (editingExpense) {
        await updateExpense(editingExpense.id, expenseData);
        toast({
          title: "Success",
          description: "Expense updated successfully"
        });
      } else {
        await createExpense(expenseData);
        toast({
          title: "Success",
          description: "Expense created successfully"
        });
      }
      
      setShowDialog(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save expense",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (expense: any) => {
    setEditingExpense(expense);
    setFormData({
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
      expenseDate: new Date(expense.expenseDate).toISOString().split('T')[0],
      paymentMethod: expense.paymentMethod,
      notes: expense.notes || ""
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await deleteExpense(id);
        toast({
          title: "Success",
          description: "Expense deleted successfully"
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete expense",
          variant: "destructive"
        });
      }
    }
  };

  const resetForm = () => {
    setEditingExpense(null);
    setFormData({
      category: "",
      description: "",
      amount: "",
      expenseDate: new Date().toISOString().split('T')[0],
      paymentMethod: "",
      notes: ""
    });
  };

  const totalExpenses = filteredExpenses.reduce((sum, expense) => 
    sum + parseFloat(expense.amount), 0
  );

  if (isLoadingExpenses) {
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <CardTitle>Expense Management</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Total Expenses: PKR{totalExpenses.toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <SearchIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Button 
                onClick={() => {
                  resetForm();
                  setShowDialog(true);
                }}
                className="bg-brick-primary hover:bg-brick-secondary shrink-0"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center mr-3">
                          <DollarSignIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {expense.description}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(expense.expenseDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline">{expense.category}</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        PKR{parseFloat(expense.amount).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {expense.paymentMethod}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEdit(expense)}
                      >
                        <EditIcon className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(expense.id)}
                      >
                        <TrashIcon className="h-4 w-4 text-red-600" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {filteredExpenses.map((expense) => (
              <Card key={expense.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center mr-3">
                        <DollarSignIcon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {expense.description}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(expense.expenseDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline">{expense.category}</Badge>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <div>
                      <div className="text-xs text-gray-500">Amount</div>
                      <div className="text-sm font-medium">
                        PKR{parseFloat(expense.amount).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Payment Method</div>
                      <div className="text-sm">{expense.paymentMethod}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 border-t pt-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEdit(expense)}
                      className="flex-1"
                    >
                      <EditIcon className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDelete(expense.id)}
                      className="flex-1"
                    >
                      <TrashIcon className="h-4 w-4 mr-1 text-red-600" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
            
          {filteredExpenses.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No expenses found matching your search criteria
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Expense Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingExpense ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Enter expense description"
              />
            </div>

            <div>
              <Label htmlFor="amount">Amount (PKR) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                placeholder="Enter amount"
              />
            </div>

            <div>
              <Label htmlFor="expenseDate">Expense Date *</Label>
              <Input
                id="expenseDate"
                type="date"
                value={formData.expenseDate}
                onChange={(e) => setFormData({...formData, expenseDate: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="paymentMethod">Payment Method *</Label>
              <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({...formData, paymentMethod: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method} value={method}>{method}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Additional notes (optional)"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={() => {
                setShowDialog(false);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button type="submit" className="bg-brick-primary hover:bg-brick-secondary">
                {editingExpense ? 'Update Expense' : 'Create Expense'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
