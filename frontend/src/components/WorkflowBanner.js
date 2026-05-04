"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  Database, 
  Weight, 
  TrendingUp, 
  Download, 
  ChevronRight 
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const steps = [
  {
    id: "data",
    label: "Upload Data",
    shortLabel: "Data",
    href: "/dashboard/data",
    icon: Database,
    storageKey: "dss_live_data",
    helper: "Add candidate sites",
  },
  {
    id: "weights",
    label: "AHP Weights",
    shortLabel: "AHP",
    href: "/dashboard/weights",
    icon: Weight,
    storageKey: "dss_ahp_weights",
    helper: "Set priorities",
  },
  {
    id: "analysis",
    label: "Ranking",
    shortLabel: "Rank",
    href: "/dashboard/analysis",
    icon: TrendingUp,
    storageKey: "dss_computed_ranking",
    helper: "TOPSIS + VIKOR",
  },
  {
    id: "export",
    label: "Export",
    shortLabel: "Report",
    href: "/dashboard/export",
    icon: Download,
    storageKey: null, // always accessible
    helper: "Download results",
  },
];

export default function WorkflowBanner() {
  const pathname = usePathname();
  const [completedSteps, setCompletedSteps] = useState({});

  useEffect(() => {
    const check = () => {
      const status = {};
      steps.forEach((step) => {
        if (!step.storageKey) { status[step.id] = false; return; }
        const val = localStorage.getItem(step.storageKey);
        status[step.id] = !!(val && val !== "[]" && val !== "null");
      });
      setCompletedSteps(status);
    };
    check();
    window.addEventListener("storage", check);
    // Poll every 2s to catch in-page localStorage writes
    const interval = setInterval(check, 2000);
    return () => { window.removeEventListener("storage", check); clearInterval(interval); };
  }, [pathname]);

  const activeIdx = steps.findIndex((s) => pathname.startsWith(s.href));

  return (
    <div className="w-full px-6 lg:px-12 py-3 border-b border-border bg-background/60 backdrop-blur-xl">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between gap-2">
          {steps.map((step, idx) => {
            const isActive = pathname.startsWith(step.href);
            const isCompleted = completedSteps[step.id];
            const isPast = activeIdx > idx;
            const Icon = step.icon;

            return (
              <div key={step.id} className="flex items-center flex-1 min-w-0">
                <Link
                  href={step.href}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-2xl transition-all duration-300 group flex-1 min-w-0",
                    isActive
                      ? "bg-primary/10 border border-primary/30"
                      : "hover:bg-secondary/60"
                  )}
                >
                  {/* Step icon / complete badge */}
                  <div className={cn(
                    "w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300",
                    isActive
                      ? "bg-primary text-white shadow-lg workflow-step-active"
                      : isCompleted
                      ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                      : "bg-secondary text-muted-foreground"
                  )}>
                    {isCompleted && !isActive ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </motion.div>
                    ) : (
                      <Icon className="w-3.5 h-3.5" />
                    )}
                  </div>

                  {/* Labels */}
                  <div className="hidden sm:block min-w-0">
                    <p className={cn(
                      "text-[10px] font-black uppercase tracking-widest leading-none truncate",
                      isActive ? "text-primary" : isCompleted ? "text-emerald-500" : "text-muted-foreground"
                    )}>
                      {step.label}
                    </p>
                    <p className="text-[9px] text-muted-foreground/60 font-bold uppercase tracking-wider mt-0.5 truncate">
                      {isCompleted && !isActive ? "Done" : step.helper}
                    </p>
                  </div>
                  {/* Mobile label */}
                  <span className={cn(
                    "sm:hidden text-[9px] font-black uppercase tracking-widest",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}>
                    {step.shortLabel}
                  </span>
                </Link>

                {/* Connector arrow */}
                {idx < steps.length - 1 && (
                  <div className="flex items-center justify-center w-6 shrink-0">
                    <ChevronRight className={cn(
                      "w-3.5 h-3.5 transition-colors",
                      isPast || activeIdx === idx ? "text-primary/40" : "text-border"
                    )} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
