"use client";

import { useState, useEffect } from "react";
import { 
  Scale, 
  Info, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCcw,
  Plus,
  ArrowRightLeft,
  X,
  Target
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { cn } from "@/lib/utils";

const defaultCriteria = [
  "Vendor Base",
  "Manpower/Skill",
  "Capex",
  "Govt Norms/Tax SOPs",
  "Logistics Cost",
  "Economies of Scale"
];

export default function AHPWeighting() {
  const [criteria, setCriteria] = useState(defaultCriteria);
  const [matrix, setMatrix] = useState([]);
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCell, setActiveCell] = useState(null); // { i, j }


  useEffect(() => {
    const stFeat = localStorage.getItem("dss_live_features");
    const activeCriteria = stFeat ? JSON.parse(stFeat) : defaultCriteria;
    setCriteria(activeCriteria);
    setMatrix(Array(activeCriteria.length).fill(0).map(() => Array(activeCriteria.length).fill(1)));
  }, []);

  const updateMatrix = (i, j, value) => {
    const newMatrix = [...matrix.map(row => [...row])];
    newMatrix[i][j] = parseFloat(value);
    newMatrix[j][i] = 1 / parseFloat(value);
    setMatrix(newMatrix);
    setActiveCell(null); // Auto-close modal after selection
  };

  const getFractionDisplay = (val) => {
     if (val >= 1) return Math.round(val).toString();
     const rounded = Math.round(1 / val);
     return `1/${rounded}`;
  };

  const calculateWeights = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post("http://127.0.0.1:8000/analyze/ahp", { matrix });
      setResults(response.data);
    } catch (error) {
      console.error("AHP Calculation failed", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (matrix.length > 0) {
      calculateWeights();
    }
  }, [matrix]);

  return (
    <div className="space-y-10 selection:bg-primary/20 selection:text-primary pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic text-foreground">
            Criteria <span className="text-primary">Weighting</span>
          </h1>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
            Analytic Hierarchy Process (AHP) Configuration
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMatrix(Array(criteria.length).fill(0).map(() => Array(criteria.length).fill(1)))}
            className="btn-soft-secondary"
          >
            <RefreshCcw className="w-4 h-4 text-muted-foreground" />
            Reset Matrix
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Matrix Input */}
        <div className="lg:col-span-2 space-y-8">
          <div className="soft-card p-8 overflow-hidden">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-xl font-black uppercase italic tracking-tight text-foreground px-2">Pairwise Comparison</h3>
               <div className="flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-[9px] font-black text-primary uppercase tracking-widest">Saaty Scale (1-9)</span>
               </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-center border-separate border-spacing-2">
                <thead>
                  <tr>
                    <th className="p-2"></th>
                    {criteria.map((c, i) => (
                      <th key={i} className="p-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground w-24">
                        {c.split(' ')[0]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {criteria.map((c1, i) => (
                    <tr key={i}>
                      <td className="p-2 text-[9px] font-black uppercase tracking-widest text-left text-muted-foreground w-32 border-r border-border/50">
                        {c1.length > 15 ? c1.substring(0, 15) + "..." : c1}
                      </td>
                      {matrix.length > 0 && criteria.map((c2, j) => (
                        <td key={j} className="p-1">
                          {i === j ? (
                            <div className="w-16 h-12 bg-secondary/50 border border-border/50 rounded-xl flex items-center justify-center text-xs font-black text-muted-foreground shadow-inner">1</div>
                          ) : i < j ? (
                            <button 
                              onClick={() => setActiveCell({i, j})}
                              className="w-16 h-12 bg-card border border-border rounded-xl text-xs font-black text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 flex items-center justify-center hover:bg-primary/10 transition-all shadow-sm hover:scale-105 active:scale-95"
                            >
                              {getFractionDisplay(matrix[i]?.[j] || 1)}
                            </button>
                          ) : (
                            <div className="w-16 h-12 bg-secondary/30 border border-border/30 rounded-xl flex items-center justify-center text-[10px] font-bold text-muted-foreground opacity-60">
                              {getFractionDisplay(matrix[i]?.[j] || 1)}
                            </div>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-8 rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/10 flex items-start gap-6 shadow-sm">
             <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                <Info className="w-6 h-6 text-indigo-500" />
             </div>
             <div>
                <h4 className="text-sm font-black text-foreground uppercase tracking-widest mb-2">How to use</h4>
                <p className="text-xs text-muted-foreground leading-relaxed font-bold">
                  Select a value to indicate the relative importance of the row criterion versus the column criterion. 
                  <span className="text-primary italic"> 1 = Equal, 3 = Moderate, 5 = Strong, 7 = Very Strong, 9 = Extreme.</span> 
                  The system will automatically calculate reciprocal values and check for logical consistency.
                </p>
             </div>
          </div>
        </div>

        {/* Results Sidebar */}
        <div className="space-y-8">
          <div className="soft-card p-8">
            <h3 className="text-xl font-black uppercase italic tracking-tight mb-8 text-foreground px-2">Priority Results</h3>
            {results ? (
              <div className="space-y-6">
                {results.weights.map((w, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-end mb-2 px-1">
                       <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{criteria[i]}</p>
                       <p className="text-lg font-black italic text-primary">{(w * 100).toFixed(1)}%</p>
                    </div>
                    <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden shadow-inner">
                       <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${w * 100}%` }}
                        className={cn(
                          "h-full rounded-full shadow-lg transition-all duration-1000",
                          i % 3 === 0 ? "bg-blue-500" : i % 3 === 1 ? "bg-emerald-500" : "bg-indigo-500"
                        )}
                       />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-muted-foreground opacity-30">
                 <Scale className="w-16 h-16 mb-4" />
                 <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Input...</p>
              </div>
            )}
          </div>

          <div className="soft-card p-8">
            <h3 className="text-xl font-black uppercase italic tracking-tight mb-8 text-foreground px-2">Consistency</h3>
            {results ? (
              <div className="space-y-6">
                 <div className="flex items-center justify-between px-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ratio (CR)</p>
                    <p className={cn(
                      "text-xl font-black italic",
                      results.cr < 0.1 ? "text-emerald-500" : "text-rose-500"
                    )}>{results.cr.toFixed(4)}</p>
                 </div>
                 
                 <div className={cn(
                   "p-6 rounded-[1.5rem] flex items-center gap-4 border shadow-sm",
                   results.cr < 0.1 
                    ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-500" 
                    : "bg-rose-500/5 border-rose-500/10 text-rose-500"
                 )}>
                   {results.cr < 0.1 ? (
                     <>
                        <CheckCircle className="w-6 h-6 shrink-0" />
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest">Reliable Weights</p>
                           <p className="text-[9px] font-bold opacity-80 uppercase tracking-widest leading-tight">Data logic is consistent</p>
                        </div>
                     </>
                   ) : (
                     <>
                        <AlertTriangle className="w-6 h-6 shrink-0" />
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest">Review Inputs</p>
                           <p className="text-[9px] font-bold opacity-80 uppercase tracking-widest leading-tight">CR exceeds threshold (0.1)</p>
                        </div>
                     </>
                   )}
                 </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Interactive Saaty Scale Modal */}
      <AnimatePresence>
        {activeCell && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-4"
            onClick={() => setActiveCell(null)}
          >
             <motion.div 
               initial={{ scale: 0.95, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.95, opacity: 0, y: 20 }}
               onClick={(e) => e.stopPropagation()}
               className="bg-card border border-border shadow-2xl rounded-[2.5rem] p-10 max-w-2xl w-full relative overflow-hidden"
             >
                {/* Title */}
                <div className="mb-10 text-center relative z-10">
                   <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6">
                      <Target className="w-8 h-8 text-primary" />
                   </div>
                   <h2 className="text-2xl font-black uppercase italic tracking-tight text-foreground">
                     Relative Importance
                   </h2>
                   <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-2">
                     {criteria[activeCell.i]} <span className="text-primary italic mx-2">VS</span> {criteria[activeCell.j]}
                   </p>
                </div>

                {/* Number Pad Matrix */}
                <div className="space-y-6 relative z-10">
                   {/* Row 1: Left emphasis */}
                   <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                     {[1/9, 1/8, 1/7, 1/6, 1/5, 1/4, 1/3, 1/2].map(v => (
                       <button 
                         key={v}
                         onClick={() => updateMatrix(activeCell.i, activeCell.j, v)}
                         className="h-12 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 text-xs font-black transition-all hover:scale-105 active:scale-95"
                       >
                         {getFractionDisplay(v)}
                       </button>
                     ))}
                   </div>
                   
                   {/* Row 2: Equal */}
                   <div className="flex justify-center">
                     <button 
                       onClick={() => updateMatrix(activeCell.i, activeCell.j, 1)}
                       className="h-14 w-32 rounded-2xl bg-slate-500/10 hover:bg-slate-500 text-slate-400 hover:text-white border border-slate-500/30 text-sm font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg"
                     >
                       Equal (1)
                     </button>
                   </div>

                   {/* Row 3: Right emphasis */}
                   <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                     {[2, 3, 4, 5, 6, 7, 8, 9].map(v => (
                       <button 
                         key={v}
                         onClick={() => updateMatrix(activeCell.i, activeCell.j, v)}
                         className="h-12 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white border border-emerald-500/20 text-xs font-black transition-all hover:scale-105 active:scale-95"
                       >
                         {v}
                       </button>
                     ))}
                   </div>
                </div>

                {/* Close Button */}
                <button 
                  onClick={() => setActiveCell(null)}
                  className="absolute top-6 right-6 p-2 rounded-full bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
                
                {/* Background effects */}
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
