"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  X, 
  Truck, 
  Ship, 
  Factory, 
  ShieldCheck, 
  Terminal,
  Activity,
  Globe2,
  Box,
  Cpu
} from "lucide-react";

// Mock data generator for plant supply chain
const generateMockData = (plantName) => {
  const isSouth = plantName.toLowerCase().includes("ennore") || plantName.toLowerCase().includes("hosur") || plantName.toLowerCase().includes("oragadam") || plantName.toLowerCase().includes("tn");
  
  return {
    vendors: {
      tier1: Math.floor(Math.random() * 40) + 120,
      tier2: Math.floor(Math.random() * 200) + 500,
      importDependency: isSouth ? "12%" : "8%",
      primaryHubs: isSouth ? ["Chennai Cluster", "Coimbatore", "Bangalore"] : ["NCR Region", "Pune", "Ahmedabad"]
    },
    exports: {
      primaryPort: isSouth ? "Chennai Port (Ennore)" : "Mundra Port / Kandla",
      transitTime: isSouth ? "2-4 hours" : "24-36 hours",
      globalReach: ["Middle East", "Africa", "SAARC"],
      volumeCapacity: Math.floor(Math.random() * 5000) + 15000 + " TEU/yr"
    },
    transport: {
      railCorridor: isSouth ? "Southern Freight Corridor" : "Western DFC",
      highwayAccess: isSouth ? "NH-44, NH-48" : "NH-48, NH-9",
      fleetReq: Math.floor(Math.random() * 50) + 150 + " Trucks/Day"
    }
  };
};

export default function PlantSupplyChainModal({ plant, onClose }) {
  const [data, setData] = useState(null);
  const [terminalLogs, setTerminalLogs] = useState([]);

  useEffect(() => {
    if (plant) {
      setData(generateMockData(plant.name));
    }
  }, [plant]);

  useEffect(() => {
    if (!plant) return;
    const initialLogs = [
      `Initiating secure handshake to [${plant.name}] nodes...`,
      "Verifying E2E encryption certificates...",
      "Status: SECURE 256-bit AES link established",
      "Fetching real-time vendor capacity metrics...",
      "Connecting to Logistics Integration Hub...",
      "Data stream active."
    ];
    let currentLog = 0;
    const logInterval = setInterval(() => {
      if (currentLog < initialLogs.length) {
        setTerminalLogs(prev => [...prev, initialLogs[currentLog]]);
        currentLog++;
      } else {
        clearInterval(logInterval);
      }
    }, 600);
    return () => clearInterval(logInterval);
  }, [plant]);

  if (!plant || !data) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/80 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="relative w-full max-w-6xl max-h-full overflow-y-auto bg-[#0a0a0a] border border-white/10 rounded-[40px] shadow-2xl flex flex-col hide-scrollbar"
      >
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between p-8 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="w-5 h-5 text-blue-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">Secure Supply Chain Intelligence</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black italic tracking-tight text-white uppercase">{plant.name}</h2>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Algorithmic Rank Score</p>
              <p className="text-2xl font-black italic text-emerald-500">{plant.hybrid.toFixed(3)}</p>
            </div>
            <button 
              onClick={onClose}
              className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all hover:rotate-90 group"
            >
              <X className="w-5 h-5 text-muted-foreground group-hover:text-white" />
            </button>
          </div>
        </div>

        <div className="p-8 space-y-8 flex-1">
          
          {/* End-to-End Visual Map */}
          <div className="relative p-10 rounded-[30px] bg-secondary/20 border border-border overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <Globe2 className="w-48 h-48" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-10">End-to-End Flow Network</h3>
            
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-0 relative max-w-5xl mx-auto">
              {/* Connection Line */}
              <div className="absolute top-1/2 left-0 w-full h-1 bg-white/5 -translate-y-1/2 hidden lg:block z-0 line-glow rounded-full"></div>
              
              {/* Nodes */}
              <div className="relative z-10 flex flex-col items-center bg-[#111] p-6 rounded-3xl border border-white/10 min-w-[220px] shadow-lg">
                <div className="p-4 bg-amber-500/10 rounded-2xl mb-4">
                  <Cpu className="w-8 h-8 text-amber-500" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-white mb-1">Vendor Base</span>
                <span className="text-[10px] font-bold uppercase text-amber-500/70 block mt-2 px-3 py-1 bg-amber-500/10 rounded-full">{data.vendors.tier1} Tier-1 Nodes</span>
              </div>

              <motion.div animate={{ x: [0, 40, 0] }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }} className="hidden lg:block z-10">
                <Truck className="w-6 h-6 text-white/20" />
              </motion.div>

              <div className="relative z-10 flex flex-col items-center bg-[#111] p-6 rounded-3xl border border-blue-500/30 shadow-[0_0_40px_rgba(59,130,246,0.15)] min-w-[220px] transform scale-110">
                <div className="p-4 bg-blue-500/20 rounded-2xl mb-4 shadow-inner">
                  <Factory className="w-10 h-10 text-blue-500" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-white mb-1">Assembly Plant</span>
                <span className="text-[10px] font-bold uppercase text-blue-400 block mt-2 text-center max-w-[180px]">{plant.name}</span>
              </div>

              <motion.div animate={{ x: [0, 40, 0] }} transition={{ repeat: Infinity, duration: 3, delay: 1, ease: "linear" }} className="hidden lg:block z-10">
                <Truck className="w-6 h-6 text-white/20" />
              </motion.div>

              <div className="relative z-10 flex flex-col items-center bg-[#111] p-6 rounded-3xl border border-white/10 min-w-[220px] shadow-lg">
                <div className="p-4 bg-emerald-500/10 rounded-2xl mb-4">
                  <Ship className="w-8 h-8 text-emerald-500" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-white mb-1">Global Export</span>
                <span className="text-[10px] font-bold uppercase text-emerald-500/70 block mt-2 px-3 py-1 bg-emerald-500/10 rounded-full">{data.exports.primaryPort}</span>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Vendor Base */}
            <div className="p-8 rounded-[30px] bg-secondary/10 border border-border hover:bg-secondary/20 transition-all">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-amber-500/10 rounded-2xl">
                  <Box className="w-6 h-6 text-amber-500" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-white">Vendor Matrix</h3>
              </div>
              <div className="space-y-5">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Tier 1 Suppliers</span>
                  <span className="text-xl font-black text-amber-500">{data.vendors.tier1}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Tier 2/3 Network</span>
                  <span className="text-lg font-black text-white">{data.vendors.tier2}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Import Need</span>
                  <span className="text-sm font-black text-white/70">{data.vendors.importDependency}</span>
                </div>
                <div className="pt-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground block mb-3">Primary Sourcing Hubs</span>
                  <div className="flex flex-wrap gap-2">
                    {data.vendors.primaryHubs.map((hub, i) => (
                      <span key={i} className="text-[10px] px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/80 font-black uppercase tracking-wider">{hub}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Transportation */}
            <div className="p-8 rounded-[30px] bg-secondary/10 border border-border hover:bg-secondary/20 transition-all">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-blue-500/10 rounded-2xl">
                  <Truck className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-white">Logistics & Transit</h3>
              </div>
              <div className="space-y-5">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Highway Access</span>
                  <span className="text-xs font-black text-white text-right">{data.transport.highwayAccess}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Rail Corridor</span>
                  <span className="text-xs font-black text-white text-right">{data.transport.railCorridor}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-3 mt-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Daily Fleet Req.</span>
                  <span className="text-xl font-black text-blue-500">{data.transport.fleetReq}</span>
                </div>
              </div>
            </div>

            {/* Exporting */}
            <div className="p-8 rounded-[30px] bg-secondary/10 border border-border hover:bg-secondary/20 transition-all">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-emerald-500/10 rounded-2xl">
                  <Ship className="w-6 h-6 text-emerald-500" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-white">Export Infrastructure</h3>
              </div>
              <div className="space-y-5">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Primary Seaport</span>
                  <span className="text-xs font-black text-emerald-500 text-right">{data.exports.primaryPort}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Hub Transit</span>
                  <span className="text-sm font-black text-white">{data.exports.transitTime}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Est. Volume</span>
                  <span className="text-sm font-black text-white/70">{data.exports.volumeCapacity}</span>
                </div>
                <div className="pt-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground block mb-3">Global Export Reach</span>
                  <div className="flex flex-wrap gap-2">
                    {data.exports.globalReach.map((seg, i) => (
                      <span key={i} className="text-[10px] px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/80 font-black uppercase tracking-wider">{seg}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Terminal / Encrypted Footer */}
        <div className="p-8 bg-black/50 border-t border-white/5 font-mono text-[10px] flex gap-6">
          <Terminal className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
          <div className="space-y-1.5 w-full max-h-[100px] overflow-y-auto pr-4">
            {terminalLogs.map((log, i) => (
              <div key={i} className={i === terminalLogs.length - 1 ? "text-emerald-500 animate-pulse" : "text-emerald-500/40"}>
                <span className="opacity-40 mr-3 hidden sm:inline-block">[{new Date().toISOString().split('T')[1].slice(0,-1)}] SYSTEM_DAEMON</span>
                {log}
              </div>
            ))}
            {terminalLogs.length === 6 && (
              <div className="text-emerald-500 font-bold uppercase flex items-center gap-3 mt-3 tracking-widest bg-emerald-500/10 w-fit px-4 py-2 rounded">
                <Activity className="w-4 h-4 animate-spin-slow" /> END-TO-END LINK ESTABLISHED
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
