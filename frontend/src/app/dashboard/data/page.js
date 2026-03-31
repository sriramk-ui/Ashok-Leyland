"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { 
  Plus, 
  Upload, 
  Trash2, 
  Table as TableIcon,
  Filter,
  ArrowUpDown,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const initialSites = [
  { id: 1, Site: "Chennai Hub", "Vendor Base": 0.88, "Manpower/Skill": 0.85, Capex: 450, "Govt Norms/Tax SOPs": 5, "Logistics Cost": 0.92, "Economies of Scale": 9, Risk: "Low" },
  { id: 2, Site: "Pune Cluster", "Vendor Base": 0.90, "Manpower/Skill": 0.90, Capex: 520, "Govt Norms/Tax SOPs": 4, "Logistics Cost": 0.88, "Economies of Scale": 8, Risk: "Low" },
  { id: 3, Site: "Hosur Phase I", "Vendor Base": 0.82, "Manpower/Skill": 0.80, Capex: 380, "Govt Norms/Tax SOPs": 5, "Logistics Cost": 0.85, "Economies of Scale": 7, Risk: "Medium" },
  { id: 4, Site: "Manesar Unit", "Vendor Base": 0.70, "Manpower/Skill": 0.82, Capex: 600, "Govt Norms/Tax SOPs": 3, "Logistics Cost": 0.75, "Economies of Scale": 8, Risk: "High" },
];

const initialFeatures = ["Vendor Base", "Manpower/Skill", "Capex", "Govt Norms/Tax SOPs", "Logistics Cost", "Economies of Scale"];

export default function DataManagement() {
  const [sites, setSites] = useState(initialSites);
  const [features, setFeatures] = useState(initialFeatures);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    // Load dynamically from local storage if available
    const stData = localStorage.getItem("dss_live_data");
    const stFeat = localStorage.getItem("dss_live_features");
    
    // Do NOT auto-fetch Master Sample Dataset. Wait for explicit user action.
    if (stData && stFeat) {
       setSites(JSON.parse(stData));
       setFeatures(JSON.parse(stFeat));
    } else {
       setSites([]);
       setFeatures([]);
    }
  }, []);

  const handleLoadSample = async () => {
     try {
       setIsUploading(true);
       const res = await axios.get("http://127.0.0.1:8000/sample-dataset");
       if (res.data && !res.data.error) {
          setSites(res.data.data);
          setFeatures(res.data.features);
          localStorage.setItem("dss_live_data", JSON.stringify(res.data.data));
          localStorage.setItem("dss_live_features", JSON.stringify(res.data.features));
       }
     } catch (e) {
       console.error("Failed to load generic master sample", e);
     } finally {
       setIsUploading(false);
     }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://127.0.0.1:8000/upload/excel", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.error) {
        alert(response.data.error);
      } else {
        localStorage.setItem("dss_live_data", JSON.stringify(response.data.data));
        localStorage.setItem("dss_live_features", JSON.stringify(response.data.features));
        
        // Auto trigger analysis
        router.push("/dashboard/analysis");
      }
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload dataset. Ensure format is correct.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-10 selection:bg-primary/20 selection:text-primary pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic text-foreground">
            Data <span className="text-primary">Management</span>
          </h1>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
            Configure Candidate Sites and Input Variables
          </p>
        </div>
        <div className="flex items-center gap-4">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
          />
          <a 
            href="http://127.0.0.1:8000/download/template"
            className="btn-soft-secondary text-[10px] no-underline"
          >
            <TableIcon className="w-4 h-4" />
            Template
          </a>
          <button 
           onClick={() => fileInputRef.current.click()}
           className="btn-soft-secondary text-[10px]"
          >
            <Upload className="w-4 h-4" />
            {isUploading ? "Uploading..." : "Upload Excel"}
          </button>
          <button 
            onClick={handleLoadSample}
            className="btn-soft-primary text-[10px] shadow-sm bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
          >
            Load Sample Dataset
          </button>
          <button className="btn-soft-primary text-[10px] px-8 shadow-xl">
            <Plus className="w-4 h-4" />
            Add Site
          </button>
        </div>
      </header>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="soft-card p-8 flex items-center gap-6 shadow-md border-primary/5">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center shadow-lg shadow-blue-500/5">
                <FileSpreadsheet className="w-8 h-8 text-blue-500" />
            </div>
            <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 opacity-60">Dataset Status</p>
                <h3 className="text-2xl font-black text-foreground italic tracking-tight">VERIFIED</h3>
            </div>
        </div>
        <div className="soft-card p-8 flex items-center gap-6 shadow-md border-emerald-500/5">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center shadow-lg shadow-emerald-500/5">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 opacity-60">Variables</p>
                <h3 className="text-2xl font-black text-foreground italic tracking-tight">18 Params</h3>
            </div>
        </div>
        <div className="soft-card p-8 flex items-center gap-6 shadow-md border-amber-500/5">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center shadow-lg shadow-amber-500/5">
                <AlertCircle className="w-8 h-8 text-amber-500" />
            </div>
            <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 opacity-60">Data Gaps</p>
                <h3 className="text-2xl font-black text-foreground italic tracking-tight uppercase italic">Optimal</h3>
            </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="soft-card overflow-hidden shadow-2xl border-border/50">
        <div className="p-10 pb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2.5 px-5 py-2.5 bg-secondary/50 rounded-2xl border border-border text-[10px] font-black uppercase tracking-widest text-foreground shadow-sm">
                <Filter className="w-3.5 h-3.5 text-primary" />
                Filter Assets
             </div>
             <div className="flex items-center gap-2.5 px-5 py-2.5 bg-secondary/30 rounded-2xl border border-transparent text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-secondary transition-all cursor-pointer">
                <TableIcon className="w-3.5 h-3.5" />
                Matrix View
             </div>
          </div>
          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-50 italic">
            Live Feed: {sites.length} Active Nodes
          </div>
        </div>

        {sites.length === 0 ? (
          <div className="p-20 flex flex-col items-center justify-center text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-blue-500 mb-2 opacity-50" />
            <h3 className="text-xl font-black italic uppercase text-foreground">No Dataset Available</h3>
            <p className="text-muted-foreground text-sm max-w-sm">Please upload your custom Excel dataset using the Upload button, or load the Sample Dataset to explore the dashboard.</p>
            <button 
              onClick={() => fileInputRef.current.click()}
              className="mt-4 px-6 py-3 bg-blue-500 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all"
            >
              Upload Custom Dataset
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border transition-colors">
                <th className="p-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground italic opacity-60">Candidate Site</th>
                {features.map((f, i) => (
                   <th key={i} className="p-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground italic opacity-60 whitespace-nowrap">{f}</th>
                ))}
                <th className="p-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground italic opacity-60">Risk Profile</th>
                <th className="p-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground italic opacity-60 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sites.map((site, i) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={site.id || i} 
                  className="border-b border-border/50 hover:bg-muted/30 transition-all group"
                >
                  <td className="p-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center font-black text-[11px] italic text-muted-foreground shadow-inner">0{i+1}</div>
                      <span className="text-sm font-black uppercase tracking-tight text-foreground whitespace-nowrap">{site.Site}</span>
                    </div>
                  </td>
                  {features.map((f, j) => (
                    <td key={j} className="p-8 text-xs text-muted-foreground font-bold italic">
                       {typeof site[f] === 'number' ? site[f].toFixed(2) : (site[f] || "N/A")}
                    </td>
                  ))}
                  <td className="p-8">
                    <span className={cn(
                      "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm transition-all whitespace-nowrap",
                      (site.Risk === 'Low' || site.Risk === 'Minimal') ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/10' : 
                      (site.Risk === 'Medium') ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/10' : 
                      'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/10'
                    )}>
                      {site.Risk || "Unknown"} Risk
                    </span>
                  </td>
                  <td className="p-8 text-right">
                    <button className="p-3 hover:bg-rose-500/10 rounded-xl transition-all group/btn">
                      <Trash2 className="w-4 h-4 text-muted-foreground group-hover/btn:text-rose-500 transition-colors" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
        
        {/* Footer info */}
        <div className="p-10 bg-secondary/20 border-t border-border/50 text-center">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-40">
                Hybrid Decision Matrix: Qualitative Synthesis & Quantitative Scaling Engaged
            </p>
        </div>
      </div>
    </div>
  );
}
