import {
  Box,
  TruckIcon,
  UsersIcon,
  ShoppingCartIcon,
  PlusIcon,
  TriangleAlert,
  FlameIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/contexts/AppContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const {
    statistics,
    isLoadingStatistics,
    orders,
    bricks,
    kilns,
    invoices,
    expenses,
  } = useApp();

  if (isLoadingStatistics) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const recentOrders = orders?.slice(0, 3) || [];
  const lowStockBricks =
    bricks?.filter((brick) => brick.currentStock <= brick.minStock) || [];

  // Calculate profit and loss
  const totalRevenue =
    invoices
      ?.filter((i) => i.paymentStatus === "paid")
      .reduce((sum, invoice) => sum + parseFloat(invoice.totalAmount), 0) || 0;
  const totalExpenses =
    expenses?.reduce((sum, expense) => sum + parseFloat(expense.amount), 0) ||
    0;
  const profit = totalRevenue - totalExpenses;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Stats Cards - Beautiful Row Layout */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 overflow-x-auto pb-2">
        <Card
          data-testid="stat-total-bricks"
          className="min-w-[280px] lg:flex-1 hover-lift glass-effect border-brick-light/50 bg-gradient-to-br from-white via-brick-accent/10 to-brick-accent/20"
        >
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="gradient-brick p-4 rounded-2xl shadow-brick flex-shrink-0">
                <Box className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-brick-primary/70 mb-1">
                  Total Bricks in Stock
                </p>
                <p className="text-2xl lg:text-3xl font-bold text-brick-dark truncate">
                  {statistics?.totalBricks?.toLocaleString() || "0"}
                </p>
                <p className="text-xs text-emerald-600 font-medium mt-1">
                  In inventory
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          data-testid="stat-available-Transport"
          className="min-w-[280px] lg:flex-1 hover-lift glass-effect border-blue-200/50 bg-gradient-to-br from-white via-blue-50/30 to-blue-100/20"
        >
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-2xl shadow-lg flex-shrink-0">
                <TruckIcon className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-blue-600/80 mb-1">
                  Available Transport
                </p>
                <p className="text-2xl lg:text-3xl font-bold text-blue-800 truncate">
                  {statistics?.availableTransport || "0"}
                </p>
                <p className="text-xs text-blue-600 font-medium mt-1">
                  Ready for deployment
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          data-testid="stat-active-labor"
          className="min-w-[280px] lg:flex-1 hover-lift glass-effect border-emerald-200/50 bg-gradient-to-br from-white via-emerald-50/30 to-emerald-100/20"
        >
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-4 rounded-2xl shadow-lg flex-shrink-0">
                <UsersIcon className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-emerald-600/80 mb-1">
                  Active Labor
                </p>
                <p className="text-2xl lg:text-3xl font-bold text-emerald-800 truncate">
                  {statistics?.activeLaborers || "0"}
                </p>
                <p className="text-xs text-emerald-600 font-medium mt-1">
                  Currently working
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          data-testid="stat-pending-orders"
          className="min-w-[280px] lg:flex-1 hover-lift glass-effect border-amber-200/50 bg-gradient-to-br from-white via-amber-50/30 to-amber-100/20"
        >
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-4 rounded-2xl shadow-lg flex-shrink-0">
                <ShoppingCartIcon className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-amber-600/80 mb-1">
                  Pending Orders
                </p>
                <p className="text-2xl lg:text-3xl font-bold text-amber-800 truncate">
                  {statistics?.pendingOrders || "0"}
                </p>
                <p className="text-xs text-amber-600 font-medium mt-1">
                  PKR{statistics?.totalSales?.toLocaleString() || "0"} value
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profit & Loss Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover-lift glass-effect border-green-200/50 bg-gradient-to-br from-white via-green-50/30 to-green-100/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-2xl shadow-lg flex-shrink-0">
                <ShoppingCartIcon className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-green-600/80 mb-1">
                  Total Revenue
                </p>
                <p className="text-2xl lg:text-3xl font-bold text-green-800 truncate">
                  PKR{totalRevenue.toLocaleString()}
                </p>
                <p className="text-xs text-green-600 font-medium mt-1">
                  From paid invoices
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift glass-effect border-red-200/50 bg-gradient-to-br from-white via-red-50/30 to-red-100/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-red-500 to-red-600 p-4 rounded-2xl shadow-lg flex-shrink-0">
                <ShoppingCartIcon className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-red-600/80 mb-1">
                  Total Expenses
                </p>
                <p className="text-2xl lg:text-3xl font-bold text-red-800 truncate">
                  PKR{totalExpenses.toLocaleString()}
                </p>
                <p className="text-xs text-red-600 font-medium mt-1">
                  All expenses
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`hover-lift glass-effect ${
            profit >= 0
              ? "border-blue-200/50 bg-gradient-to-br from-white via-blue-50/30 to-blue-100/20"
              : "border-orange-200/50 bg-gradient-to-br from-white via-orange-50/30 to-orange-100/20"
          }`}
        >
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div
                className={`bg-gradient-to-br ${
                  profit >= 0
                    ? "from-blue-500 to-blue-600"
                    : "from-orange-500 to-orange-600"
                } p-4 rounded-2xl shadow-lg flex-shrink-0`}
              >
                <ShoppingCartIcon className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium ${
                    profit >= 0 ? "text-blue-600/80" : "text-orange-600/80"
                  } mb-1`}
                >
                  {profit >= 0 ? "Net Profit" : "Net Loss"}
                </p>
                <p
                  className={`text-2xl lg:text-3xl font-bold ${
                    profit >= 0 ? "text-blue-800" : "text-orange-800"
                  } truncate`}
                >
                  PKR{Math.abs(profit).toLocaleString()}
                </p>
                <p
                  className={`text-xs ${
                    profit >= 0 ? "text-blue-600" : "text-orange-600"
                  } font-medium mt-1`}
                >
                  Revenue - Expenses
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card className="lg:col-span-2 glass-effect border-brick-light/30 hover-lift">
          <CardHeader className="border-b border-brick-light/20">
            <div className="flex items-center justify-between">
              <CardTitle className="text-brick-dark">Recent Orders</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-brick-primary hover:bg-brick-accent"
                data-testid="button-view-all-orders"
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-brick-accent/30 to-white rounded-xl border border-brick-light/30 hover-lift"
                    data-testid={`order-${order.id}`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 gradient-brick rounded-xl flex items-center justify-center shadow-brick">
                        <span className="text-white font-bold text-sm">
                          {order.orderNumber?.slice(-3)}
                        </span>
                      </div>
                      <div>
                        <p
                          className="font-semibold text-brick-dark"
                          data-testid={`order-customer-${order.id}`}
                        >
                          {order.customerName}
                        </p>
                        <p className="text-sm text-brick-primary/70">
                          {order.brickType} • {order.quantity.toLocaleString()}{" "}
                          units
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-brick-dark">
                        PKR{parseFloat(order.totalAmount).toLocaleString()}
                      </p>
                      <Badge
                        className={`${
                          order.status === "delivered"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                            : order.status === "in_transit"
                            ? "bg-blue-100 text-blue-800 border-blue-200"
                            : "bg-amber-100 text-amber-800 border-amber-200"
                        }`}
                      >
                        {order.status.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ShoppingCartIcon className="h-12 w-12 text-brick-primary/30 mx-auto mb-4" />
                <p className="text-brick-primary/60 font-medium">
                  No recent orders found
                </p>
                <p className="text-sm text-brick-primary/40 mt-1">
                  Orders will appear here once created
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="glass-effect border-brick-light/30 hover-lift">
          <CardHeader className="border-b border-brick-light/20">
            <CardTitle className="text-brick-dark">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 pt-6">
            <Link href="/orders">
              <Button
                className="aspect-square w-full h-24 gradient-brick hover:shadow-brick-xl transition-all duration-300 text-white font-bold rounded-3xl flex flex-col items-center justify-center gap-2 hover:scale-105 hover:-translate-y-1"
                data-testid="button-new-order"
              >
                <PlusIcon className="h-8 w-8" />
                <span className="text-xs">New Order</span>
              </Button>
            </Link>

            <Link href="/inventory">
              <Button
                className="aspect-square w-full h-24 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 text-white font-bold rounded-3xl flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-1"
                data-testid="button-add-bricks"
              >
                <Box className="h-8 w-8" />
                <span className="text-xs">Add Bricks</span>
              </Button>
            </Link>

            <Link href="/invoices">
              <Button
                className="aspect-square w-full h-24 bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 hover:from-emerald-600 hover:via-emerald-700 hover:to-emerald-800 text-white font-bold rounded-3xl flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-1"
                data-testid="button-generate-invoice"
              >
                <PlusIcon className="h-8 w-8" />
                <span className="text-xs">Generate Invoice</span>
              </Button>
            </Link>

            <Link href="/Transport">
              <Button
                className="aspect-square w-full h-24 bg-gradient-to-br from-slate-500 via-slate-600 to-slate-700 hover:from-slate-600 hover:via-slate-700 hover:to-slate-800 text-white font-bold rounded-3xl flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-1"
                data-testid="button-add-Transport"
              >
                <TruckIcon className="h-8 w-8" />
                <span className="text-xs">Add Transport</span>
              </Button>
            </Link>

            <Link href="/labor" className="col-span-2">
              <Button
                className="w-full h-24 bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 hover:from-purple-600 hover:via-purple-700 hover:to-purple-800 text-white font-bold rounded-3xl flex items-center justify-center gap-3 transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-1"
                data-testid="button-add-laborer"
              >
                <UsersIcon className="h-8 w-8" />
                <span className="text-lg">Add Laborer</span>
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Active Kilns Timer */}
      {(kilns?.filter((k) => k.status === "firing" && k.startTime).length ?? 0) >
        0 && (
        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <div className="bg-orange-100 p-2 rounded-lg">
                <FlameIcon className="h-5 w-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-orange-900">
                  Active Kilns - Firing
                </h4>
                <p className="text-orange-800 mt-1">
                  Currently firing kilns with elapsed time:
                </p>
                <div className="mt-3 space-y-2">
                  {kilns?.filter((k) => k.status === "firing" && k.startTime)
                    .map((kiln) => {
                      const startTime = new Date(kiln.startTime!);
                      const now = new Date();
                      const elapsedMs = now.getTime() - startTime.getTime();
                      const days = Math.floor(
                        elapsedMs / (1000 * 60 * 60 * 24)
                      );
                      const hours = Math.floor(
                        (elapsedMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
                      );
                      const minutes = Math.floor(
                        (elapsedMs % (1000 * 60 * 60)) / (1000 * 60)
                      );

                      return (
                        <div
                          key={kiln.id}
                          className="flex items-center justify-between bg-white p-3 rounded-lg border border-orange-200"
                        >
                          <div>
                            <span className="font-medium text-gray-900">
                              {kiln.kilnNumber}
                            </span>
                            <span className="text-sm text-gray-600 ml-2">
                              • {kiln.brickType}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="font-mono font-bold text-orange-600 text-lg">
                              {days > 0 ? `${days}d ` : ""}
                              {String(hours).padStart(2, "0")}h{" "}
                              {String(minutes).padStart(2, "0")}m
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              <span className="font-medium text-gray-700">Start:</span>{' '}
                              {startTime.toLocaleString()}
                              {kiln.endTime && (
                                <>
                                  <span className="mx-2">•</span>
                                  <span className="font-medium text-gray-700">End:</span>{' '}
                                  {new Date(kiln.endTime).toLocaleString()}
                                </>
                              )}
                            </div>
                            {kiln.temperature && (
                              <span className="text-xs text-orange-700">
                                {kiln.temperature}°C
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Low Stock Alert */}
      {lowStockBricks.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <div className="bg-amber-100 p-2 rounded-lg">
                <TriangleAlert className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-amber-900">
                  Low Stock Alert
                </h4>
                <p className="text-amber-800 mt-1">
                  The following brick types are running low in stock:
                </p>
                <div className="mt-3 space-y-2">
                  {lowStockBricks.map((brick) => (
                    <div
                      key={brick.id}
                      className="flex items-center justify-between bg-white p-3 rounded-lg"
                      data-testid={`low-stock-${brick.id}`}
                    >
                      <span className="font-medium text-gray-900">
                        {brick.type}
                      </span>
                      <span className="text-amber-600 font-semibold">
                        {brick.currentStock.toLocaleString()} units remaining
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
