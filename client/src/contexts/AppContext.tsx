import { createContext, useContext, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type {
  Brick,
  Transport,
  Laborer,
  Order,
  Invoice,
  Setting,
  Expense,
  KilnCapacity,
  RoundCompletion,
  InsertBrick,
  InsertTransport,
  InsertLaborer,
  InsertOrder,
  InsertInvoice,
  InsertSetting,
  InsertExpense,
  InsertKilnCapacity,
  InsertRoundCompletion,
} from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface AppContextType {
  // Data
  bricks: Brick[] | undefined;
  Transport: Transport[] | undefined;
  laborers: Laborer[] | undefined;
  orders: Order[] | undefined;
  invoices: Invoice[] | undefined;
  settings: Setting[] | undefined;
  expenses: Expense[] | undefined;
  kilns: KilnCapacity[] | undefined;
  rounds: RoundCompletion[] | undefined;
  statistics: any;

  // Loading states
  isLoadingBricks: boolean;
  isLoadingTransport: boolean;
  isLoadingLaborers: boolean;
  isLoadingOrders: boolean;
  isLoadingInvoices: boolean;
  isLoadingSettings: boolean;
  isLoadingExpenses: boolean;
  isLoadingKilns: boolean;
  isLoadingRounds: boolean;
  isLoadingStatistics: boolean;

  // Mutations
  createBrick: (brick: InsertBrick) => Promise<void>;
  updateBrick: (id: string, brick: Partial<InsertBrick>) => Promise<void>;
  deleteBrick: (id: string) => Promise<void>;

  createTransport: (Transport: InsertTransport) => Promise<void>;
  updateTransport: (id: string, Transport: Partial<InsertTransport>) => Promise<void>;
  deleteTransport: (id: string) => Promise<void>;

  createLaborer: (laborer: InsertLaborer) => Promise<void>;
  updateLaborer: (id: string, laborer: Partial<InsertLaborer>) => Promise<void>;
  deleteLaborer: (id: string) => Promise<void>;

  createOrder: (order: InsertOrder) => Promise<Order>;
  updateOrder: (id: string, order: Partial<InsertOrder>) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;

  createInvoice: (invoice: InsertInvoice) => Promise<void>;
  updateInvoice: (id: string, invoice: Partial<InsertInvoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;

  updateSettings: (settings: InsertSetting[]) => Promise<void>;

  createExpense: (expense: InsertExpense) => Promise<void>;
  updateExpense: (id: string, expense: Partial<InsertExpense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  createKiln: (kiln: InsertKilnCapacity) => Promise<void>;
  updateKiln: (id: string, kiln: Partial<InsertKilnCapacity>) => Promise<void>;
  deleteKiln: (id: string) => Promise<void>;

  createRound: (round: InsertRoundCompletion) => Promise<void>;
  updateRound: (
    id: string,
    round: Partial<InsertRoundCompletion>
  ) => Promise<void>;
  deleteRound: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Queries
  const { data: bricks, isLoading: isLoadingBricks } = useQuery<Brick[]>({
    queryKey: ["/api/bricks"],
  });

  const { data: Transport, isLoading: isLoadingTransport } = useQuery<
    Transport[]
  >({
    queryKey: ["/api/Transport"],
  });

  const { data: laborers, isLoading: isLoadingLaborers } = useQuery<Laborer[]>({
    queryKey: ["/api/laborers"],
  });

  const { data: orders, isLoading: isLoadingOrders } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const { data: invoices, isLoading: isLoadingInvoices } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });

  const { data: settings, isLoading: isLoadingSettings } = useQuery<Setting[]>({
    queryKey: ["/api/settings"],
  });

  const { data: expenses, isLoading: isLoadingExpenses } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  const { data: kilns, isLoading: isLoadingKilns } = useQuery<KilnCapacity[]>({
    queryKey: ["/api/kiln-capacity"],
  });

  const { data: rounds, isLoading: isLoadingRounds } = useQuery<
    RoundCompletion[]
  >({
    queryKey: ["/api/round-completions"],
  });

  const { data: statistics, isLoading: isLoadingStatistics } = useQuery({
    queryKey: ["/api/statistics"],
  });

  // Brick mutations
  const createBrickMutation = useMutation({
    mutationFn: async (brick: InsertBrick) => {
      await apiRequest("POST", "/api/bricks", brick);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bricks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      toast({ title: "Success", description: "Brick created successfully" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create brick",
        variant: "destructive",
      });
    },
  });

  const updateBrickMutation = useMutation({
    mutationFn: async ({
      id,
      brick,
    }: {
      id: string;
      brick: Partial<InsertBrick>;
    }) => {
      await apiRequest("PUT", `/api/bricks/${id}`, brick);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bricks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      toast({ title: "Success", description: "Brick updated successfully" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update brick",
        variant: "destructive",
      });
    },
  });

  const deleteBrickMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/bricks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bricks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      toast({ title: "Success", description: "Brick deleted successfully" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete brick",
        variant: "destructive",
      });
    },
  });

  // Transport mutations
  const createTransportMutation = useMutation({
    mutationFn: async (Transport: InsertTransport) => {
      await apiRequest("POST", "/api/Transport", Transport);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/Transport"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      toast({ title: "Success", description: "Transport created successfully" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create Transport",
        variant: "destructive",
      });
    },
  });

  const updateTransportMutation = useMutation({
    mutationFn: async ({
      id,
      Transport,
    }: {
      id: string;
      Transport: Partial<InsertTransport>;
    }) => {
      await apiRequest("PUT", `/api/Transport/${id}`, Transport);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/Transport"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      toast({ title: "Success", description: "Transport updated successfully" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update Transport",
        variant: "destructive",
      });
    },
  });

  const deleteTransportMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/Transport/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/Transport"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      toast({ title: "Success", description: "Transport deleted successfully" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete Transport",
        variant: "destructive",
      });
    },
  });

  // Laborer mutations
  const createLaborerMutation = useMutation({
    mutationFn: async (laborer: InsertLaborer) => {
      await apiRequest("POST", "/api/laborers", laborer);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/laborers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      toast({ title: "Success", description: "Laborer created successfully" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create laborer",
        variant: "destructive",
      });
    },
  });

  const updateLaborerMutation = useMutation({
    mutationFn: async ({
      id,
      laborer,
    }: {
      id: string;
      laborer: Partial<InsertLaborer>;
    }) => {
      await apiRequest("PUT", `/api/laborers/${id}`, laborer);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/laborers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      toast({ title: "Success", description: "Laborer updated successfully" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update laborer",
        variant: "destructive",
      });
    },
  });

  const deleteLaborerMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/laborers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/laborers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      toast({ title: "Success", description: "Laborer deleted successfully" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete laborer",
        variant: "destructive",
      });
    },
  });

  // Order mutations
  const createOrderMutation = useMutation({
    mutationFn: async (order: InsertOrder) => {
      const res = await apiRequest("POST", "/api/orders", order);
      const data = await res.json();
      return data as Order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bricks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/Transport"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      toast({ title: "Success", description: "Order created successfully" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create order",
        variant: "destructive",
      });
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({
      id,
      order,
    }: {
      id: string;
      order: Partial<InsertOrder>;
    }) => {
      await apiRequest("PUT", `/api/orders/${id}`, order);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      toast({ title: "Success", description: "Order updated successfully" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update order",
        variant: "destructive",
      });
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/orders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      toast({ title: "Success", description: "Order deleted successfully" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete order",
        variant: "destructive",
      });
    },
  });

  // Invoice mutations
  const createInvoiceMutation = useMutation({
    mutationFn: async (invoice: InsertInvoice) => {
      await apiRequest("POST", "/api/invoices", invoice);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      toast({ title: "Success", description: "Invoice created successfully" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create invoice",
        variant: "destructive",
      });
    },
  });

  const updateInvoiceMutation = useMutation({
    mutationFn: async ({
      id,
      invoice,
    }: {
      id: string;
      invoice: Partial<InsertInvoice>;
    }) => {
      await apiRequest("PUT", `/api/invoices/${id}`, invoice);
    },
    onSuccess: () => {
      // Invalidate all queries to ensure UI updates everywhere
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      toast({ title: "Success", description: "Invoice updated successfully" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update invoice",
        variant: "destructive",
      });
    },
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/invoices/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      toast({ title: "Success", description: "Invoice deleted successfully" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete invoice",
        variant: "destructive",
      });
    },
  });

  // Settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: InsertSetting[]) => {
      await apiRequest("PUT", "/api/settings", settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Success", description: "Settings updated successfully" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  // Expense mutations
  const createExpenseMutation = useMutation({
    mutationFn: async (expense: InsertExpense) => {
      await apiRequest("POST", "/api/expenses", expense);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create expense",
        variant: "destructive",
      });
    },
  });

  const updateExpenseMutation = useMutation({
    mutationFn: async ({
      id,
      expense,
    }: {
      id: string;
      expense: Partial<InsertExpense>;
    }) => {
      await apiRequest("PUT", `/api/expenses/${id}`, expense);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update expense",
        variant: "destructive",
      });
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/expenses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete expense",
        variant: "destructive",
      });
    },
  });

  // Kiln mutations
  const createKilnMutation = useMutation({
    mutationFn: async (kiln: InsertKilnCapacity) => {
      await apiRequest("POST", "/api/kiln-capacity", kiln);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kiln-capacity"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create kiln",
        variant: "destructive",
      });
    },
  });

  const updateKilnMutation = useMutation({
    mutationFn: async ({
      id,
      kiln,
    }: {
      id: string;
      kiln: Partial<InsertKilnCapacity>;
    }) => {
      await apiRequest("PUT", `/api/kiln-capacity/${id}`, kiln);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kiln-capacity"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update kiln",
        variant: "destructive",
      });
    },
  });

  const deleteKilnMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/kiln-capacity/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kiln-capacity"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete kiln",
        variant: "destructive",
      });
    },
  });

  // Round mutations
  const createRoundMutation = useMutation({
    mutationFn: async (round: InsertRoundCompletion) => {
      await apiRequest("POST", "/api/round-completions", round);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/round-completions"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create round",
        variant: "destructive",
      });
    },
  });

  const updateRoundMutation = useMutation({
    mutationFn: async ({
      id,
      round,
    }: {
      id: string;
      round: Partial<InsertRoundCompletion>;
    }) => {
      await apiRequest("PUT", `/api/round-completions/${id}`, round);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/round-completions"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update round",
        variant: "destructive",
      });
    },
  });

  const deleteRoundMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/round-completions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/round-completions"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete round",
        variant: "destructive",
      });
    },
  });

  const value: AppContextType = {
    // Data
    bricks,
    Transport,
    laborers,
    orders,
    invoices,
    settings,
    expenses,
    kilns,
    rounds,
    statistics,

    // Loading states
    isLoadingBricks,
    isLoadingTransport,
    isLoadingLaborers,
    isLoadingOrders,
    isLoadingInvoices,
    isLoadingSettings,
    isLoadingExpenses,
    isLoadingKilns,
    isLoadingRounds,
    isLoadingStatistics,

    // Mutations
    createBrick: (brick: InsertBrick) => createBrickMutation.mutateAsync(brick),
    updateBrick: (id: string, brick: Partial<InsertBrick>) =>
      updateBrickMutation.mutateAsync({ id, brick }),
    deleteBrick: (id: string) => deleteBrickMutation.mutateAsync(id),

    createTransport: (Transport: InsertTransport) =>
      createTransportMutation.mutateAsync(Transport),
    updateTransport: (id: string, Transport: Partial<InsertTransport>) =>
      updateTransportMutation.mutateAsync({ id, Transport }),
    deleteTransport: (id: string) => deleteTransportMutation.mutateAsync(id),

    createLaborer: (laborer: InsertLaborer) =>
      createLaborerMutation.mutateAsync(laborer),
    updateLaborer: (id: string, laborer: Partial<InsertLaborer>) =>
      updateLaborerMutation.mutateAsync({ id, laborer }),
    deleteLaborer: (id: string) => deleteLaborerMutation.mutateAsync(id),

    createOrder: (order: InsertOrder) => createOrderMutation.mutateAsync(order),
    updateOrder: (id: string, order: Partial<InsertOrder>) =>
      updateOrderMutation.mutateAsync({ id, order }),
    deleteOrder: (id: string) => deleteOrderMutation.mutateAsync(id),

    createInvoice: (invoice: InsertInvoice) =>
      createInvoiceMutation.mutateAsync(invoice),
    updateInvoice: (id: string, invoice: Partial<InsertInvoice>) =>
      updateInvoiceMutation.mutateAsync({ id, invoice }),
    deleteInvoice: (id: string) => deleteInvoiceMutation.mutateAsync(id),

    updateSettings: (settings: InsertSetting[]) =>
      updateSettingsMutation.mutateAsync(settings),

    createExpense: (expense: InsertExpense) =>
      createExpenseMutation.mutateAsync(expense),
    updateExpense: (id: string, expense: Partial<InsertExpense>) =>
      updateExpenseMutation.mutateAsync({ id, expense }),
    deleteExpense: (id: string) => deleteExpenseMutation.mutateAsync(id),

    createKiln: (kiln: InsertKilnCapacity) =>
      createKilnMutation.mutateAsync(kiln),
    updateKiln: (id: string, kiln: Partial<InsertKilnCapacity>) =>
      updateKilnMutation.mutateAsync({ id, kiln }),
    deleteKiln: (id: string) => deleteKilnMutation.mutateAsync(id),

    createRound: (round: InsertRoundCompletion) =>
      createRoundMutation.mutateAsync(round),
    updateRound: (id: string, round: Partial<InsertRoundCompletion>) =>
      updateRoundMutation.mutateAsync({ id, round }),
    deleteRound: (id: string) => deleteRoundMutation.mutateAsync(id),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
