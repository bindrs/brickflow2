
import { useState } from "react";
import { UsersIcon, PlusIcon, EditIcon, Trash2Icon, PhoneIcon, MapPinIcon, CalendarIcon, DollarSignIcon, ClockIcon, TrendingUpIcon, UserCheckIcon, EyeIcon, SaveIcon, PlusCircleIcon, MinusCircleIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/contexts/AppContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertLaborerSchema, type InsertLaborer } from "@shared/schema";

export default function LaborManagement() {
  const { laborers, isLoadingLaborers, createLaborer, updateLaborer, deleteLaborer } = useApp();
  const [editingLaborer, setEditingLaborer] = useState<any>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedLaborer, setSelectedLaborer] = useState<any>(null);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState<{[key: string]: any[]}>({});
  const [salaryRecords, setSalaryRecords] = useState<{[key: string]: any[]}>({});
  const [newAttendance, setNewAttendance] = useState({ date: '', hours: '', overtime: '', status: 'present' });
  const [newSalary, setNewSalary] = useState({ month: '', basicSalary: '', bonus: '', deductions: '', description: '' });

  // Derive salaryData from laborers and salaryRecords
  const salaryData = laborers?.map(laborer => {
    const records = salaryRecords[laborer.id] || [];
    // Find the latest salary record for the worker, or use default values
    const latestRecord = records.length > 0
      ? records[records.length - 1]
      : {
          basicSalary: parseFloat(laborer.monthlySalary),
          bonus: 0,
          deductions: 0,
          totalSalary: parseFloat(laborer.monthlySalary),
          daysWorked: 0,
          totalDays: 30,
          name: laborer.name,
          monthlySalary: parseFloat(laborer.monthlySalary),
          id: laborer.id,
        };

    return {
      id: laborer.id,
      name: laborer.name,
      monthlySalary: parseFloat(laborer.monthlySalary),
      bonus: latestRecord.bonus || 0,
      deductions: latestRecord.deductions || 0,
      totalSalary: (latestRecord.basicSalary || parseFloat(laborer.monthlySalary)) + (latestRecord.bonus || 0) - (latestRecord.deductions || 0),
      daysWorked: latestRecord.daysWorked || 0,
      totalDays: latestRecord.totalDays || 30,
    };
  }) || [];

  salaryData.forEach(salary => {
    salary.totalSalary = salary.monthlySalary + salary.bonus - salary.deductions;
  });

  // Dummy attendanceData for overview cards and tables
  const attendanceData = laborers?.map(laborer => {
    const records = attendanceRecords[laborer.id] || [];
    const daysWorked = records.filter(r => r.status === 'present' || r.status === 'half_day' || r.status === 'late').length;
    const totalDays = 30;
    const hoursWorked = records.reduce((sum, r) => sum + (parseFloat(r.hours) || 0), 0);
    const overtimeHours = records.reduce((sum, r) => sum + (parseFloat(r.overtime) || 0), 0);
    const attendance = totalDays ? (daysWorked / totalDays) * 100 : 0;
    return {
      id: laborer.id,
      name: laborer.name,
      daysWorked,
      totalDays,
      hoursWorked,
      overtimeHours,
      attendance,
    };
  }) || [];

  const totalSalaryBudget = salaryData.reduce((sum, salary) => sum + salary.totalSalary, 0);
  const averageAttendance = attendanceData.reduce((sum, att) => sum + att.attendance, 0) / attendanceData.length || 0;

  const form = useForm<InsertLaborer>({
    resolver: zodResolver(insertLaborerSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      monthlySalary: "15000.00",
      status: "active"
    }
  });

  const editForm = useForm<InsertLaborer>({
    resolver: zodResolver(insertLaborerSchema),
  });

  const onSubmit = async (data: InsertLaborer) => {
    try {
      await createLaborer(data);
      form.reset();
      setShowAddDialog(false);
    } catch (error) {
      console.error('Failed to create laborer:', error);
    }
  };

  const onEdit = async (data: InsertLaborer) => {
    if (!editingLaborer) return;
    try {
      await updateLaborer(editingLaborer.id, data);
      setEditingLaborer(null);
    } catch (error) {
      console.error('Failed to update laborer:', error);
    }
  };

  const handleEdit = (laborer: any) => {
    setEditingLaborer(laborer);
    editForm.reset({
      name: laborer.name,
      phone: laborer.phone,
      address: laborer.address || "",
      monthlySalary: laborer.monthlySalary,
      status: laborer.status
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this laborer?')) {
      try {
        await deleteLaborer(id);
      } catch (error) {
        console.error('Failed to delete laborer:', error);
      }
    }
  };

  const handleViewProfile = (laborer: any) => {
    setSelectedLaborer(laborer);
    setShowProfileDialog(true);
    // Initialize records if not exists
    if (!attendanceRecords[laborer.id]) {
      setAttendanceRecords(prev => ({ ...prev, [laborer.id]: [] }));
    }
    if (!salaryRecords[laborer.id]) {
      setSalaryRecords(prev => ({ ...prev, [laborer.id]: [] }));
    }
  };

  const addAttendanceRecord = () => {
    if (!selectedLaborer || !newAttendance.date || !newAttendance.hours) {
      alert('Please fill in all required fields (Date and Regular Hours)');
      return;
    }
    
    const hours = parseFloat(newAttendance.hours);
    const overtime = parseFloat(newAttendance.overtime) || 0;
    
    if (isNaN(hours) || hours < 0) {
      alert('Please enter a valid number for regular hours');
      return;
    }
    
    if (overtime < 0) {
      alert('Overtime hours cannot be negative');
      return;
    }
    
    const record = {
      id: Date.now(),
      date: newAttendance.date,
      hours: hours,
      overtime: overtime,
      status: newAttendance.status,
      addedOn: new Date().toLocaleDateString()
    };

    setAttendanceRecords(prev => ({
      ...prev,
      [selectedLaborer.id]: [...(prev[selectedLaborer.id] || []), record]
    }));

    setNewAttendance({ date: '', hours: '', overtime: '', status: 'present' });
    
    // Show success message
    alert('Attendance record added successfully!');
  };

  const addSalaryRecord = () => {
    if (!selectedLaborer || !newSalary.month || !newSalary.basicSalary) {
      alert('Please fill in all required fields (Month and Basic Salary)');
      return;
    }
    
    const basicSalary = parseFloat(newSalary.basicSalary);
    const bonus = parseFloat(newSalary.bonus) || 0;
    const deductions = parseFloat(newSalary.deductions) || 0;
    
    if (isNaN(basicSalary) || basicSalary <= 0) {
      alert('Please enter a valid positive amount for basic salary');
      return;
    }
    
    if (bonus < 0) {
      alert('Bonus amount cannot be negative');
      return;
    }
    
    if (deductions < 0) {
      alert('Deductions amount cannot be negative');
      return;
    }
    
    // Check if salary record already exists for this month
    const existingRecords = salaryRecords[selectedLaborer.id] || [];
    const monthExists = existingRecords.some(record => record.month === newSalary.month);
    
    if (monthExists) {
      if (!confirm(`A salary record for ${newSalary.month} already exists. Do you want to add another record for the same month?`)) {
        return;
      }
    }
    
    const record = {
      id: Date.now(),
      month: newSalary.month,
      basicSalary: basicSalary,
      bonus: bonus,
      deductions: deductions,
      description: newSalary.description || 'Monthly salary',
      totalSalary: basicSalary + bonus - deductions,
      addedOn: new Date().toLocaleDateString()
    };

    setSalaryRecords(prev => ({
      ...prev,
      [selectedLaborer.id]: [...(prev[selectedLaborer.id] || []), record]
    }));

    setNewSalary({ month: '', basicSalary: '', bonus: '', deductions: '', description: '' });
    
    // Show success message
    alert(`Salary record for ${record.month} added successfully! Total: PKR${record.totalSalary.toLocaleString()}`);
  };

  const removeAttendanceRecord = (recordId: number) => {
    if (!selectedLaborer) return;
    setAttendanceRecords(prev => ({
      ...prev,
      [selectedLaborer.id]: prev[selectedLaborer.id].filter(record => record.id !== recordId)
    }));
  };

  const removeSalaryRecord = (recordId: number) => {
    if (!selectedLaborer) return;
    setSalaryRecords(prev => ({
      ...prev,
      [selectedLaborer.id]: prev[selectedLaborer.id].filter(record => record.id !== recordId)
    }));
  };

  if (isLoadingLaborers) {
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
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Workers</p>
                <p className="text-3xl font-bold text-blue-800">{laborers?.length || 0}</p>
              </div>
              <UsersIcon className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Monthly Budget</p>
                <p className="text-2xl font-bold text-green-800">PKR{totalSalaryBudget.toLocaleString()}</p>
              </div>
              <DollarSignIcon className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Avg. Attendance</p>
                <p className="text-3xl font-bold text-purple-800">{averageAttendance.toFixed(1)}%</p>
              </div>
              <UserCheckIcon className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Active Workers</p>
                <p className="text-3xl font-bold text-orange-800">
                  {laborers?.filter(l => l.status === 'active').length || 0}
                </p>
              </div>
              <TrendingUpIcon className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-gray-800">Labor Management System</CardTitle>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300" data-testid="button-add-laborer">
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add New Worker
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Worker</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-laborer-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number *</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-laborer-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Textarea {...field} value={field.value || ""} data-testid="input-laborer-address" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="monthlySalary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monthly Salary (PKR) *</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-monthly-salary" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-laborer-status">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                              <SelectItem value="on_leave">On Leave</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-green-600 hover:bg-green-700" data-testid="button-save-laborer">
                        Save Worker
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="workers" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-100 rounded-lg p-1">
              <TabsTrigger value="workers" className="font-semibold">Workers</TabsTrigger>
              <TabsTrigger value="salary" className="font-semibold">Salary</TabsTrigger>
              <TabsTrigger value="attendance" className="font-semibold">Attendance</TabsTrigger>
              <TabsTrigger value="accounts" className="font-semibold">Accounts</TabsTrigger>
            </TabsList>

            <TabsContent value="workers" className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 rounded-t-lg">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Worker Details</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Contact Info</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Salary and Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {laborers?.map((laborer) => (
                      <tr key={laborer.id} className="hover:bg-gray-50 transition-colors" data-testid={`laborer-row-${laborer.id}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-4 shadow-md">
                              <UsersIcon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900" data-testid={`laborer-name-${laborer.id}`}>
                                {laborer.name}
                              </div>
                              <div className="text-xs text-gray-500">ID: {laborer.id.slice(0, 8)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center text-sm text-gray-900">
                              <PhoneIcon className="h-4 w-4 mr-2 text-gray-500" />
                              {laborer.phone}
                            </div>
                            {laborer.address && (
                              <div className="flex items-start text-sm text-gray-500">
                                <MapPinIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                                <span className="break-words">{laborer.address}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="text-sm font-semibold text-gray-900">
                              PKR{parseFloat(laborer.monthlySalary).toLocaleString()}/month
                            </div>
                            <Badge 
                              variant={laborer.status === 'active' ? 'default' : 
                                     laborer.status === 'inactive' ? 'destructive' : 'secondary'}
                              className="font-medium"
                              data-testid={`laborer-status-${laborer.id}`}
                            >
                              {laborer.status === 'on_leave' ? 'On Leave' : laborer.status.charAt(0).toUpperCase() + laborer.status.slice(1)}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleViewProfile(laborer)}
                            className="hover:bg-green-50 hover:text-green-600 transition-colors"
                            data-testid={`button-view-profile-${laborer.id}`}
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEdit(laborer)}
                            className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            data-testid={`button-edit-laborer-${laborer.id}`}
                          >
                            <EditIcon className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDelete(laborer.id)}
                            className="hover:bg-red-50 hover:text-red-600 transition-colors"
                            data-testid={`button-delete-laborer-${laborer.id}`}
                          >
                            <Trash2Icon className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    )) || []}
                  </tbody>
                </table>
                
                {(!laborers || laborers.length === 0) && (
                  <div className="text-center py-12 text-gray-500">
                    <UsersIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No workers found</p>
                    <p className="text-sm">Add your first worker to get started</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="salary" className="space-y-4">
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border border-green-200 mb-6">
                <h3 className="text-lg font-semibold text-green-800 mb-2">Monthly Salary Overview</h3>
                <p className="text-3xl font-bold text-green-900">PKR{totalSalaryBudget.toLocaleString()}</p>
                <p className="text-sm text-green-600 mt-1">Total monthly budget</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-green-50 rounded-t-lg">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Worker</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Days Worked</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Monthly Salary</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Bonus</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Deductions</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {salaryData.map((salary) => (
                      <tr key={salary.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{salary.name}</div>
                          <div className="text-sm text-gray-500">PKR{salary.monthlySalary.toLocaleString()}/month</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{salary.daysWorked}/{salary.totalDays} days</div>
                          <div className="text-xs text-gray-500">{((salary.daysWorked/salary.totalDays)*100).toFixed(1)}% attendance</div>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">
                          PKR{salary.monthlySalary.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 font-medium text-green-600">
                          PKR{salary.bonus.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 font-medium text-red-600">
                          PKR{salary.deductions.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 font-bold text-green-600">
                          PKR{salary.totalSalary.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="attendance" className="space-y-4">
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 mb-6">
                <h3 className="text-lg font-semibold text-purple-800 mb-2">Attendance Overview</h3>
                <p className="text-3xl font-bold text-purple-900">{averageAttendance.toFixed(1)}%</p>
                <p className="text-sm text-purple-600 mt-1">Average attendance rate</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-purple-50 rounded-t-lg">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Worker</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Days Present</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Hours Worked</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Attendance Rate</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {attendanceData.map((attendance) => (
                      <tr key={attendance.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{attendance.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {attendance.daysWorked}/{attendance.totalDays} days
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{attendance.hoursWorked}h</div>
                          <div className="text-xs text-gray-500">+{attendance.overtimeHours}h OT</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <Badge 
                              variant={attendance.attendance >= 90 ? 'default' : 
                                     attendance.attendance >= 75 ? 'secondary' : 'destructive'}
                              className="font-semibold"
                            >
                              {attendance.attendance.toFixed(1)}%
                            </Badge>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="accounts" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <CardContent className="p-6 text-center">
                    <DollarSignIcon className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <p className="text-sm font-medium text-blue-600 mb-1">Total Payroll</p>
                    <p className="text-2xl font-bold text-blue-800">PKR{totalSalaryBudget.toLocaleString()}</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <CardContent className="p-6 text-center">
                    <UserCheckIcon className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <p className="text-sm font-medium text-green-600 mb-1">Total Bonus</p>
                    <p className="text-2xl font-bold text-green-800">
                      PKR{salaryData.reduce((sum, s) => sum + s.bonus, 0).toLocaleString()}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                  <CardContent className="p-6 text-center">
                    <TrendingUpIcon className="h-8 w-8 mx-auto mb-2 text-red-600" />
                    <p className="text-sm font-medium text-red-600 mb-1">Total Deductions</p>
                    <p className="text-2xl font-bold text-red-800">
                      PKR{salaryData.reduce((sum, s) => sum + s.deductions, 0).toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    Monthly Account Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-700">Base Salary Payment</span>
                      <span className="font-bold text-gray-900">
                        PKR{salaryData.reduce((sum, s) => sum + s.monthlySalary, 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                      <span className="font-medium text-green-700">Total Bonus Payment</span>
                      <span className="font-bold text-green-900">
                        PKR{salaryData.reduce((sum, s) => sum + s.bonus, 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                      <span className="font-medium text-red-700">Total Deductions</span>
                      <span className="font-bold text-red-900">
                        -PKR{salaryData.reduce((sum, s) => sum + s.deductions, 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-green-100 rounded-lg border-2 border-green-200">
                      <span className="font-bold text-green-800 text-lg">Total Monthly Expense</span>
                      <span className="font-bold text-green-900 text-xl">
                        PKR{totalSalaryBudget.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Worker Profile Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800">
              {selectedLaborer?.name} - Worker Profile
            </DialogTitle>
          </DialogHeader>
          
          {selectedLaborer && (
            <div className="space-y-6">
              {/* Worker Basic Info */}
              <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Full Name</p>
                      <p className="text-lg font-bold text-blue-900">{selectedLaborer.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-600">Phone</p>
                      <p className="text-lg font-bold text-blue-900">{selectedLaborer.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-600">Monthly Salary</p>
                      <p className="text-lg font-bold text-blue-900">PKR{parseFloat(selectedLaborer.monthlySalary).toLocaleString()}/month</p>
                    </div>
                  </div>
                  {selectedLaborer.address && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-blue-600">Address</p>
                      <p className="text-blue-900">{selectedLaborer.address}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Tabs defaultValue="attendance" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-lg p-1">
                  <TabsTrigger value="attendance" className="font-semibold">Manual Attendance</TabsTrigger>
                  <TabsTrigger value="salary" className="font-semibold">Manual Salary</TabsTrigger>
                </TabsList>

                {/* Manual Attendance Tab */}
                <TabsContent value="attendance" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5" />
                        Add Attendance Record
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Date</label>
                          <Input
                            type="date"
                            value={newAttendance.date}
                            onChange={(e) => setNewAttendance(prev => ({ ...prev, date: e.target.value }))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Regular Hours</label>
                          <Input
                            type="number"
                            step="0.5"
                            placeholder="8"
                            value={newAttendance.hours}
                            onChange={(e) => setNewAttendance(prev => ({ ...prev, hours: e.target.value }))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Overtime Hours</label>
                          <Input
                            type="number"
                            step="0.5"
                            placeholder="0"
                            value={newAttendance.overtime}
                            onChange={(e) => setNewAttendance(prev => ({ ...prev, overtime: e.target.value }))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Status</label>
                          <Select value={newAttendance.status} onValueChange={(value) => setNewAttendance(prev => ({ ...prev, status: value }))}>
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="present">Present</SelectItem>
                              <SelectItem value="absent">Absent</SelectItem>
                              <SelectItem value="half_day">Half Day</SelectItem>
                              <SelectItem value="late">Late</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-end">
                          <Button onClick={addAttendanceRecord} className="w-full bg-green-600 hover:bg-green-700">
                            <PlusCircleIcon className="h-4 w-4 mr-2" />
                            Add Record
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Attendance History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Date</th>
                              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Regular Hours</th>
                              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Overtime</th>
                              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Status</th>
                              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Added On</th>
                              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {(attendanceRecords[selectedLaborer.id] || []).map((record) => (
                              <tr key={record.id} className="hover:bg-gray-50">
                                <td className="px-4 py-2 text-sm">{record.date}</td>
                                <td className="px-4 py-2 text-sm">{record.hours}h</td>
                                <td className="px-4 py-2 text-sm">{record.overtime}h</td>
                                <td className="px-4 py-2">
                                  <Badge variant={record.status === 'present' ? 'default' : record.status === 'absent' ? 'destructive' : 'secondary'}>
                                    {record.status.replace('_', ' ').toUpperCase()}
                                  </Badge>
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-500">{record.addedOn}</td>
                                <td className="px-4 py-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeAttendanceRecord(record.id)}
                                    className="hover:bg-red-50 hover:text-red-600"
                                  >
                                    <MinusCircleIcon className="h-4 w-4" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {(!attendanceRecords[selectedLaborer.id] || attendanceRecords[selectedLaborer.id].length === 0) && (
                          <div className="text-center py-8 text-gray-500">
                            <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p>No attendance records found</p>
                            <p className="text-sm">Add the first attendance record above</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Manual Salary Tab */}
                <TabsContent value="salary" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSignIcon className="h-5 w-5" />
                        Add Salary Record
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Month</label>
                          <Input
                            type="month"
                            value={newSalary.month}
                            onChange={(e) => setNewSalary(prev => ({ ...prev, month: e.target.value }))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Basic Salary (PKR)</label>
                          <Input
                            type="number"
                            placeholder="15000"
                            value={newSalary.basicSalary}
                            onChange={(e) => setNewSalary(prev => ({ ...prev, basicSalary: e.target.value }))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Bonus (PKR)</label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={newSalary.bonus}
                            onChange={(e) => setNewSalary(prev => ({ ...prev, bonus: e.target.value }))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Deductions (PKR)</label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={newSalary.deductions}
                            onChange={(e) => setNewSalary(prev => ({ ...prev, deductions: e.target.value }))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Description</label>
                          <Input
                            placeholder="Monthly salary"
                            value={newSalary.description}
                            onChange={(e) => setNewSalary(prev => ({ ...prev, description: e.target.value }))}
                            className="mt-1"
                          />
                        </div>
                        <div className="flex items-end">
                          <Button onClick={addSalaryRecord} className="w-full bg-green-600 hover:bg-green-700">
                            <PlusCircleIcon className="h-4 w-4 mr-2" />
                            Add Salary
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Salary History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Month</th>
                              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Basic Salary</th>
                              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Bonus</th>
                              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Deductions</th>
                              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Total</th>
                              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Description</th>
                              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Added On</th>
                              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {(salaryRecords[selectedLaborer.id] || []).map((record) => (
                              <tr key={record.id} className="hover:bg-gray-50">
                                <td className="px-4 py-2 text-sm">{record.month}</td>
                                <td className="px-4 py-2 text-sm font-medium">PKR{record.basicSalary.toLocaleString()}</td>
                                <td className="px-4 py-2 text-sm text-green-600">PKR{record.bonus.toLocaleString()}</td>
                                <td className="px-4 py-2 text-sm text-red-600">PKR{record.deductions.toLocaleString()}</td>
                                <td className="px-4 py-2 text-sm font-bold text-green-700">PKR{record.totalSalary.toLocaleString()}</td>
                                <td className="px-4 py-2 text-sm">{record.description}</td>
                                <td className="px-4 py-2 text-sm text-gray-500">{record.addedOn}</td>
                                <td className="px-4 py-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeSalaryRecord(record.id)}
                                    className="hover:bg-red-50 hover:text-red-600"
                                  >
                                    <MinusCircleIcon className="h-4 w-4" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {(!salaryRecords[selectedLaborer.id] || salaryRecords[selectedLaborer.id].length === 0) && (
                          <div className="text-center py-8 text-gray-500">
                            <DollarSignIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p>No salary records found</p>
                            <p className="text-sm">Add the first salary record above</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end">
                <Button onClick={() => setShowProfileDialog(false)} variant="outline">
                  Close Profile
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingLaborer} onOpenChange={() => setEditingLaborer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Worker Details</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEdit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-edit-laborer-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-edit-laborer-phone" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ""} data-testid="input-edit-laborer-address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="monthlySalary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Salary (PKR) *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-edit-monthly-salary" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-laborer-status">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="on_leave">On Leave</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setEditingLaborer(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700" data-testid="button-update-laborer">
                  Update Worker
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
