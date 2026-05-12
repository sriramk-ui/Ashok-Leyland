"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Users, Banknote, Truck, Building2, Search,
  CheckCircle2, AlertCircle, ArrowUpRight, ArrowRight,
  Zap, Sparkles, Database, Weight, TrendingUp, UploadCloud, Play, FileText, Maximize2, Trophy, BarChart3, Download
} from "lucide-react";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer
} from "recharts";
import { cn } from "@/lib/utils";

const dataChart = [
  { subject: 'Logistics', A: 120, B: 110, fullMark: 150 },
  { subject: 'Manpower',  A: 98,  B: 130, fullMark: 150 },
  { subject: 'Govt Norms',A: 86,  B: 130, fullMark: 150 },
  { subject: 'Capex',     A: 99,  B: 100, fullMark: 150 },
  { subject: 'Vendor',    A: 85,  B: 90,  fullMark: 150 },
  { subject: 'Scale',     A: 65,  B: 85,  fullMark: 150 },
];

const GeospatialMap = dynamic(() => import("@/components/GeospatialMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full animate-pulse bg-white/5 rounded-[40px] border border-white/10 flex items-center justify-center">
      <h1 className="text-xl text-primary font-black italic animate-bounce">Loading Maps…</h1>
    </div>
  ),
});

const StatCard = ({ icon: Icon, label, value, trend, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all flex items-start gap-4 relative overflow-hidden group"
  >
    <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-300`}>
      <Icon className="w-7 h-7 text-white" />
    </div>
    <div className="flex-1 pt-1">
      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
      <h3 className="text-2xl font-black text-foreground tracking-tight">{value}</h3>
    </div>
    <div className="absolute top-4 right-4">
      <div className={`text-[9px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 ${
        trend.includes('+') || trend.includes('Saved') || trend === 'Stable' 
          ? 'bg-emerald-500/10 text-emerald-500' 
          : 'bg-primary/10 text-primary'
      }`}>
        {trend}
      </div>
    </div>
  </motion.div>
);

export default function DashboardPage() {
  const router = useRouter();
  const [mapData, setMapData] = useState([]);
  const [features, setFeatures] = useState([]);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [workflowState, setWorkflowState] = useState({ data: false, weights: false, ranking: false });

  const handleLoadSample = async () => {
     try {
       const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/sample-dataset`);
       if (res.data && !res.data.error) {
          localStorage.setItem("dss_live_data", JSON.stringify(res.data.data));
          localStorage.setItem("dss_live_features", JSON.stringify(res.data.features));
          setFeatures(res.data.features);
          setMapData(res.data.data);
          setSelectedFeatures([]);
          setWorkflowState(prev => ({ ...prev, data: true }));
       }
     } catch (e) {
       console.error("Failed to load sample dataset", e);
     }
  };

  useEffect(() => {
     const stComp = localStorage.getItem("dss_computed_ranking");
     const stRaw  = localStorage.getItem("dss_live_data");
     const stFeat = localStorage.getItem("dss_live_features");
     const stAhp  = localStorage.getItem("dss_ahp_weights");

     const hasData    = !!(stRaw  && stRaw  !== "[]" && stRaw  !== "null");
     const hasWeights = !!(stAhp  && stAhp  !== "null");
     const hasRanking = !!(stComp && stComp !== "[]" && stComp !== "null");
     setWorkflowState({ data: hasData, weights: hasWeights, ranking: hasRanking });

     if (stFeat && stFeat !== "[]") setFeatures(JSON.parse(stFeat));
     if (stComp && stComp !== "[]") setMapData(JSON.parse(stComp));
     else if (stRaw && stRaw !== "[]") setMapData(JSON.parse(stRaw));
     else handleLoadSample();
  }, []);

  const filteredFeatures = features.filter(f =>
    !["Latitude", "Longitude", "Site", "id", "hybrid", "Risk", "name", "rank"].includes(f)
  );

  const displayData = [...mapData].map(site => ({ ...site }));
  if (selectedFeatures.length > 0 && displayData.length > 0) {
      displayData.forEach(site => site.customScore = 0);
      selectedFeatures.forEach(feature => {
         const isCost = feature.toLowerCase().includes("cost") || feature.toLowerCase().includes("capex") || feature.toLowerCase().includes("risk");
         let min = Infinity, max = -Infinity;
         displayData.forEach(s => {
             const val = parseFloat(s[feature]) || 0;
             if (val < min) min = val;
             if (val > max) max = val;
         });
         displayData.forEach(site => {
             const val = parseFloat(site[feature]) || 0;
             let normalized = max !== min ? (val - min) / (max - min) : 0;
             if (isCost) normalized = 1 - normalized;
             site.customScore += normalized;
         });
      });
      displayData.sort((a, b) => b.customScore - a.customScore);
      displayData.forEach((site, index) => { site.rank = index + 1; });
  }

  // ─── Quick Start / Continue Card ─────────────────────────────────
  const nextStep = !workflowState.data ? {
    icon: Database,
    label: "Get Started",
    title: "Upload Your Dataset",
    desc: "Add candidate sites to begin the decision analysis workflow.",
    href: "/dashboard/data",
    cta: "Upload Data",
    color: "primary",
  } : !workflowState.weights ? {
    icon: Weight,
    label: "Step 2",
    title: "Set Your Priorities",
    desc: "Use the AHP module to weight each criterion by importance.",
    href: "/dashboard/weights",
    cta: "Open AHP Weighting",
    color: "primary",
  } : !workflowState.ranking ? {
    icon: TrendingUp,
    label: "Step 3",
    title: "Run Ranking Analysis",
    desc: "TOPSIS & VIKOR will rank all sites using your priorities.",
    href: "/dashboard/analysis",
    cta: "Run Analysis",
    color: "primary",
  } : null;

  if (mapData.length === 0) {
     return (
        <div className="flex flex-col items-center justify-center p-20 text-center space-y-8 pt-24">
          {/* Animated icon */}
          <div className="relative">
            <div className="w-32 h-32 rounded-[2.5rem] bg-primary/10 flex items-center justify-center border border-primary/20"
              style={{ boxShadow: '0 0 60px rgba(6,182,212,0.15)' }}>
              <Zap className="w-16 h-16 text-primary" style={{ filter: 'drop-shadow(0 0 15px rgba(6,182,212,0.5))' }} />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent flex items-center justify-center animate-bounce">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>

          <div>
            <h2 className="text-4xl font-black italic uppercase text-foreground tracking-tighter">
              Welcome to <span className="text-primary">Decision Intelligence</span>
            </h2>
            <p className="text-muted-foreground text-sm max-w-lg mx-auto mt-3 leading-relaxed font-bold">
              Upload your candidate site data to begin AI-powered multi-criteria analysis using AHP, TOPSIS & VIKOR.
            </p>
          </div>

          <div className="flex items-center gap-4 flex-wrap justify-center">
            <button
              onClick={() => router.push('/dashboard/data')}
              className="btn-next-step"
            >
              <Database className="w-5 h-5" />
              Upload Your Dataset
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>
            <button
              onClick={handleLoadSample}
              className="btn-soft-secondary px-8 py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest"
            >
              Load Sample Dataset
            </button>
          </div>

          {/* Workflow preview steps */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl w-full mt-4">
            {[
              { n: "01", label: "Upload Data", desc: "Add candidate sites" },
              { n: "02", label: "AHP Weights", desc: "Set priorities" },
              { n: "03", label: "Run Ranking", desc: "TOPSIS + VIKOR" },
              { n: "04", label: "Export", desc: "PDF & Excel" },
            ].map((step, i) => (
              <div key={i} className="soft-card p-5 text-center opacity-60 hover:opacity-100 transition-opacity">
                <p className="text-3xl font-black italic text-primary mb-2">{step.n}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-foreground">{step.label}</p>
                <p className="text-[9px] text-muted-foreground font-bold mt-1">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
     );
  }

  return (
    <div className="space-y-6 selection:bg-primary/20 selection:text-primary pb-20">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div>
          <h2 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-2">
            Welcome back, Admin! <span className="text-2xl">👋</span>
          </h2>
          <p className="text-sm font-medium text-muted-foreground mt-1">Strategic insights for smarter plant location decisions.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard/data')}
            className="px-5 py-2.5 rounded-full border border-primary/20 text-primary font-black uppercase tracking-widest text-[10px] hover:bg-primary/5 transition-all flex items-center gap-2"
          >
            <UploadCloud className="w-4 h-4" /> Upload Data
          </button>
          <button
            onClick={handleLoadSample}
            className="px-5 py-2.5 rounded-full bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-lg hover:shadow-primary/50 transition-all flex items-center gap-2"
            style={{boxShadow: '0 4px 15px var(--glow-cyan)'}}
          >
            <Database className="w-4 h-4" /> Load Sample
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Building2} label="Total Locations"  value={mapData.length > 0 ? String(mapData.length).padStart(2,'0') : "0"} trend="Live" color="bg-primary"         delay={0}    />
        <StatCard icon={Banknote}  label="Estimated Investment"  value="₹84.5 Cr"   trend="Saved 12%"  color="bg-emerald-500"     delay={0.07} />
        <StatCard icon={Truck}     label="Overall Score"  value="0.89"       trend="↑ 0.04"      color="bg-orange-500"      delay={0.14} />
        <StatCard icon={CheckCircle2} label="Model Confidence"   value="96.2%"      trend="Stable"     color="bg-violet-500"      delay={0.21} />
      </div>

      {/* Filter Tabs */}
      <div className="w-full flex flex-wrap items-center gap-3 select-none pt-2">
         <button
            onClick={() => setSelectedFeatures([])}
            className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${selectedFeatures.length === 0 ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-card text-muted-foreground border border-border hover:bg-secondary"}`}
         >
            Overall Hybrid Synergy
         </button>
         {filteredFeatures.map(f => {
            const isSelected = selectedFeatures.includes(f);
            return (
              <button
                 key={f}
                 onClick={() => {
                    if (isSelected) setSelectedFeatures(selectedFeatures.filter(item => item !== f));
                    else setSelectedFeatures([...selectedFeatures, f]);
                 }}
                 className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.1em] transition-all ${isSelected ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-card text-muted-foreground border border-border hover:bg-secondary"}`}
              >
                 {f}
              </button>
            );
         })}
      </div>

      {/* Main Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Map Card */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col h-full">
            <div className="p-5 flex items-center justify-between border-b border-border/50">
               <div>
                  <h3 className="text-lg font-black text-foreground tracking-tight">Geospatial Intelligence</h3>
                  <p className="text-[10px] font-medium text-muted-foreground mt-0.5">Live Optimization Matrix</p>
               </div>
               <div className="flex items-center gap-3">
                  <div className="flex bg-secondary rounded-lg p-1">
                     <button className="px-3 py-1 rounded-md bg-primary text-white text-[10px] font-black tracking-widest shadow-sm">Cyber Dark</button>
                     <button className="px-3 py-1 rounded-md text-muted-foreground hover:text-foreground text-[10px] font-black tracking-widest transition-colors">Satellite</button>
                  </div>
                  <button className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                     <Maximize2 className="w-4 h-4" />
                  </button>
               </div>
            </div>
            <div className="w-full h-[450px] relative bg-[#0B1121]">
               <GeospatialMap data={displayData} />
               <div className="absolute bottom-6 left-6 bg-background/90 backdrop-blur-md border border-border p-3 rounded-xl flex flex-col gap-2 shadow-lg">
                  <div className="flex items-center gap-2">
                     <span className="w-2.5 h-2.5 rounded-full bg-primary" style={{boxShadow: '0 0 8px var(--glow-cyan)'}}></span>
                     <span className="text-[10px] font-medium text-foreground">High Potential</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="w-2.5 h-2.5 rounded-full bg-primary/40"></span>
                     <span className="text-[10px] font-medium text-muted-foreground">Moderate Potential</span>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Right column: Radar Chart */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 h-full flex flex-col shadow-sm">
            <h3 className="text-lg font-black text-foreground tracking-tight mb-2">Criteria Strength</h3>
            <div className="flex-1 min-h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={dataChart}>
                  <PolarGrid stroke="var(--border)" strokeOpacity={0.4} />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontWeight: 900 }} />
                  <Radar
                    name="Candidate"
                    dataKey="A"
                    stroke="var(--primary)"
                    fill="var(--primary)"
                    fillOpacity={0.2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
                <AlertCircle className="w-4 h-4 text-primary mt-0.5" />
                <div>
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Key Insight</p>
                  <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">Logistics and Scale factors have higher influence on the final decision.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                <div>
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Strategic Advantage</p>
                  <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">Northern regions show strong potential based on current evaluation.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Analysis Progress */}
         <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-black text-foreground tracking-tight mb-6">Analysis Progress</h3>
            <div className="relative flex justify-between items-center px-2">
               <div className="absolute left-6 right-6 top-4 h-0.5 bg-secondary -z-10"></div>
               {[
                 { step: 1, label: "Upload Data", status: workflowState.data ? 'done' : 'current' },
                 { step: 2, label: "AHP Weights", status: workflowState.weights ? 'done' : workflowState.data ? 'current' : 'pending' },
                 { step: 3, label: "Ranking",     status: workflowState.ranking ? 'done' : workflowState.weights ? 'current' : 'pending' },
                 { step: 4, label: "Export Results",status: 'pending' },
               ].map((s, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-colors ${
                        s.status === 'done' ? 'bg-primary text-white shadow-lg' :
                        s.status === 'current' ? 'bg-primary/20 text-primary border-2 border-primary' :
                        'bg-secondary text-muted-foreground'
                     }`}>
                        {s.status === 'done' ? <CheckCircle2 className="w-4 h-4" /> : s.step}
                     </div>
                     <div className="text-center">
                        <p className="text-[9px] font-black text-foreground">{s.label}</p>
                        <p className="text-[8px] font-bold text-muted-foreground uppercase">{s.status === 'done' ? 'Completed' : s.status}</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Top Ranked Location */}
         <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group">
            <div className="flex items-center gap-2 mb-2">
               <Trophy className="w-4 h-4 text-primary" />
               <h3 className="text-sm font-black text-foreground tracking-tight">Top Ranked Location</h3>
            </div>
            <div className="flex items-end justify-between z-10">
               <div>
                  <h4 className="text-2xl font-black text-primary tracking-tight">{displayData[0]?.name || displayData[0]?.Site || "—"}</h4>
                  <div className="flex gap-4 mt-2">
                     <div>
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Overall Score</p>
                        <p className="text-sm font-black text-foreground">
                           {displayData[0] ? (selectedFeatures.length === 0 ? displayData[0].hybrid?.toFixed(3) : displayData[0].customScore?.toFixed(3)) : "—"}
                        </p>
                     </div>
                     <div>
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Confidence</p>
                        <p className="text-sm font-black text-foreground">96.2%</p>
                     </div>
                  </div>
               </div>
               <div className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1">
                  Rank #1
               </div>
            </div>
            <div className="absolute right-0 bottom-0 opacity-20 group-hover:opacity-40 transition-opacity">
               <BarChart3 className="w-24 h-24 text-primary -mb-4 -mr-4" />
            </div>
         </div>

         {/* Quick Actions */}
         <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-black text-foreground tracking-tight mb-4">Quick Actions</h3>
            <div className="grid grid-cols-3 gap-3 h-full">
               <button onClick={() => router.push('/dashboard/analysis')} className="bg-secondary/50 hover:bg-secondary rounded-xl flex flex-col items-center justify-center gap-2 p-3 transition-colors border border-transparent hover:border-border">
                  <Play className="w-5 h-5 text-primary" />
                  <span className="text-[9px] font-black text-foreground">Run Analysis</span>
               </button>
               <button onClick={() => router.push('/dashboard/optimization')} className="bg-secondary/50 hover:bg-secondary rounded-xl flex flex-col items-center justify-center gap-2 p-3 transition-colors border border-transparent hover:border-emerald-500/20">
                  <FileText className="w-5 h-5 text-emerald-500" />
                  <span className="text-[9px] font-black text-foreground">View Report</span>
               </button>
               <button onClick={() => router.push('/dashboard/export')} className="bg-secondary/50 hover:bg-secondary rounded-xl flex flex-col items-center justify-center gap-2 p-3 transition-colors border border-transparent hover:border-violet-500/20">
                  <Download className="w-5 h-5 text-violet-500" />
                  <span className="text-[9px] font-black text-foreground">Export Data</span>
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
