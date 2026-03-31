"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import { motion } from "framer-motion";
import { 
  Users, 
  Banknote, 
  Truck, 
  Building2, 
  Search,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  ArrowUpRight,
  ChevronDown
} from "lucide-react";
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  ResponsiveContainer 
} from "recharts";

const dataChart = [
  { subject: 'Logistics', A: 120, B: 110, fullMark: 150 },
  { subject: 'Manpower', A: 98, B: 130, fullMark: 150 },
  { subject: 'Govt Norms', A: 86, B: 130, fullMark: 150 },
  { subject: 'Capex', A: 99, B: 100, fullMark: 150 },
  { subject: 'Vendor Base', A: 85, B: 90, fullMark: 150 },
  { subject: 'Scale', A: 65, B: 85, fullMark: 150 },
];

const GeospatialMap = dynamic(() => import("@/components/GeospatialMap"), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full animate-pulse bg-white/5 rounded-[40px] border border-white/10 flex items-center justify-center p-8"><h1 className="text-xl text-yellow-500 font-black italic animate-bounce">Loading Maps...</h1></div>
});

const StatCard = ({ icon: Icon, label, value, trend, color }) => (
  <div className="soft-card p-6 group">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center shadow-lg shadow-current/10`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full flex items-center gap-1">
        <ArrowUpRight className="w-3 h-3" />
        {trend}
      </div>
    </div>
    <h3 className="text-2xl font-black text-foreground italic tracking-tight">{value}</h3>
    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
  </div>
);

export default function DashboardPage() {
  const [mapData, setMapData] = useState([]);
  const [features, setFeatures] = useState([]);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  
  const handleLoadSample = async () => {
     try {
       const res = await axios.get("http://127.0.0.1:8000/sample-dataset");
       if (res.data && !res.data.error) {
          localStorage.setItem("dss_live_data", JSON.stringify(res.data.data));
          localStorage.setItem("dss_live_features", JSON.stringify(res.data.features));
          setFeatures(res.data.features);
          setMapData(res.data.data);
          setSelectedFeatures([]);
       }
     } catch (e) {
       console.error("Failed to load sample dataset", e);
     }
  };
  
  useEffect(() => {
     const stComp = localStorage.getItem("dss_computed_ranking");
     const stRaw = localStorage.getItem("dss_live_data");
     const stFeat = localStorage.getItem("dss_live_features");

     if (stFeat && stFeat !== "[]") {
        setFeatures(JSON.parse(stFeat));
     }
     if (stComp && stComp !== "[]") {
        setMapData(JSON.parse(stComp));
     } else if (stRaw && stRaw !== "[]") {
        setMapData(JSON.parse(stRaw));
     }
  }, []);

  const filteredFeatures = features.filter(f => !["Latitude", "Longitude", "Site", "id", "hybrid", "Risk", "name", "rank"].includes(f));

  // Compute intercepted dynamic feature rankings
  const displayData = [...mapData].map(site => ({...site}));
  if (selectedFeatures.length > 0 && displayData.length > 0) {
      // Multi-criteria normalized scoring engine
      displayData.forEach(site => site.customScore = 0);

      selectedFeatures.forEach(feature => {
         const isCost = feature.toLowerCase().includes("cost") || feature.toLowerCase().includes("capex") || feature.toLowerCase().includes("risk");
         
         let min = Infinity;
         let max = -Infinity;
         displayData.forEach(s => {
             const val = parseFloat(s[feature]) || 0;
             if (val < min) min = val;
             if (val > max) max = val;
         });
         
         displayData.forEach(site => {
             const val = parseFloat(site[feature]) || 0;
             let normalized = 0;
             if (max !== min) {
                normalized = (val - min) / (max - min);
             }
             if (isCost) {
                normalized = 1 - normalized; // Invert Cost Parameters
             }
             site.customScore += normalized;
         });
      });
      
      // Sort array appropriately by highest composite benefit
      displayData.sort((a, b) => b.customScore - a.customScore);
      
      // Re-assign authoritative rank
      displayData.forEach((site, index) => {
          site.rank = index + 1;
      });
  }

  if (mapData.length === 0) {
     return (
        <div className="flex flex-col items-center justify-center p-20 text-center space-y-6 pt-32">
           <AlertCircle className="w-16 h-16 text-blue-500 mb-4 opacity-70" />
           <h2 className="text-3xl font-black italic uppercase text-foreground">Awaiting Dataset</h2>
           <p className="text-muted-foreground text-sm max-w-lg mx-auto">Please manually upload your custom dataset via the Data Management panel, or click "Load Sample" to begin the geospatial analysis.</p>
           <button onClick={() => window.location.href='/dashboard/data'} className="px-8 py-4 bg-primary text-primary-foreground font-black uppercase tracking-widest rounded-2xl shadow-lg hover:scale-105 transition-all mt-6">Go to Data Management</button>
        </div>
     );
  }

  return (
    <div className="space-y-10 selection:bg-primary/20 selection:text-primary pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic text-foreground">
            Strategic <span className="text-primary">Overview</span>
          </h1>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
            Plant Location Decision Support Intelligence
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handleLoadSample} className="p-3 px-6 bg-blue-500/10 text-blue-500 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-blue-500/20 transition-all active:scale-95 whitespace-nowrap shadow-sm">
            Load Sample
          </button>
          <button className="p-3 bg-primary text-primary-foreground rounded-2xl hover:scale-110 hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95">
            <Users className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Building2} 
          label="Candidate Sites" 
          value={mapData.length > 0 ? (mapData.length < 10 ? `0${mapData.length}` : mapData.length) : "0"} 
          trend="Live Active" 
          color="bg-blue-500"
        />
        <StatCard 
          icon={Banknote} 
          label="Min. Capex Est." 
          value="₹84.5Cr" 
          trend="Saved 12%" 
          color="bg-emerald-500"
        />
        <StatCard 
          icon={Truck} 
          label="Logistics Score" 
          value="0.89" 
          trend="+0.04" 
          color="bg-orange-500"
        />
        <StatCard 
          icon={CheckCircle2} 
          label="Confidence" 
          value="96.2%" 
          trend="Stable" 
          color="bg-indigo-500"
        />
      </div>

      {/* Main Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* High-visibility map level constraint bar */}
          <div className="w-full flex flex-wrap items-center gap-3 pb-2 select-none">
             <button
                onClick={() => setSelectedFeatures([])}
                className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${selectedFeatures.length === 0 ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-500/50 ring-offset-2 ring-offset-background" : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-white"}`}
             >
                Overall Hybrid Synergy
             </button>
             {filteredFeatures.map(f => {
                const isSelected = selectedFeatures.includes(f);
                return (
                  <button
                     key={f}
                     onClick={() => {
                        if (isSelected) {
                            setSelectedFeatures(selectedFeatures.filter(item => item !== f));
                        } else {
                            setSelectedFeatures([...selectedFeatures, f]);
                        }
                     }}
                     className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.1em] transition-all ${isSelected ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-500/50 ring-offset-2 ring-offset-background" : "bg-card text-muted-foreground hover:bg-secondary hover:text-white shadow-sm border border-border"}`}
                  >
                     {f}
                  </button>
                );
             })}
          </div>

          {/* Geospatial Map replacing static banner */}
          <div className="w-full h-[500px]">
             <GeospatialMap data={displayData} />
          </div>

          {/* Ranking Table Snippet */}
          <div className="soft-card p-8">
            <div className="flex items-center justify-between mb-8 px-2">
              <h3 className="text-xl font-black uppercase italic tracking-tight text-foreground">Top Candidates</h3>
            </div>
            <div className="space-y-4">
              {displayData.slice(0, 3).map((loc, i) => (
                 <div key={i} className="flex items-center justify-between p-5 rounded-[1.5rem] bg-muted/30 border border-transparent hover:border-primary/20 hover:bg-card hover:shadow-lg transition-all duration-300">
                   <div className="flex items-center gap-5">
                     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black italic text-lg shadow-inner ${i === 0 ? 'bg-blue-500 text-white shadow-blue-500/50' : 'bg-secondary text-muted-foreground'}`}>0{i+1}</div>
                     <div>
                       <p className="text-sm font-black uppercase tracking-tight text-foreground">{loc.name || loc.Site}</p>
                       <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{i === 0 ? 'Top Recommendation' : 'Stable Alternative'}</p>
                     </div>
                   </div>
                   <div className="text-right">
                     <p className="text-xl font-black italic text-foreground leading-none mb-2">
                       {selectedFeatures.length === 0 
                          ? (loc.hybrid ? loc.hybrid.toFixed(3) : "Loading...") 
                          : selectedFeatures.length === 1 ? loc[selectedFeatures[0]] : loc.customScore.toFixed(3)}
                     </p>
                     <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase ${loc.Risk === 'Low' ? 'bg-emerald-500/10 text-emerald-500' : loc.Risk === 'High' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'}`}>
                       {selectedFeatures.length === 0 ? `${loc.Risk || "Medium"} Risk` : selectedFeatures.length === 1 ? `${selectedFeatures[0]}` : "Composite Optimization"}
                     </span>
                   </div>
                 </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Comparative Analysis */}
        <div className="space-y-8">
          <div className="soft-card p-8 h-full">
            <h3 className="text-xl font-black uppercase italic tracking-tight mb-8 text-foreground px-2">Criteria Strength</h3>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={dataChart}>
                  <PolarGrid stroke="var(--border)" strokeOpacity={0.5} />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontWeight: 900 }} />
                  <Radar
                    name="Candidate"
                    dataKey="A"
                    stroke="var(--primary)"
                    fill="var(--primary)"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-4 p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                <div>
                  <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Growth Constraint</p>
                  <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">Power grid stability in Northern clusters is currently below optimal levels for heavy expansion.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" />
                <div>
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Policy Advantage</p>
                  <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">New EV policy incentives favor Tamil Nadu and Maharashtra locations for upcoming fiscal years.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
