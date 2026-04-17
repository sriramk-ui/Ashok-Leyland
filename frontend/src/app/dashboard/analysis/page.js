"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";

const GeospatialMap = dynamic(() => import("@/components/GeospatialMap"), {
  ssr: false,
  loading: () => <div className="min-h-[550px] w-full animate-pulse bg-white/5 rounded-[40px] border border-white/10 flex items-center justify-center p-8"><h1 className="text-xl text-blue-500 font-black italic animate-bounce">Loading CARTO Dark Matter...</h1></div>
});
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  Legend
} from "recharts";
import axios from "axios";
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Scale, 
  ArrowUpRight,
  Info,
  ChevronRight,
  ArrowRight,
  CheckCircle,
  Download
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function RankingAnalysis() {
  const router = useRouter();
  const { theme } = useTheme();
  const [data, setData] = useState([]);
  const [activeMetric, setActiveMetric] = useState("hybrid");
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const isDark = theme === "dark";

  const handleExport = async () => {
     try {
        setIsExporting(true);
        const response = await axios.post(
           "http://127.0.0.1:8000/export/analytics", 
           { data: data },
           { responseType: 'blob' }
        );
        
        // Create an invisible link to trigger the download prompt
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Ashok_Leyland_Executive_Report.xlsx');
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
     } catch (e) {
        console.error("Export Analytics Failed:", e);
        alert("Failed to generate Excel securely.");
     } finally {
        setIsExporting(false);
     }
  };

  useEffect(() => {
    const runAnalysis = async () => {
      try {
        const stData = localStorage.getItem("dss_live_data");
        const stFeat = localStorage.getItem("dss_live_features");
        
        if (!stData || !stFeat) {
          setIsLoading(false);
          return;
        }

        const sites = JSON.parse(stData);
        const features = JSON.parse(stFeat);
        
        // Prepare 2D array matrix for algorithms
        const matrixData = sites.map(site => features.map(f => Number(site[f] || 0)));
        
        // Define is_benefit arrays natively: Cost/Capex concepts are false, everything else true
        const isBenefit = features.map(f => {
           const lower = f.toLowerCase();
           if (lower.includes("cost") || lower.includes("capex") || lower.includes("risk")) return false;
           return true; 
        });

        // Set default equal weights for all dynamic features
        const equalWeight = 1 / features.length;
        const weights = features.map(() => equalWeight);

        const payload = {
           data: matrixData,
           weights: weights,
           is_benefit: isBenefit
        };

        const [topsisRes, vikorRes] = await Promise.all([
           axios.post("http://127.0.0.1:8000/analyze/topsis", payload),
           axios.post("http://127.0.0.1:8000/analyze/vikor", payload)
        ]);

        const topsisScores = topsisRes.data.scores;
        // VIKOR yields S, R, Q where Q is the overall ranking measure (lower is better, 0 is best).
        // Let's invert Q so higher is better for a hybrid index (1 - Q)
        const vikorQ = vikorRes.data.Q;
        const vikorScores = vikorQ.map(q => 1 - q);

        const combinedRanking = sites.map((site, idx) => {
           const t = topsisScores[idx];
           const v = vikorScores[idx];
           return {
              ...site,
              name: site.Site || site.name || `Site ${idx+1}`,
              topsis: t,
              vikor: v,
              hybrid: (t * 0.5) + (v * 0.5)
           };
        });

        combinedRanking.sort((a, b) => b.hybrid - a.hybrid);
        
        // Assign ranks
        combinedRanking.forEach((item, index) => item.rank = index + 1);
        
        localStorage.setItem("dss_computed_ranking", JSON.stringify(combinedRanking));
        setData(combinedRanking);
      } catch (e) {
        console.error("Auto analysis failed", e);
      } finally {
        setIsLoading(false);
      }
    };
    runAnalysis();
  }, []);

  if (isLoading) return <div className="p-20 text-center"><h1 className="text-2xl text-blue-500 animate-pulse font-black italic">Running Dynamic Models...</h1></div>;
  if (data.length === 0) return <div className="p-20 text-center text-gray-400">No Dataset Available. Please Upload on the Data page.</div>;

  return (
    <div className="space-y-10 selection:bg-blue-500 selection:text-black pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">
            Ranking <span className="text-blue-500">Analysis</span>
          </h1>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">
            Hybrid Multi-Criteria Decision Outcome
          </p>
        </div>
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
           {["hybrid", "topsis", "vikor"].map(m => (
             <button 
              key={m}
              onClick={() => setActiveMetric(m)}
              className={cn(
                "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                activeMetric === m ? "bg-blue-500 text-white shadow-lg" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
             >
               {m}
             </button>
           ))}
        </div>
        <button 
           onClick={handleExport}
           disabled={isExporting}
           className="btn-soft-primary px-6 py-3 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/30 hover:bg-blue-500/20 text-xs font-black uppercase tracking-[0.1em] flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-xl ml-auto md:ml-0"
        >
           <Download className="w-4 h-4" />
           {isExporting ? "Compiling Server Engine..." : "Export Executive Analytics"}
        </button>
      </header>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
        {/* Second Place */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-8 rounded-[40px] bg-card/60 border border-border text-center relative pt-12 shadow-sm"
        >
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-muted border border-border rounded-2xl flex items-center justify-center font-black text-foreground">2</div>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">{data[1].name}</p>
          <h3 className="text-4xl font-black italic text-foreground mb-6 tracking-tighter">{data[1].hybrid.toFixed(3)}</h3>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-[8px] font-black uppercase tracking-widest text-emerald-500">Stable Alternative</div>
        </motion.div>

        {/* First Place */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-10 rounded-[50px] bg-blue-500 text-white text-center relative pt-16 shadow-[0_0_50px_rgba(59,130,246,0.2)] border-2 border-white/10"
        >
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-black rounded-3xl flex items-center justify-center shadow-xl">
             <Trophy className="w-10 h-10 text-blue-500" />
          </div>
          <p className="text-xs font-black uppercase tracking-[0.3em] mb-3 opacity-60">{data[0].name}</p>
          <h2 className="text-7xl font-black italic leading-none mb-4 tracking-tighter">{data[0].hybrid.toFixed(3)}</h2>
          <p className="text-[10px] font-black uppercase tracking-widest bg-black/10 px-4 py-2 rounded-full inline-block">Best Compromise (VIKOR)</p>
          <div className="mt-8 flex items-center justify-center gap-2">
             <CheckCircle className="w-4 h-4" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em]">Balanced solution recommended by VIKOR</span>
          </div>
        </motion.div>

        {/* Third Place */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-8 rounded-[40px] bg-card/60 border border-border text-center relative pt-12 shadow-sm"
        >
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-amber-700 rounded-2xl flex items-center justify-center font-black text-white">3</div>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">{data[2].name}</p>
          <h3 className="text-4xl font-black italic text-foreground mb-6 tracking-tighter">{data[2].hybrid.toFixed(3)}</h3>
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-[8px] font-black uppercase tracking-widest text-blue-500">Top ranked site based on TOPSIS</div>
        </motion.div>
      </div>

      {/* Geospatial Map Section */}
      <div className="w-full">
         <GeospatialMap data={data} />
      </div>

      {/* Charts & table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-8 pb-4 rounded-[40px] bg-card border border-border shadow-md">
          <h3 className="text-xl font-black uppercase italic tracking-tight mb-8">Score Comparison</h3>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#222" : "#eee"} horizontal={false} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: isDark ? '#666' : '#999', fontSize: 10, fontWeight: 900 }}
                  width={100}
                />
                <Tooltip 
                  cursor={{ fill: isDark ? '#ffffff0a' : '#0000000a' }}
                  contentStyle={{ 
                    backgroundColor: isDark ? '#000' : '#fff', 
                    border: `1px solid ${isDark ? '#333' : '#ddd'}`, 
                    borderRadius: '12px',
                    color: isDark ? '#fff' : '#000'
                  }}
                  itemStyle={{ color: isDark ? '#fff' : '#000' }}
                />
                <Bar dataKey={activeMetric} radius={[0, 8, 8, 0]} barSize={32}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : (isDark ? '#1e293b' : '#e2e8f0')} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-8 rounded-[40px] bg-card border border-border shadow-md flex flex-col">
          <h3 className="text-xl font-black uppercase italic tracking-tight mb-8">Full Audit Ranking</h3>
          <div className="flex-1 space-y-4">
            {data.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-6 rounded-2xl bg-secondary/30 border border-border hover:border-primary/20 hover:bg-secondary/50 transition-all group shadow-sm">
                <div className="flex items-center gap-5">
                   <div className={cn(
                     "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg italic shadow-subtle",
                     i === 0 ? "bg-blue-500 text-white" : "bg-muted text-muted-foreground"
                   )}>
                     {i + 1}
                   </div>
                   <div>
                     <p className="text-sm font-black uppercase tracking-tight text-foreground mb-1">{item.name}</p>
                     <div className="flex gap-4">
                       <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">TOPSIS: {item.topsis.toFixed(3)}</p>
                       <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">VIKOR: {item.vikor.toFixed(3)}</p>
                     </div>
                   </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black italic text-blue-500 leading-none mb-1">{item.hybrid.toFixed(3)}</p>
                  <div className="flex items-center gap-1 justify-end">
                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">TOP Choice</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-6 rounded-[2rem] bg-secondary/20 border border-border flex flex-col md:flex-row items-center justify-between gap-6 shadow-inner">
            <div>
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Advanced Options</p>
              <h4 className="text-sm font-black italic text-foreground uppercase tracking-tight">Capacity Allocation Optimization</h4>
            </div>
            <button 
              onClick={() => router.push("/dashboard/optimization")}
              className="w-full md:w-auto px-8 py-4 rounded-2xl bg-white text-black text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-lg"
            >
              Run Optimization
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

