"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Database, 
  Weight, 
  TrendingUp, 
  Download, 
  Settings,
  Factory,
  CheckCircle2,
  Cpu,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import ThemeToggle from "./ThemeToggle";

const navItems = [
  { icon: LayoutDashboard, label: "Overview",        href: "/dashboard",           storageKey: null },
  { icon: Database,        label: "Data Management", href: "/dashboard/data",      storageKey: "dss_live_data" },
  { icon: Weight,          label: "AHP Weighting",   href: "/dashboard/weights",   storageKey: "dss_ahp_weights" },
  { icon: TrendingUp,      label: "Ranking Analysis",href: "/dashboard/analysis",  storageKey: "dss_computed_ranking" },
  { icon: Download,        label: "Export Results",  href: "/dashboard/export",    storageKey: null },
];

export default function Sidebar({ isOpen = true }) {
  const pathname = usePathname();
  const [completedSteps, setCompletedSteps] = useState({});

  const [advancedOpen, setAdvancedOpen] = useState(pathname.startsWith("/dashboard/optimization"));

  useEffect(() => {
    const check = () => {
      const status = {};
      navItems.forEach((item) => {
        if (!item.storageKey) { status[item.href] = false; return; }
        const val = localStorage.getItem(item.storageKey);
        status[item.href] = !!(val && val !== "[]" && val !== "null");
      });
      setCompletedSteps(status);
    };
    check();
    const interval = setInterval(check, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={cn(
      "h-screen bg-sidebar border-r border-sidebar-border flex flex-col fixed left-0 top-0 z-[60] selection:bg-primary/20 selection:text-primary transition-all duration-300 overflow-hidden",
      isOpen ? "w-72 translate-x-0" : "w-20 -translate-x-full lg:translate-x-0"
    )}>
      {/* Brand */}
      <div className={cn("flex items-center transition-all duration-300", isOpen ? "p-8 pb-10" : "p-4 py-8 pb-10 justify-center")}>
        <img 
          src="/logo.png" 
          alt="Ashok Leyland" 
          className={cn("transition-all duration-300 object-contain", isOpen ? "w-full max-w-[180px]" : "w-12")} 
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
        <div className={cn("px-4 mb-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-40 transition-all duration-300 whitespace-nowrap overflow-hidden", isOpen ? "w-auto opacity-40" : "w-0 opacity-0")}>
          Workflow
        </div>
        {navItems.map((item, idx) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const isDone = completedSteps[item.href];
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                isActive
                  ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                isOpen ? "px-4 gap-3" : "px-0 justify-center"
              )}
            >
              {/* Step number circle */}
              <div className={cn(
                "w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-black shrink-0 transition-all",
                isActive ? "bg-primary text-white" : isDone ? "bg-emerald-500/15 text-emerald-500" : "bg-secondary text-muted-foreground"
              )}>
                {isDone && !isActive ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <item.icon className="w-3.5 h-3.5" />
                )}
              </div>

              <span className={cn("text-xs font-black uppercase tracking-wider overflow-hidden whitespace-nowrap transition-all duration-300", isOpen ? "opacity-100 w-auto flex-1" : "opacity-0 w-0")}>
                {item.label}
              </span>

              {/* Done badge */}
              {isDone && !isActive && isOpen && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"
                />
              )}

              {isActive && isOpen && (
                <motion.div
                  layoutId="active-indicator"
                  className="absolute right-3 w-1.5 h-1.5 rounded-full bg-primary"
                  style={{ boxShadow: '0 0 8px var(--glow-cyan)' }}
                />
              )}
            </Link>
          );
        })}

        {/* Advanced Divider */}
        <div className="pt-4 pb-2">
          <button 
            onClick={() => { if (isOpen) setAdvancedOpen(!advancedOpen); }}
            className={cn("w-full flex items-center justify-between mb-2 group transition-colors focus:outline-none", isOpen ? "px-4" : "px-0 justify-center cursor-default")}
          >
            <span className={cn("text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] transition-all duration-300 whitespace-nowrap overflow-hidden", isOpen ? "w-auto opacity-40 group-hover:text-foreground" : "w-0 opacity-0")}>
              Advanced
            </span>
            <ChevronRight className={cn("w-3.5 h-3.5 text-muted-foreground transition-all duration-300", advancedOpen && isOpen ? "rotate-90 opacity-40" : "opacity-40", !isOpen && "w-0 opacity-0")} />
          </button>
          <motion.div
             initial={false}
             animate={{ height: (!isOpen || advancedOpen) ? 'auto' : 0, opacity: (!isOpen || advancedOpen) ? 1 : 0 }}
             className="overflow-hidden"
          >
            <Link
              href="/dashboard/optimization"
              className={cn(
                "flex items-center py-3 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                pathname.startsWith("/dashboard/optimization")
                  ? "bg-accent/10 text-accent border border-accent/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                isOpen ? "px-4 gap-3" : "px-0 justify-center"
              )}
            >
              <div className="w-6 h-6 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <Cpu className="w-3.5 h-3.5" />
              </div>
              <span className={cn("text-xs font-black uppercase tracking-wider overflow-hidden whitespace-nowrap transition-all duration-300", isOpen ? "opacity-100 w-auto flex-1" : "opacity-0 w-0")}>
                Optimization
              </span>
              <span className={cn("text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 transition-all duration-300 whitespace-nowrap overflow-hidden", isOpen ? "opacity-100 w-auto" : "opacity-0 w-0 px-0 border-none")}>
                LP
              </span>
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* Footer */}
      <div className={cn("border-t border-sidebar-border bg-sidebar/50 backdrop-blur-sm space-y-1 transition-all duration-300", isOpen ? "p-4" : "p-4 px-2")}>
        <div className={cn("transition-all duration-300 overflow-hidden", isOpen ? "h-auto opacity-100" : "h-0 opacity-0 m-0 p-0")}>
          {isOpen && <ThemeToggle />}
        </div>
        
        <Link
          href="/dashboard/settings"
          className={cn("flex items-center py-3 rounded-2xl text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent transition-all duration-300 w-full group", isOpen ? "px-3 gap-3" : "px-0 justify-center")}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center relative overflow-hidden shrink-0">
            <Settings className="w-4 h-4 text-sidebar-foreground group-hover:text-sidebar-accent-foreground transition-colors" />
          </div>
          <span className={cn("text-xs font-black uppercase tracking-widest transition-all duration-300 overflow-hidden whitespace-nowrap", isOpen ? "opacity-100 w-auto" : "opacity-0 w-0")}>Settings</span>
        </Link>
        <div className={cn("pt-4 border-t border-sidebar-border flex items-center transition-all duration-300", isOpen ? "gap-3 px-3 mt-4" : "gap-0 px-0 justify-center mt-2")}>
           <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-black italic shadow-lg shrink-0" style={{boxShadow: '0 4px 15px var(--glow-cyan)'}}>
             AD
           </div>
           <div className={cn("overflow-hidden transition-all duration-300 whitespace-nowrap", isOpen ? "opacity-100 w-auto flex-1" : "opacity-0 w-0")}>
             <p className="text-sm font-black text-sidebar-foreground truncate">Admin User</p>
             <p className="text-[10px] font-bold text-muted-foreground truncate">System Administrator</p>
           </div>
        </div>
      </div>
    </div>
  );
}
