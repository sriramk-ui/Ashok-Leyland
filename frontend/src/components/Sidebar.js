"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Database, 
  Weight, 
  TrendingUp, 
  Calculator, 
  Download, 
  Settings,
  ChevronLeft,
  Factory,
  ArrowLeftRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

import ThemeToggle from "./ThemeToggle";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: Database, label: "Data Management", href: "/dashboard/data" },
  { icon: Weight, label: "AHP Weighting", href: "/dashboard/weights" },
  { icon: TrendingUp, label: "Ranking Analysis", href: "/dashboard/analysis" },
  { icon: Download, label: "Export Results", href: "/dashboard/export" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-72 h-screen bg-sidebar border-r border-sidebar-border flex flex-col fixed left-0 top-0 z-[60] selection:bg-primary/20 selection:text-primary transition-all duration-300">
      {/* Brand */}
      <div className="p-8 pb-12 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
          <Factory className="w-5 h-5 text-primary-foreground stroke-[2.5]" />
        </div>
        <div>
          <h1 className="text-lg font-black tracking-tighter uppercase italic text-foreground">
            Ashok <span className="text-primary">Leyland</span>
          </h1>
          <p className="text-[9px] text-muted-foreground font-bold tracking-[0.2em] uppercase -mt-1">
            Decision Intelligence
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        <div className="px-4 mb-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-50">
          Main Dashboard
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                isActive 
                  ? "bg-primary/10 text-primary border border-primary/20 shadow-sm" 
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-transform duration-300",
                isActive ? "text-primary" : "group-hover:scale-110"
              )} />
              <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
              
              {isActive && (
                <motion.div 
                  layoutId="active-indicator"
                  className="absolute right-3 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Settings */}
      <div className="p-6 border-t border-sidebar-border bg-sidebar/50 backdrop-blur-sm space-y-4">
        <ThemeToggle />
        
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-4 px-4 py-3 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
        >
          <Settings className="w-5 h-5" />
          <span className="text-xs font-black uppercase tracking-widest">Settings</span>
        </Link>
        <div className="px-4 py-4 rounded-3xl bg-secondary/50 border border-border/50 shadow-inner">
          <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-2 px-1">System Status</p>
          <div className="flex items-center gap-3 px-1">
            <div className="relative">
              <span className="absolute inset-0 w-2 h-2 rounded-full bg-green-500 animate-ping opacity-75" />
              <span className="relative block w-2 h-2 rounded-full bg-green-500" />
            </div>
            <span className="text-[10px] font-bold text-foreground uppercase italic tracking-tight">Active & Optimized</span>
          </div>
        </div>
      </div>
    </div>
  );
}
