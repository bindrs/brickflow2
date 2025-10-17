import { useState } from "react";
import { PlusIcon, SearchIcon, TrashIcon, EditIcon, FlameIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/contexts/AppContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function KilnCapacityManagement() {
  const { kilns, isLoadingKilns, bricks, createKiln, updateKiln, deleteKiln } = useApp();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [editingKiln, setEditingKiln] = useState<any>(null);
  const [formData, setFormData] = useState({
    kilnNumber: "",
    capacity: "",
    currentLoad: "",
    brickType: "",
    status: "idle",
    temperature: "",
    startTime: "",
    endTime: ""
  });

  const statuses = [
    { value: "idle", label: "Idle", color: "bg-gray-500" },
    { value: "loading", label: "Loading", color: "bg-blue-500" },
    { value: "firing", label: "Firing", color: "bg-orange-500" },
    { value: "cooling", label: "Cooling", color: "bg-yellow-500" },
    { value: "unloading", label: "Unloading", color: "bg-green-500" },
    { value: "maintenance", label: "Maintenance", color: "bg-red-500" }
  ];

  const filteredKilns = kilns?.filter(kiln =>
    kiln.kilnNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    kiln.brickType.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.kilnNumber || !formData.capacity || !formData.brickType) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      // Auto-set start time when status changes to firing
      let startTime = formData.startTime ? new Date(formData.startTime) : null;
      if (formData.status === 'firing' && !startTime) {
        startTime = new Date();
      }

      const kilnData = {
        kilnNumber: formData.kilnNumber,
        capacity: parseInt(formData.capacity),
        currentLoad: parseInt(formData.currentLoad) || 0,
        brickType: formData.brickType,
        status: formData.status,
        temperature: formData.temperature ? parseInt(formData.temperature) : null,
        startTime: startTime,
        endTime: formData.endTime ? new Date(formData.endTime) : null
      };

      if (editingKiln) {
        await updateKiln(editingKiln.id, kilnData);
        toast({
          title: "Success",
          description: "Kiln updated successfully"
        });
      } else {
        await createKiln(kilnData);
        toast({
          title: "Success",
          description: "Kiln created successfully"
        });
      }
      
      setShowDialog(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save kiln",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (kiln: any) => {
    setEditingKiln(kiln);
    setFormData({
      kilnNumber: kiln.kilnNumber,
      capacity: kiln.capacity.toString(),
      currentLoad: kiln.currentLoad.toString(),
      brickType: kiln.brickType,
      status: kiln.status,
      temperature: kiln.temperature?.toString() || "",
      startTime: kiln.startTime ? new Date(kiln.startTime).toISOString().slice(0, 16) : "",
      endTime: kiln.endTime ? new Date(kiln.endTime).toISOString().slice(0, 16) : ""
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this kiln?")) {
      try {
        await deleteKiln(id);
        toast({
          title: "Success",
          description: "Kiln deleted successfully"
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete kiln",
          variant: "destructive"
        });
      }
    }
  };

  const resetForm = () => {
    setEditingKiln(null);
    setFormData({
      kilnNumber: "",
      capacity: "",
      currentLoad: "",
      brickType: "",
      status: "idle",
      temperature: "",
      startTime: "",
      endTime: ""
    });
  };

  const getStatusColor = (status: string) => {
    return statuses.find(s => s.value === status)?.color || "bg-gray-500";
  };

  const getStatusLabel = (status: string) => {
    return statuses.find(s => s.value === status)?.label || status;
  };

  if (isLoadingKilns) {
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
            <CardTitle>Kiln Capacity Management</CardTitle>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <SearchIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search kilns..."
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
                Add Kiln
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
                    Kiln Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Capacity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Temperature
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredKilns.map((kiln) => (
                  <tr key={kiln.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 ${getStatusColor(kiln.status)} rounded-lg flex items-center justify-center mr-3`}>
                          <FlameIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {kiln.kilnNumber}
                          </div>
                          <div className="text-sm text-gray-500">
                            {kiln.brickType}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {kiln.currentLoad.toLocaleString()} / {kiln.capacity.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {((kiln.currentLoad / kiln.capacity) * 100).toFixed(0)}% Loaded
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {kiln.temperature ? `${kiln.temperature}°C` : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline" className={`${getStatusColor(kiln.status)} text-white`}>
                        {getStatusLabel(kiln.status)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEdit(kiln)}
                      >
                        <EditIcon className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(kiln.id)}
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
            {filteredKilns.map((kiln) => (
              <Card key={kiln.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 ${getStatusColor(kiln.status)} rounded-lg flex items-center justify-center mr-3`}>
                        <FlameIcon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {kiln.kilnNumber}
                        </div>
                        <div className="text-xs text-gray-500">
                          {kiln.brickType}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className={`${getStatusColor(kiln.status)} text-white`}>
                      {getStatusLabel(kiln.status)}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <div>
                      <div className="text-xs text-gray-500">Capacity</div>
                      <div className="text-sm font-medium">
                        {kiln.currentLoad.toLocaleString()} / {kiln.capacity.toLocaleString()} 
                        ({((kiln.currentLoad / kiln.capacity) * 100).toFixed(0)}%)
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Temperature</div>
                      <div className="text-sm">{kiln.temperature ? `${kiln.temperature}°C` : 'N/A'}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 border-t pt-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEdit(kiln)}
                      className="flex-1"
                    >
                      <EditIcon className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDelete(kiln.id)}
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
            
          {filteredKilns.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No kilns found matching your search criteria
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Kiln Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingKiln ? 'Edit Kiln' : 'Add New Kiln'}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="kilnNumber">Kiln Number *</Label>
              <Input
                id="kilnNumber"
                value={formData.kilnNumber}
                onChange={(e) => setFormData({...formData, kilnNumber: e.target.value})}
                placeholder="e.g., KILN-001"
              />
            </div>

            <div>
              <Label htmlFor="brickType">Brick Type *</Label>
              <Select value={formData.brickType} onValueChange={(value) => setFormData({...formData, brickType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select brick type" />
                </SelectTrigger>
                <SelectContent>
                  {bricks?.map((brick) => (
                    <SelectItem key={brick.id} value={brick.type}>{brick.type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="capacity">Capacity (units) *</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                placeholder="Enter capacity"
              />
            </div>

            <div>
              <Label htmlFor="currentLoad">Current Load (units)</Label>
              <Input
                id="currentLoad"
                type="number"
                value={formData.currentLoad}
                onChange={(e) => setFormData({...formData, currentLoad: e.target.value})}
                placeholder="Enter current load"
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="temperature">Temperature (°C)</Label>
              <Input
                id="temperature"
                type="number"
                value={formData.temperature}
                onChange={(e) => setFormData({...formData, temperature: e.target.value})}
                placeholder="Enter temperature"
              />
            </div>

            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({...formData, startTime: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({...formData, endTime: e.target.value})}
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
                {editingKiln ? 'Update Kiln' : 'Create Kiln'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
