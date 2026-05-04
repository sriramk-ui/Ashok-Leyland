"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import { FileSpreadsheet, FileText, UserCircle, BellRing, Settings, Search } from "lucide-react";
import LogoLoader from "./LogoLoader";

export default function TopHeader({ toggleSidebar }) {
  const pathname = usePathname();
  const [isExporting, setIsExporting] = useState({ excel: false, pdf: false });
  const [liveData, setLiveData] = useState([]);

  useEffect(() => {
    const computedRanking = localStorage.getItem("dss_computed_ranking");
    const rawData = localStorage.getItem("dss_live_data");
    if (computedRanking) {
       setLiveData(JSON.parse(computedRanking));
    } else if (rawData) {
       setLiveData(JSON.parse(rawData));
    }
  }, [pathname]);

  const getPageTitle = () => {
    switch (pathname) {
      case "/dashboard":           return { title: "Strategic Overview",    sub: "Plant Location Decision Support Intelligence" };
      case "/dashboard/data":      return { title: "Data Management",       sub: "Upload & Configure Candidate Parameters" };
      case "/dashboard/weights":   return { title: "Criteria Weighting",    sub: "AHP — Set What Matters Most to Your Decision" };
      case "/dashboard/analysis":  return { title: "Ranking Analysis",      sub: "TOPSIS & VIKOR Multi-Criteria Evaluation" };
      case "/dashboard/export":    return { title: "Enterprise Reports",    sub: "Download Executive Summaries & Data Exports" };
      case "/dashboard/optimization": return { title: "LP Optimization",   sub: "Capacity Allocation & Advanced Modelling" };
      default: return { title: "Decision Intelligence", sub: "Smart Plant Location System" };
    }
  };

  const handleExport = async (type) => {
    setIsExporting({ ...isExporting, [type]: true });
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
      setIsExporting({ ...isExporting, [type]: false });
    }
  };

  const { title, sub } = getPageTitle();

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between w-full h-20 px-6 lg:px-8 bg-background/80 backdrop-blur-xl border-b border-border shadow-sm">
      {/* Left: Brand & Menu */}
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="w-10 h-10 rounded-2xl bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all shrink-0"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
        </button>
        <div className="hidden md:flex flex-col">
          <img src="/logo.png" alt="Ashok Leyland" className="h-7 object-contain self-start" />
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1 mt-1">
            {title}
          </p>
        </div>
      </div>

      {/* Middle: Search */}
      <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
         <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
         <input 
            type="text" 
            placeholder="Search anything..." 
            className="w-full bg-secondary/30 border border-border rounded-full py-2.5 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
         />
      </div>

      {/* Right: Global Actions */}
      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-3 pr-4 border-r border-border">
           <button
             onClick={() => handleExport('excel')}
             disabled={isExporting.excel}
             className="px-4 py-2 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all rounded-xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest group disabled:opacity-50 min-w-[100px] justify-center"
           >
             {isExporting.excel
               ? <><LogoLoader size="sm" text="" /> Exporting…</>
               : <><FileSpreadsheet className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" /> Excel</>}
           </button>
           <button
             onClick={() => handleExport('pdf')}
             disabled={isExporting.pdf}
             className="px-4 py-2 bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white transition-all rounded-xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest group disabled:opacity-50 min-w-[100px] justify-center"
           >
             {isExporting.pdf
               ? <><LogoLoader size="sm" text="" /> Generating…</>
               : <><FileText className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" /> PDF</>}
           </button>
        </div>

        {/* User tools */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors relative">
             <BellRing className="w-4 h-4" />
             <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" style={{boxShadow: '0 0 8px var(--glow-cyan)'}}></span>
          </button>
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white ml-2 font-black italic shadow-lg cursor-pointer" style={{boxShadow: '0 4px 15px var(--glow-cyan)'}}>
             AD
          </div>
        </div>
      </div>
    </header>
  );
}
