"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  FileSpreadsheet, FileText, Download, CheckCircle2,
  Globe, ShieldCheck, ExternalLink, Trophy, MapPin,
  Sparkles, RotateCcw, ArrowRight
} from "lucide-react";
import LogoLoader from "@/components/LogoLoader";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function ExportPage() {
  const router = useRouter();
  const [isExporting, setIsExporting] = useState({ excel: false, pdf: false });
  const [liveData, setLiveData]     = useState([]);
  const [topSite, setTopSite]       = useState(null);
  const [workflowComplete, setWorkflowComplete] = useState(false);

  useEffect(() => {
     const computedRanking = localStorage.getItem("dss_computed_ranking");
     const rawData         = localStorage.getItem("dss_live_data");
     const ahpWeights      = localStorage.getItem("dss_ahp_weights");

     const hasData     = !!(rawData && rawData !== "[]");
     const hasWeights  = !!(ahpWeights && ahpWeights !== "null");
     const hasRanking  = !!(computedRanking && computedRanking !== "[]");

     setWorkflowComplete(hasData && hasWeights && hasRanking);

     if (computedRanking) {
        const parsed = JSON.parse(computedRanking);
        setLiveData(parsed);
        if (parsed.length > 0) setTopSite(parsed[0]);
     } else if (rawData) {
        setLiveData(JSON.parse(rawData));
     }
  }, []);

  const handleExport = async (type) => {
    setIsExporting(prev => ({ ...prev, [type]: true }));
    try {
      if (type === 'excel') {
         const response = await axios.post(
            "http://127.0.0.1:8000/export/analytics",
            { data: liveData },
            { responseType: 'blob' }
         );
         const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
         const link = document.createElement('a');
         link.href = url;
         link.setAttribute('download', 'Ashok_Leyland_Executive_Report.xlsx');
         document.body.appendChild(link);
         link.click();
         link.parentNode.removeChild(link);
      } else {
         window.location.href = `http://127.0.0.1:8000/export/${type}`;
      }
    } catch (error) {
      console.error(`Export ${type} failed`, error);
      alert("Export failed. Ensure the backend server is running.");
    } finally {
      setIsExporting(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleReset = () => {
    if (!confirm("This will clear all data and restart the workflow. Continue?")) return;
    localStorage.clear();
    router.push("/dashboard/data");
  };

  return (
    <div className="space-y-10 selection:bg-primary/20 selection:text-primary pb-20">

      {/* Workflow Complete Banner */}
      <AnimatePresence>
        {workflowComplete && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="neon-border rounded-[2rem] overflow-hidden"
          >
            <div className="p-8 flex flex-col md:flex-row items-center gap-6 relative"
              style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.08) 0%, rgba(168,85,247,0.08) 100%)' }}
            >
              <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-2xl"
                style={{ boxShadow: '0 0 40px rgba(6,182,212,0.5)' }}>
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">
                  🎉 Workflow Complete
                </p>
                <h2 className="text-2xl font-black italic uppercase tracking-tight text-foreground">
                  Your Analysis is Ready to Export
                </h2>
                <p className="text-xs font-bold text-muted-foreground mt-1">
                  Data uploaded · AHP weights set · Rankings computed
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="insight-chip insight-chip-emerald">
                  <CheckCircle2 className="w-3 h-3" /> All Steps Done
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Recommendation Summary */}
      {topSite && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="soft-card p-8 flex flex-col md:flex-row items-center gap-8"
        >
          <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center shrink-0 shadow-2xl"
            style={{ boxShadow: '0 8px 40px rgba(6,182,212,0.35)' }}>
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">
              Top Recommendation
            </p>
            <h3 className="text-3xl font-black italic uppercase tracking-tight text-foreground mb-2">
              {topSite.name}
            </h3>
            <div className="flex flex-wrap gap-3">
              <span className="insight-chip insight-chip-cyan">Hybrid: {topSite.hybrid?.toFixed(3)}</span>
              <span className="insight-chip insight-chip-purple">TOPSIS: {topSite.topsis?.toFixed(3)}</span>
              <span className="insight-chip insight-chip-emerald">VIKOR: {topSite.vikor?.toFixed(3)}</span>
              {topSite.Risk && (
                <span className={cn(
                  "insight-chip",
                  topSite.Risk === 'Low' ? 'insight-chip-emerald' : topSite.Risk === 'High' ? 'text-rose-500 border-rose-500/20 bg-rose-500/8' : 'text-amber-500 border-amber-500/20 bg-amber-500/8'
                )}>
                  {topSite.Risk} Risk
                </span>
              )}
            </div>
          </div>
          {/* Top 3 mini list */}
          {liveData.length >= 3 && (
            <div className="shrink-0 space-y-2">
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-2">Top 3 Sites</p>
              {liveData.slice(0, 3).map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className={cn(
                    "w-5 h-5 rounded-lg flex items-center justify-center text-[9px] font-black",
                    i === 0 ? "bg-primary text-white" : i === 1 ? "bg-accent/20 text-accent" : "bg-amber-500/20 text-amber-500"
                  )}>{i + 1}</span>
                  <span className="text-xs font-bold">{s.name}</span>
                  <span className="text-[9px] text-muted-foreground font-black ml-auto">{s.hybrid?.toFixed(3)}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Export Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Excel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="soft-card p-10 hover:border-emerald-500/30 group relative overflow-hidden"
        >
          <div className="relative z-10">
            <div className="w-20 h-20 rounded-[2rem] bg-emerald-500/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-all duration-500 shadow-lg shadow-emerald-500/5">
               <FileSpreadsheet className="w-10 h-10 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-black uppercase italic tracking-tight text-foreground mb-3">Analytical Dataset</h3>
            <p className="text-muted-foreground text-xs leading-relaxed font-bold mb-8 max-w-sm">
              Multi-sheet Excel workbook with raw data, AHP weights, normalized matrices, and full rankings.
            </p>

            <div className="space-y-3 mb-10">
               {[
                 "Raw Candidate Parameters",
                 "AHP Priority Weights",
                 "TOPSIS & VIKOR Scores",
                 "Final Hybrid Rankings",
               ].map((item, i) => (
                 <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{item}</span>
                 </div>
               ))}
            </div>

            <button
              onClick={() => handleExport('excel')}
              disabled={isExporting.excel}
              className="w-full py-5 bg-emerald-500 text-white font-black uppercase tracking-widest rounded-3xl flex items-center justify-center gap-3 hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-500/20 active:scale-95 transition-all text-sm group disabled:opacity-60"
            >
              {isExporting.excel ? (
                <><LogoLoader size="sm" text="" /> Generating Spreadsheet…</>
              ) : (
                <><Download className="w-5 h-5 group-hover:translate-y-1 transition-transform" /> Download Excel Report</>
              )}
            </button>
          </div>
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] group-hover:bg-emerald-500/10 transition-colors duration-700" />
        </motion.div>

        {/* PDF */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="soft-card p-10 hover:border-rose-500/30 group relative overflow-hidden"
        >
          <div className="relative z-10">
            <div className="w-20 h-20 rounded-[2rem] bg-rose-500/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-all duration-500 shadow-lg shadow-rose-500/5">
               <FileText className="w-10 h-10 text-rose-500" />
            </div>
            <h3 className="text-2xl font-black uppercase italic tracking-tight text-foreground mb-3">Executive Summary</h3>
            <p className="text-muted-foreground text-xs leading-relaxed font-bold mb-8 max-w-sm">
              Professional PDF for management presentations — includes top rankings, risk heatmaps, and recommendation logic.
            </p>

            <div className="space-y-3 mb-10">
               {[
                 "Executive Summary & Title",
                 "Top Recommendation Highlight",
                 "Visual KPI Scorecards",
                 "Official Site Recommendation",
               ].map((item, i) => (
                 <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-rose-500/15 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-rose-500" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{item}</span>
                 </div>
               ))}
            </div>

            <button
              onClick={() => handleExport('pdf')}
              disabled={isExporting.pdf}
              className="w-full py-5 bg-rose-500 text-white font-black uppercase tracking-widest rounded-3xl flex items-center justify-center gap-3 hover:scale-[1.02] hover:shadow-2xl hover:shadow-rose-500/20 active:scale-95 transition-all text-sm group shadow-lg disabled:opacity-60"
            >
              {isExporting.pdf ? (
                <><LogoLoader size="sm" text="" /> Styling PDF…</>
              ) : (
                <><FileText className="w-5 h-5 group-hover:scale-110 transition-transform" /> Download Executive PDF</>
              )}
            </button>
          </div>
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-rose-500/5 rounded-full blur-[100px] group-hover:bg-rose-500/10 transition-colors duration-700" />
        </motion.div>
      </div>

      {/* Share + Reset Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Internal collaboration */}
        <div className="p-8 rounded-[2.5rem] bg-secondary/50 border border-border flex items-center gap-6 shadow-inner relative overflow-hidden">
           <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-lg" style={{boxShadow:'0 4px 20px var(--glow-cyan)'}}>
              <Globe className="w-7 h-7 text-white" />
           </div>
           <div className="flex-1">
              <h3 className="text-base font-black tracking-tight uppercase italic text-foreground">Internal Collaboration</h3>
              <p className="text-muted-foreground text-xs font-bold mt-1">Share a secure view-only link with stakeholders.</p>
           </div>
           <button className="px-6 py-3 bg-card text-foreground font-black uppercase tracking-widest rounded-2xl hover:shadow-xl hover:scale-105 transition-all text-xs flex items-center gap-2 border border-border shrink-0">
              Share <ExternalLink className="w-4 h-4" />
           </button>
           <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
        </div>

        {/* Start Over */}
        <div className="p-8 rounded-[2.5rem] bg-secondary/30 border border-border flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center shrink-0">
            <RotateCcw className="w-7 h-7 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-black tracking-tight uppercase italic text-foreground">Start New Analysis</h3>
            <p className="text-muted-foreground text-xs font-bold mt-1">Clear all data and restart from the beginning.</p>
          </div>
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white font-black uppercase tracking-widest rounded-2xl transition-all text-xs flex items-center gap-2 border border-rose-500/20 shrink-0"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
