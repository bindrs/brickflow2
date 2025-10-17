import { useState } from "react";
import {
  TruckIcon,
  PlusIcon,
  EditIcon,
  Trash2Icon,
  WrenchIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/contexts/AppContext";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTransportchema, type InsertTransport } from "@shared/schema";

export default function TransportManagement() {
  const {
    Transport,
    isLoadingTransport,
    createTransport,
    updateTransport,
    deleteTransport,
    laborers,
    isLoadingLaborers,
  } = useApp();
  const [editingTransport, setEditingTransport] = useState<any>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const form = useForm<InsertTransport>({
    resolver: zodResolver(insertTransportchema),
    defaultValues: {
      registrationNumber: "",
      model: "",
      driverName: "",
      driverPhone: "",
      status: "available",
    },
  });

  const editForm = useForm<InsertTransport>({
    resolver: zodResolver(insertTransportchema),
  });

  // UI-only state for categorizing transport as equipment
  const [category, setCategory] = useState<'vehicle' | 'equipment'>('vehicle');
  const [equipmentType, setEquipmentType] = useState<string>('');
  // Assigned labor states (for add and edit flows)
  const [addAssignedLaborIds, setAddAssignedLaborIds] = useState<string[]>([]);
  const [editAssignedLaborIds, setEditAssignedLaborIds] = useState<string[]>([]);
  // Assign dialog state (separate lightweight dialog)
  const [assignDialogTransport, setAssignDialogTransport] = useState<any>(null);
  const [assignSelectedLaborIds, setAssignSelectedLaborIds] = useState<string[]>([]);

  const onSubmit = async (data: InsertTransport) => {
    try {
      // If user selected an equipment category, encode equipment type into model
      const payload = { ...data } as any;
      if (category === 'equipment' && equipmentType) {
        let modelStr = `Equipment: ${equipmentType}`;
        if (addAssignedLaborIds && addAssignedLaborIds.length > 0) {
          modelStr += `;AssignedLabor:${addAssignedLaborIds.join(",")}`;
        }
        payload.model = modelStr;
      }
      await createTransport(payload);
      form.reset();
      setAddAssignedLaborIds([]);
      setShowAddDialog(false);
    } catch (error) {
      console.error("Failed to create Transport:", error);
    }
  };

  const onEdit = async (data: InsertTransport) => {
    if (!editingTransport) return;
    try {
      const payload = { ...data } as any;
      if (category === 'equipment' && equipmentType) {
        let modelStr = `Equipment: ${equipmentType}`;
        if (editAssignedLaborIds && editAssignedLaborIds.length > 0) {
          modelStr += `;AssignedLabor:${editAssignedLaborIds.join(",")}`;
        }
        payload.model = modelStr;
      }
      await updateTransport(editingTransport.id, payload);
      setEditingTransport(null);
      setEditAssignedLaborIds([]);
    } catch (error) {
      console.error("Failed to update Transport:", error);
    }
  };

  const handleEdit = (Transport: any) => {
    setEditingTransport(Transport);
    editForm.reset({
      registrationNumber: Transport.registrationNumber,
      model: Transport.model,
      driverName: Transport.driverName || "",
      driverPhone: Transport.driverPhone || "",
      status: Transport.status,
    });
    // Infer category/equipmentType from model if it was stored as 'Equipment: ...'
    if (Transport.model && String(Transport.model).startsWith('Equipment:')) {
      setCategory('equipment');
      // model may contain AssignedLabor portion like 'Equipment: Trolley;AssignedLabor:id1,id2'
      const modelStr = String(Transport.model);
      const parts = modelStr.split(';');
      const eqPart = parts[0].replace(/^Equipment:\s*/, '').trim();
      setEquipmentType(eqPart);
      const assignedPart = parts.find((p) => p.startsWith('AssignedLabor:'));
      if (assignedPart) {
        const ids = assignedPart.replace('AssignedLabor:', '').split(',').filter(Boolean);
        setEditAssignedLaborIds(ids);
      } else {
        setEditAssignedLaborIds([]);
      }
    } else {
      setCategory('vehicle');
      setEquipmentType('');
      setEditAssignedLaborIds([]);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this Transport?")) {
      try {
        await deleteTransport(id);
      } catch (error) {
        console.error("Failed to delete Transport:", error);
      }
    }
  };

  if (isLoadingTransport) {
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
          <div className="flex items-center justify-between">
            <CardTitle>Transport Fleet Management</CardTitle>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  data-testid="button-add-Transport"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Transport
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Transport</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="registrationNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Registration Number *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              data-testid="input-registration-number"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Model *</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-model" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <FormControl>
                        <Select onValueChange={(v) => setCategory(v as any)} value={category}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="vehicle">Vehicle</SelectItem>
                            <SelectItem value="equipment">Equipment</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                    {category === 'equipment' && (
                      <FormItem>
                        <FormLabel>Equipment Type</FormLabel>
                        <FormControl>
                          <Select onValueChange={(v) => setEquipmentType(v)} value={equipmentType}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select equipment" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Trolley">Trolley</SelectItem>
                              <SelectItem value="Water Tank">Water Tank</SelectItem>
                              <SelectItem value="Mud Mixer">Mud Mixer</SelectItem>
                              <SelectItem value="Brick Making Machine">Brick Making Machine</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </FormItem>
                    )}
                    {category === 'equipment' && (
                      <div>
                        <FormLabel className="mt-2">Assign Labour</FormLabel>
                        <div className="space-y-2 max-h-40 overflow-auto border rounded p-2">
                          {isLoadingLaborers ? (
                            <div>Loading labourers...</div>
                          ) : (laborers || []).map((l) => (
                            <label key={l.id} className="flex items-center space-x-2">
                              <Checkbox
                                checked={addAssignedLaborIds.includes(l.id)}
                                onCheckedChange={(val) => {
                                  const checked = !!val;
                                  setAddAssignedLaborIds((prev) =>
                                    checked ? [...prev, l.id] : prev.filter((id) => id !== l.id)
                                  );
                                }}
                              />
                              <span className="text-sm">{l.name} ({l.phone})</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                    <FormField
                      control={form.control}
                      name="driverName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Driver Name</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ""}
                              data-testid="input-driver-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="driverPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Driver Phone</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ""}
                              data-testid="input-driver-phone"
                            />
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
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-status">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="available">
                                Available
                              </SelectItem>
                              <SelectItem value="assigned">Assigned</SelectItem>
                              <SelectItem value="maintenance">
                                Maintenance
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowAddDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700"
                        data-testid="button-save-Transport"
                      >
                        Save Transport
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transport Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver
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
                {Transport?.map((Transport) => (
                  <tr
                    key={Transport.id}
                    data-testid={`Transport-row-${Transport.id}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                          <TruckIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div
                            className="text-sm font-medium text-gray-900"
                            data-testid={`Transport-registration-${Transport.id}`}
                          >
                            {Transport.registrationNumber}
                          </div>
                          <div className="text-sm text-gray-500">
                            {Transport.model}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {Transport.driverName ? (
                        <div>
                          <div
                            className="text-sm font-medium text-gray-900"
                            data-testid={`driver-name-${Transport.id}`}
                          >
                            {Transport.driverName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {Transport.driverPhone}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">
                          No driver assigned
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={
                          Transport.status === "available"
                            ? "default"
                            : Transport.status === "assigned"
                            ? "secondary"
                            : "destructive"
                        }
                        data-testid={`Transport-status-${Transport.id}`}
                      >
                        {Transport.status === "maintenance" && (
                          <WrenchIcon className="h-3 w-3 mr-1" />
                        )}
                        {Transport.status.charAt(0).toUpperCase() +
                          Transport.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // open assign dialog and pre-select assigned labourers
                          if (Transport.model && String(Transport.model).includes('AssignedLabor:')) {
                            const assigned = String(Transport.model).split(';').find(p => p.startsWith('AssignedLabor:'))?.replace('AssignedLabor:', '').split(',').filter(Boolean) || [];
                            setAssignSelectedLaborIds(assigned);
                          } else {
                            setAssignSelectedLaborIds([]);
                          }
                          setAssignDialogTransport(Transport);
                        }}
                        title="Assign Labour"
                      >
                        <WrenchIcon className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(Transport)}
                        data-testid={`button-edit-Transport-${Transport.id}`}
                      >
                        <EditIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(Transport.id)}
                        data-testid={`button-delete-Transport-${Transport.id}`}
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                )) || []}
              </tbody>
            </table>

            {(!Transport || Transport.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                No Transport found
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingTransport}
        onOpenChange={() => setEditingTransport(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Transport</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(onEdit)}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="registrationNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registration Number *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        data-testid="input-edit-registration-number"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-edit-model" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel>Type</FormLabel>
                <FormControl>
                  <Select onValueChange={(v) => setCategory(v as any)} value={category}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vehicle">Vehicle</SelectItem>
                      <SelectItem value="equipment">Equipment</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
              {category === 'equipment' && (
                <FormItem>
                  <FormLabel>Equipment Type</FormLabel>
                  <FormControl>
                    <Select onValueChange={(v) => setEquipmentType(v)} value={equipmentType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select equipment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Trolley">Trolley</SelectItem>
                        <SelectItem value="Water Tank">Water Tank</SelectItem>
                        <SelectItem value="Mud Mixer">Mud Mixer</SelectItem>
                        <SelectItem value="Brick Making Machine">Brick Making Machine</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
              <FormField
                control={editForm.control}
                name="driverName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Driver Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ""}
                        data-testid="input-edit-driver-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="driverPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Driver Phone</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ""}
                        data-testid="input-edit-driver-phone"
                      />
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
                        <SelectTrigger data-testid="select-edit-status">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="assigned">Assigned</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingTransport(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700"
                  data-testid="button-update-Transport"
                >
                  Update Transport
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Assign Labour Dialog */}
      <Dialog open={!!assignDialogTransport} onOpenChange={() => setAssignDialogTransport(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Labour to Transport</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-gray-600">Select labourers to assign to this equipment.</div>
            <div className="space-y-2 max-h-60 overflow-auto border rounded p-2">
              {isLoadingLaborers ? (
                <div>Loading labourers...</div>
              ) : (
                (laborers || []).map((l) => (
                  <label key={l.id} className="flex items-center space-x-2">
                    <Checkbox
                      checked={assignSelectedLaborIds.includes(l.id)}
                      onCheckedChange={(val) => {
                        const checked = !!val;
                        setAssignSelectedLaborIds((prev) =>
                          checked ? [...prev, l.id] : prev.filter((id) => id !== l.id)
                        );
                      }}
                    />
                    <span className="text-sm">{l.name} ({l.phone})</span>
                  </label>
                ))
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setAssignDialogTransport(null)}>Cancel</Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={async () => {
                  if (!assignDialogTransport) return;
                  try {
                    // Preserve equipment type if present
                    const modelStr = assignDialogTransport.model || '';
                    let parts = modelStr.split(';').filter(Boolean).map((p: string) => p.trim());
                    const eqPart = parts.find((p: string) => p.startsWith('Equipment:')) || (category === 'equipment' && equipmentType ? `Equipment: ${equipmentType}` : undefined);
                    const assignedPart = assignSelectedLaborIds && assignSelectedLaborIds.length > 0 ? `AssignedLabor:${assignSelectedLaborIds.join(',')}` : undefined;
                    const newParts = [eqPart, assignedPart].filter(Boolean).map(p => p as string);
                    const newModel = newParts.join(';');
                    await updateTransport(assignDialogTransport.id, { model: newModel });
                    setAssignDialogTransport(null);
                  } catch (error) {
                    console.error('Failed to assign labour:', error);
                  }
                }}
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
