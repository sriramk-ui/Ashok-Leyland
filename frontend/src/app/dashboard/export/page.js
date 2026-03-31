"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { 
  FileSpreadsheet, 
  FileText, 
  Download, 
  CheckCircle2, 
  Globe, 
  ShieldCheck,
  ArrowRight,
  ExternalLink
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function ExportPage() {
  const [isExporting, setIsExporting] = useState({ excel: false, pdf: false });
  const [liveData, setLiveData] = useState([]);

  useEffect(() => {
     // Grab the complex algorithm rankings or fallback to raw dataset
     const computedRanking = localStorage.getItem("dss_computed_ranking");
     const rawData = localStorage.getItem("dss_live_data");
     if (computedRanking) {
        setLiveData(JSON.parse(computedRanking));
     } else if (rawData) {
        setLiveData(JSON.parse(rawData));
     }
  }, []);

  const handleExport = async (type) => {
    setIsExporting({ ...isExporting, [type]: true });
    
    try {
      if (type === 'excel') {
         // Use the new dynamic XlsxWriter Engine pipeline
         const response = await axios.post(
            "http://127.0.0.1:8000/export/analytics", 
            { data: liveData },
            { responseType: 'blob' }
         );
         const url = window.URL.createObjectURL(new Blob([response.data]));
         const link = document.createElement('a');
         link.href = url;
         link.setAttribute('download', 'Ashok_Leyland_Executive_Report.xlsx');
         document.body.appendChild(link);
         link.click();
         link.parentNode.removeChild(link);
      } else {
         // PDF routing (keep as GET for now until upgraded)
         window.location.href = `http://127.0.0.1:8000/export/${type}`;
      }
    } catch (error) {
      console.error(`Export ${type} failed`, error);
      alert("Export failed. Ensure the backend server is running.");
    } finally {
      setIsExporting({ ...isExporting, [type]: false });
    }
  };

  return (
    <div className="space-y-10 selection:bg-primary/20 selection:text-primary pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic text-foreground">
            Report <span className="text-primary">Export</span>
          </h1>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
            Generate Professional Decision Support Documentation
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Excel Export Card */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="soft-card p-12 hover:border-emerald-500/30 group relative overflow-hidden"
        >
          <div className="relative z-10">
            <div className="w-20 h-20 rounded-[2rem] bg-emerald-500/10 flex items-center justify-center mb-10 group-hover:scale-110 transition-all duration-500 shadow-lg shadow-emerald-500/5">
               <FileSpreadsheet className="w-10 h-10 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-black uppercase italic tracking-tight text-foreground mb-4 leading-tight">Analytical Dataset</h3>
            <p className="text-muted-foreground text-xs leading-relaxed font-bold mb-10 max-w-sm">
              Multi-sheet Excel workbook containing raw input data, criteria weights, normalized matrices, and optimization results.
            </p>
            
            <div className="space-y-4 mb-14">
               {[
                 "Raw Candidate Parameters",
                 "AHP Pairwise Matrices",
                 "Algorithm Normalization Sheets",
                 "LP Optimization Logs"
               ].map((item, i) => (
                 <div key={i} className="flex items-center gap-4">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{item}</span>
                 </div>
               ))}
            </div>

            <button 
              onClick={() => handleExport('excel')}
              disabled={isExporting.excel}
              className="w-full py-5 bg-emerald-500 text-white font-black uppercase tracking-widest rounded-3xl flex items-center justify-center gap-3 hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-500/20 active:scale-95 transition-all text-sm group"
            >
              {isExporting.excel ? "Generating Spreadsheet..." : "Download Excel Report"}
              <Download className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
            </button>
          </div>
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] group-hover:bg-emerald-500/10 transition-colors duration-700" />
        </motion.div>

        {/* PDF Export Card */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="soft-card p-12 hover:border-rose-500/30 group relative overflow-hidden"
        >
          <div className="relative z-10">
            <div className="w-20 h-20 rounded-[2rem] bg-rose-500/10 flex items-center justify-center mb-10 group-hover:scale-110 transition-all duration-500 shadow-lg shadow-rose-500/5">
               <FileText className="w-10 h-10 text-rose-500" />
            </div>
            <h3 className="text-2xl font-black uppercase italic tracking-tight text-foreground mb-4 leading-tight">Executive Summary</h3>
            <p className="text-muted-foreground text-xs leading-relaxed font-bold mb-10 max-w-sm">
              Professional PDF document designed for management presentations. Includes top rankings, risk heatmaps, and recommendation logic.
            </p>
            
            <div className="space-y-4 mb-14">
               {[
                 "Executive Summary Overview",
                 "Visual KPI Scorecards",
                 "Risk Factor Sensitivity",
                 "Official Recommendation"
               ].map((item, i) => (
                 <div key={i} className="flex items-center gap-4">
                    <div className="w-5 h-5 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-rose-500" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{item}</span>
                 </div>
               ))}
            </div>

            <button 
              onClick={() => handleExport('pdf')}
              disabled={isExporting.pdf}
              className="w-full py-5 bg-rose-500 text-white font-black uppercase tracking-widest rounded-3xl flex items-center justify-center gap-3 hover:scale-[1.02] hover:shadow-2xl hover:shadow-rose-500/20 active:scale-95 transition-all text-sm group shadow-lg shadow-rose-500/10"
            >
              {isExporting.pdf ? "Styling PDF Report..." : "Download Executive PDF"}
              <FileText className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
          </div>
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-rose-500/5 rounded-full blur-[100px] group-hover:bg-rose-500/10 transition-colors duration-700" />
        </motion.div>
      </div>

      {/* Share Section */}
      <div className="p-12 rounded-[4rem] bg-secondary/50 border border-border flex flex-col md:flex-row items-center justify-between gap-10 shadow-inner overflow-hidden relative">
         <div className="flex items-center gap-8 text-center md:text-left relative z-10">
            <div className="w-24 h-24 rounded-[2.5rem] bg-primary flex items-center justify-center shrink-0 shadow-2xl shadow-primary/30">
               <Globe className="w-12 h-12 text-white" />
            </div>
            <div>
               <h3 className="text-3xl font-black tracking-tighter uppercase italic text-foreground mb-2">Internal Collaboration</h3>
               <p className="text-muted-foreground text-sm font-bold max-w-md leading-relaxed">
                 Generate a secure view-only link to share the real-time analysis dashboard with authorized Ashok Leyland stakeholders.
               </p>
            </div>
         </div>
         <button className="px-12 py-6 bg-card text-foreground font-black uppercase tracking-widest rounded-3xl hover:shadow-xl hover:scale-105 transition-all text-sm flex items-center gap-3 shrink-0 border border-border active:scale-95 relative z-10 shadow-md">
            Generate Secure Link
            <ExternalLink className="w-5 h-5" />
         </button>
         
         <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
