"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { loadSampleDataToStorage, SAMPLE_DATA, SAMPLE_FEATURES } from "@/lib/sampleData";
import { 
  Plus, 
  Upload, 
  Trash2, 
  Table as TableIcon,
  Filter,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import LogoLoader from "@/components/LogoLoader";

export default function DataManagement() {
  const [sites, setSites] = useState([]);
  const [features, setFeatures] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const fileInputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const stData = localStorage.getItem("dss_live_data");
    const stFeat = localStorage.getItem("dss_live_features");
    if (stData && stFeat) {
       setSites(JSON.parse(stData));
       setFeatures(JSON.parse(stFeat));
    } else {
       handleLoadSample();
    }
  }, []);

  const handleLoadSample = () => {
     loadSampleDataToStorage();
     setSites(SAMPLE_DATA);
     setFeatures(SAMPLE_FEATURES);
     setUploadSuccess(`${SAMPLE_DATA.length} sites · ${SAMPLE_FEATURES.length} criteria loaded`);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Basic validation
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls'].includes(ext)) {
      setUploadError("Invalid file type. Please upload an Excel (.xlsx / .xls) file.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/upload/excel`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.error) {
        setUploadError(response.data.error);
      } else {
        localStorage.setItem("dss_live_data", JSON.stringify(response.data.data));
        localStorage.setItem("dss_live_features", JSON.stringify(response.data.features));
        setSites(response.data.data);
        setFeatures(response.data.features);
        setUploadSuccess(`${response.data.data.length} sites · ${response.data.features.length} criteria loaded from ${file.name}`);
      }
    } catch (error) {
      setUploadError("Upload failed. Check that your file matches the template format.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const hasData = sites.length > 0;

  return (
    <div className="space-y-8 selection:bg-primary/20 selection:text-primary pb-20">
      {/* Helper banner */}
      <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-primary/5 border border-primary/15">
        <Info className="w-4 h-4 text-primary shrink-0" />
        <p className="text-[11px] font-bold text-primary/80 uppercase tracking-widest">
          Step 1 — Upload your candidate sites to begin the analysis workflow
        </p>
      </div>

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
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
          />
          <a
            href=`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/download/template`
            className="btn-soft-secondary text-[10px] no-underline"
          >
            <TableIcon className="w-4 h-4" />
            Template
          </a>
          <button
           onClick={() => fileInputRef.current.click()}
           disabled={isUploading}
           className="btn-soft-secondary text-[10px]"
          >
            {isUploading ? <LogoLoader size="sm" text="" /> : <Upload className="w-4 h-4" />}
            {isUploading ? "Uploading…" : "Upload Excel"}
          </button>
          <button
            onClick={handleLoadSample}
            disabled={isUploading}
            className="btn-soft-primary text-[10px]"
          >
            {isUploading && <LogoLoader size="sm" text="" />}
            Load Sample Dataset
          </button>
        </div>
      </header>

      {/* Full Screen Loader */}
      {isUploading && <LogoLoader fullScreen={true} text="Analyzing Dataset..." />}

      {/* Upload feedback toast */}
      <AnimatePresence>
        {uploadError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500"
          >
            <XCircle className="w-5 h-5 shrink-0" />
            <p className="text-xs font-bold">{uploadError}</p>
            <button onClick={() => setUploadError(null)} className="ml-auto opacity-60 hover:opacity-100 text-xs font-black">✕</button>
          </motion.div>
        )}
        {uploadSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500"
          >
            <CheckCircle className="w-5 h-5 shrink-0" />
            <p className="text-xs font-bold">{uploadSuccess}</p>
            <button onClick={() => setUploadSuccess(null)} className="ml-auto opacity-60 hover:opacity-100 text-xs font-black">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="soft-card p-8 flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shadow-lg">
                <FileSpreadsheet className="w-7 h-7 text-primary" />
            </div>
            <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 opacity-60">Dataset Status</p>
                <h3 className={cn("text-2xl font-black italic tracking-tight", hasData ? "text-emerald-500" : "text-muted-foreground")}>
                  {hasData ? "VERIFIED" : "AWAITING"}
                </h3>
            </div>
        </div>
        <div className="soft-card p-8 flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center shadow-lg">
                <CheckCircle className="w-7 h-7 text-emerald-500" />
            </div>
            <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 opacity-60">Candidate Sites</p>
                <h3 className="text-2xl font-black text-foreground italic tracking-tight">
                  {hasData ? `${sites.length} Sites` : "—"}
                </h3>
            </div>
        </div>
        <div className="soft-card p-8 flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center shadow-lg">
                <AlertCircle className="w-7 h-7 text-amber-500" />
            </div>
            <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 opacity-60">Criteria</p>
                <h3 className="text-2xl font-black text-foreground italic tracking-tight">
                  {hasData ? `${features.length} Params` : "—"}
                </h3>
            </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="soft-card overflow-hidden shadow-2xl border-border/50">
        <div className="p-8 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-4 py-2 bg-secondary/50 rounded-xl border border-border text-[10px] font-black uppercase tracking-widest text-foreground shadow-sm">
                <Filter className="w-3.5 h-3.5 text-primary" />
                Filter Assets
             </div>
             <div className="flex items-center gap-2 px-4 py-2 bg-secondary/30 rounded-xl border border-transparent text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-secondary transition-all cursor-pointer">
                <TableIcon className="w-3.5 h-3.5" />
                Matrix View
             </div>
          </div>
          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-50 italic">
            Live Feed: {sites.length} Active Nodes
          </div>
        </div>

        {!hasData ? (
          <div className="p-20 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 rounded-3xl bg-secondary flex items-center justify-center mb-2">
              <AlertCircle className="w-10 h-10 text-primary/50" />
            </div>
            <h3 className="text-xl font-black italic uppercase text-foreground">No Dataset Available</h3>
            <p className="text-muted-foreground text-sm max-w-sm">Upload your custom Excel dataset or load the Sample Dataset to explore the dashboard.</p>
            <button
              onClick={() => fileInputRef.current.click()}
              className="mt-4 px-8 py-4 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-all shadow-lg"
              style={{boxShadow: '0 6px 30px var(--glow-cyan)'}}
            >
              Upload Custom Dataset
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Site</th>
                {features.map((f, i) => (
                   <th key={i} className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 whitespace-nowrap">{f}</th>
                ))}
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Risk</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sites.map((site, i) => (
                <motion.tr
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  key={site.id || i}
                  className="border-b border-border/40 hover:bg-muted/30 transition-all group"
                >
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center font-black text-[11px] italic text-muted-foreground shadow-inner">
                        {String(i + 1).padStart(2, '0')}
                      </div>
                      <span className="text-sm font-black uppercase tracking-tight text-foreground whitespace-nowrap">{site.Site}</span>
                    </div>
                  </td>
                  {features.map((f, j) => (
                    <td key={j} className="p-6 text-xs text-muted-foreground font-bold italic">
                       {typeof site[f] === 'number' ? site[f].toFixed(2) : (site[f] || "N/A")}
                    </td>
                  ))}
                  <td className="p-6">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border whitespace-nowrap",
                      (site.Risk === 'Low' || site.Risk === 'Minimal') ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                      (site.Risk === 'Medium') ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                      'bg-rose-500/10 text-rose-500 border-rose-500/20'
                    )}>
                      {site.Risk || "Unknown"} Risk
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <button className="p-2.5 hover:bg-rose-500/10 rounded-xl transition-all group/btn">
                      <Trash2 className="w-4 h-4 text-muted-foreground group-hover/btn:text-rose-500 transition-colors" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          </div>
        )}

        <div className="p-8 bg-secondary/20 border-t border-border/50 text-center">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-40">
                Hybrid Decision Matrix · Qualitative Synthesis & Quantitative Scaling
            </p>
        </div>
      </div>

      {/* Next Step CTA */}
      {hasData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-6 p-8 rounded-[2rem] border"
          style={{
            background: 'linear-gradient(135deg, rgba(6,182,212,0.05) 0%, rgba(168,85,247,0.05) 100%)',
            borderColor: 'rgba(6,182,212,0.2)'
          }}
        >
          <div>
            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">
              ✓ Data Ready — {sites.length} Sites · {features.length} Criteria
            </p>
            <h3 className="text-lg font-black italic uppercase tracking-tight text-foreground">
              Now set your decision priorities
            </h3>
            <p className="text-xs text-muted-foreground font-bold mt-1">
              Use the AHP module to weight each criterion by importance.
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard/weights")}
            className="btn-next-step shrink-0"
          >
            Continue to AHP Weighting
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </motion.div>
      )}
    </div>
  );
}
