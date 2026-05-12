"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileSpreadsheet, Activity, ChevronRight } from "lucide-react";
import axios from "axios";
import { loadSampleDataToStorage } from "@/lib/sampleData";

export default function UploadModal() {
  const [show, setShow] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [hover, setHover] = useState(false);
  const fileInputRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();

  // Re-check visibility when paths change
  useEffect(() => {
    const stData = localStorage.getItem("dss_live_data");
    const stFeat = localStorage.getItem("dss_live_features");
    if (!stData || !stFeat || stData === "[]" || stData === "null") {
      setShow(true);
    } else {
      setShow(false);
    }
  }, [pathname]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/upload/excel`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.error) {
        alert(response.data.error);
      } else {
        localStorage.setItem("dss_live_data", JSON.stringify(response.data.data));
        localStorage.setItem("dss_live_features", JSON.stringify(response.data.features));
        setShow(false);
        router.push("/dashboard/analysis");
      }
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload dataset. Ensure format is correct.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleLoadSample = () => {
     loadSampleDataToStorage();
     setShow(false);
     router.push("/dashboard");
  };

  return (
    <AnimatePresence>
      {show && (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-2xl flex items-center justify-center p-4 selection:bg-blue-500 selection:text-white"
      >
        <motion.div 
          initial={{ scale: 0.9, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="relative w-full max-w-2xl bg-[#0a0a0a] rounded-[40px] border border-white/10 p-12 overflow-hidden shadow-2xl"
        >
          {/* Animated Background Gradients */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 text-center space-y-6">
            <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto border border-blue-500/20 shadow-[0_0_50px_rgba(59,130,246,0.2)]">
               <FileSpreadsheet className="w-10 h-10 text-blue-500" />
            </div>

            <div>
               <h2 className="text-4xl font-black italic tracking-tighter uppercase text-white mb-2">Awaiting <span className="text-blue-500">Dataset</span></h2>
               <p className="text-gray-400 font-medium text-sm max-w-sm mx-auto">
                 The mathematical engine requires a live dataset before the dashboard visualizer can be initialized.
               </p>
            </div>

            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
            />

            <div className="flex flex-col gap-4 mt-8 w-full max-w-md mx-auto">
                <button 
                  onClick={() => fileInputRef.current.click()}
                  onMouseEnter={() => setHover(true)}
                  onMouseLeave={() => setHover(false)}
                  disabled={isUploading}
                  className="w-full relative group overflow-hidden bg-blue-500 hover:bg-blue-600 transition-colors p-6 rounded-[24px] shadow-xl text-white font-black uppercase tracking-widest text-sm flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                   {isUploading ? (
                      <span className="flex items-center gap-2 animate-pulse"><Activity className="w-5 h-5 flex-shrink-0" /> Processing Math Models...</span>
                   ) : (
                      <>
                        <UploadCloud className="w-5 h-5 flex-shrink-0 group-hover:-translate-y-1 transition-transform" />
                        <span>Upload Custom Excel Data</span>
                        <ChevronRight className={`w-5 h-5 absolute right-6 transition-all duration-300 ${hover ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`} />
                      </>
                   )}
                </button>

                <div className="flex items-center justify-center gap-4 text-xs font-black uppercase tracking-widest text-gray-600 my-2">
                   <div className="w-12 h-px bg-white/10" /> OR <div className="w-12 h-px bg-white/10" />
                </div>

                <button 
                  onClick={handleLoadSample}
                  disabled={isUploading}
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all p-5 rounded-[20px] font-black uppercase tracking-widest text-[11px] disabled:opacity-50"
                >
                  Explore using Default Sample Dataset
                </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
}
