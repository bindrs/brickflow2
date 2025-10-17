import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  ChartBarIcon,
  Box,
  TruckIcon,
  UsersIcon,
  ShoppingCartIcon,
  Underline,
  Settings as SettingsIcon,
  Menu,
  X,
  DollarSignIcon,
  FlameIcon,
  CheckCircleIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface LayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/", icon: ChartBarIcon },
  { name: "Bricks Inventory", href: "/inventory", icon: Box },
  { name: "Transport", href: "/Transport", icon: TruckIcon },
  { name: "Labor Management", href: "/labor", icon: UsersIcon },
  { name: "Orders", href: "/orders", icon: ShoppingCartIcon },
  { name: "Invoices", href: "/invoices", icon: Underline },
  { name: "Expenses", href: "/expenses", icon: DollarSignIcon },
  { name: "Kiln Capacity", href: "/kiln", icon: FlameIcon },
  { name: "Settings", href: "/settings", icon: SettingsIcon },
];

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brick-muted to-white">
      {/* Top Navigation */}
      <header className="bg-white/90 backdrop-blur-sm shadow-brick-lg border-b border-brick-light sticky top-0 z-50">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 gradient-brick rounded-xl flex items-center justify-center shadow-brick">
                <Box className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1
                  className="text-lg font-bold text-brick-dark"
                  data-testid="app-title"
                >
                  BrickFlow
                </h1>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive =
                  location === item.href ||
                  (item.href !== "/" && location.startsWith(item.href));

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-4 py-2 rounded-lg transition-all duration-300 hover-lift ${
                      isActive
                        ? "text-white bg-brick-primary shadow-brick"
                        : "text-brick-dark/70 hover:text-brick-primary hover:bg-brick-accent/50"
                    }`}
                    data-testid={`nav-${item.name
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                  >
                    <Icon
                      className={`h-4 w-4 mr-2 transition-transform duration-300 ${
                        isActive ? "scale-110" : "hover:scale-105"
                      }`}
                    />
                    <span className="font-medium text-sm">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col space-y-2 mt-6">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      location === item.href ||
                      (item.href !== "/" && location.startsWith(item.href));

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center px-4 py-3 rounded-lg transition-all duration-300 ${
                          isActive
                            ? "text-white bg-brick-primary shadow-brick"
                            : "text-brick-dark/70 hover:text-brick-primary hover:bg-brick-accent/50"
                        }`}
                      >
                        <Icon className="h-5 w-5 mr-3" />
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 sm:p-6 animate-fade-in">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
