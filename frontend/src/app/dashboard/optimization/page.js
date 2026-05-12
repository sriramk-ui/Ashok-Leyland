"use client";

import { useState } from "react";
import { 
  Calculator, 
  MapPin, 
  Truck, 
  Plus, 
  Trash2, 
  Play, 
  CheckCircle,
  BarChart2,
  TrendingDown,
  Building
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { cn } from "@/lib/utils";

export default function OptimizationPage() {
  const [sites, setSites] = useState(["Oragadam", "Pune", "Hosur"]);
  const [demands, setDemands] = useState({ "North": 500, "South": 800, "West": 400 });
  const [capacities, setCapacities] = useState({ "Oragadam": 1000, "Pune": 1000, "Hosur": 1000 });
  const [costs, setCosts] = useState({
    "Oragadam": { "North": 50, "South": 10, "West": 40 },
    "Pune": { "North": 30, "South": 40, "West": 15 },
    "Hosur": { "North": 45, "South": 15, "West": 35 }
  });

  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const runOptimization = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/analyze/optimize`, {
        sites,
        demands,
        costs,
        capacities
      });
      setResults(response.data);
    } catch (error) {
      console.error("Optimization failed", error);
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-10 selection:bg-primary/20 selection:text-primary pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic text-foreground">
            Allocation <span className="text-primary">Optimization</span>
          </h1>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
            Cost Minimization & Subsystem Allocation Model
          </p>
        </div>
        <button 
          onClick={runOptimization}
          disabled={isLoading}
          className="btn-soft-primary px-10 py-5 text-sm shadow-xl"
        >
          <Play className={cn("w-5 h-5", isLoading ? "animate-spin" : "fill-current")} />
          {isLoading ? "Analyzing Model..." : "Run Optimization Engine"}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Input Controls */}
        <div className="space-y-10">
          <div className="soft-card p-10 shadow-xl">
            <div className="flex items-center gap-3 mb-10 px-2 text-primary">
              <Building className="w-6 h-6" />
              <h3 className="text-xl font-black uppercase italic tracking-tight text-foreground">Supply & Capacity</h3>
            </div>
            <div className="space-y-5">
               {sites.map(site => (
                 <div key={site} className="flex items-center justify-between p-5 bg-muted/20 border border-border/50 rounded-2xl hover:bg-card hover:border-primary/20 transition-all duration-300">
                    <div className="flex items-center gap-4">
                       <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                         <Building className="w-4 h-4 text-primary" />
                       </div>
                       <span className="text-sm font-black uppercase tracking-tight text-foreground">{site}</span>
                    </div>
                    <div className="flex items-center gap-5">
                       <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Capacity</p>
                       <input 
                        type="number" 
                        value={capacities[site]} 
                        onChange={(e) => setCapacities({...capacities, [site]: parseInt(e.target.value)})}
                        className="w-24 bg-card border border-border rounded-xl py-2 px-4 text-xs font-black text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-inner"
                       />
                    </div>
                 </div>
               ))}
            </div>
          </div>

          <div className="soft-card p-10 shadow-xl">
            <div className="flex items-center gap-3 mb-10 px-2 text-blue-500">
              <MapPin className="w-6 h-6" />
              <h3 className="text-xl font-black uppercase italic tracking-tight text-foreground">Demand Requirements</h3>
            </div>
            <div className="space-y-5">
               {Object.keys(demands).map(point => (
                 <div key={point} className="flex items-center justify-between p-5 bg-muted/20 border border-border/50 rounded-2xl hover:bg-card hover:border-blue-500/20 transition-all duration-300">
                    <div className="flex items-center gap-4">
                       <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
                         <MapPin className="w-4 h-4 text-blue-500" />
                       </div>
                       <span className="text-sm font-black uppercase tracking-tight text-foreground">{point} Hub</span>
                    </div>
                    <div className="flex items-center gap-5">
                       <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Requirement</p>
                       <input 
                        type="number" 
                        value={demands[point]} 
                        onChange={(e) => setDemands({...demands, [point]: parseInt(e.target.value)})}
                        className="w-24 bg-card border border-border rounded-xl py-2 px-4 text-xs font-black text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-inner"
                       />
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Results View */}
        <div className="space-y-10">
          <AnimatePresence mode="wait">
            {results ? (
              <motion.div 
                key="results"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                {/* Total Cost Card */}
                <div className="p-12 rounded-[3rem] bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-2xl shadow-emerald-500/20 relative overflow-hidden">
                   <div className="flex items-center justify-between mb-12 relative z-10">
                      <div className="p-4 bg-white/20 backdrop-blur-md rounded-[2rem] border border-white/20">
                         <TrendingDown className="w-8 h-8 text-white" />
                      </div>
                      <span className="px-5 py-2 bg-black/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-full border border-white/10 shadow-xl">Optimal Solution Found</span>
                   </div>
                   <p className="text-xs font-black uppercase tracking-[0.3em] mb-2 opacity-70 relative z-10">Total Optimized Cost</p>
                   <h2 className="text-7xl font-black italic tracking-tighter relative z-10 mb-2">₹{results.total_cost.toLocaleString()}</h2>
                   <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest relative z-10">Minimal Logistics Expenditure Achieved</p>
                   
                   <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                </div>

                {/* Built Plants */}
                <div className="soft-card p-10">
                   <h3 className="text-xl font-black uppercase italic tracking-tight mb-8 text-foreground px-2">Operational Footprint</h3>
                   <div className="grid grid-cols-2 gap-5">
                      {results.built_plants.map(site => (
                        <div key={site} className="p-5 bg-card border border-emerald-500/20 rounded-2xl flex items-center gap-4 shadow-sm group hover:scale-105 transition-all">
                           <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                             <CheckCircle className="w-5 h-5 text-emerald-500" />
                           </div>
                           <span className="text-[11px] font-black uppercase tracking-widest text-foreground">{site}</span>
                        </div>
                      ))}
                   </div>
                </div>

                {/* Allocations */}
                <div className="soft-card p-10">
                   <h3 className="text-xl font-black uppercase italic tracking-tight mb-8 text-foreground px-2">Allocation Strategy</h3>
                   <div className="space-y-4">
                      {Object.entries(results.allocations).map(([label, value], i) => (
                        <div key={label} className="flex items-center justify-between p-5 bg-muted/10 border border-border/50 rounded-2xl group hover:border-primary/20 hover:bg-card transition-all duration-300 shadow-sm">
                           <div className="flex items-center gap-5">
                              <span className="text-[9px] font-black text-muted-foreground italic bg-secondary px-2.5 py-1 rounded-md">ROUTE {i+1}</span>
                              <p className="text-xs font-black uppercase tracking-tight text-foreground">{label.split('->')[0]} <span className="text-primary mx-1.5 animate-pulse">→</span> {label.split('->')[1]}</p>
                           </div>
                           <p className="text-lg font-black italic text-primary">{value} <span className="text-[10px] text-muted-foreground uppercase NOT-italic ml-1">UNITS</span></p>
                        </div>
                      ))}
                   </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full soft-card flex flex-col items-center justify-center py-40 text-muted-foreground space-y-6"
              >
                  <div className="w-24 h-24 bg-muted/20 rounded-[2.5rem] flex items-center justify-center shadow-inner">
                    <Calculator className="w-10 h-10 opacity-20" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-center px-20 leading-loose">Configure system parameters and engage <br/> <span className="text-primary italic">"Run Optimization Engine"</span></p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
