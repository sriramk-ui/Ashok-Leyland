"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";

const GeospatialMap = dynamic(() => import("@/components/GeospatialMap"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[500px] w-full animate-pulse bg-primary/5 rounded-[2rem] border border-border flex items-center justify-center p-8">
      <h1 className="text-xl text-primary font-black italic animate-bounce">Loading Geospatial Map…</h1>
    </div>
  ),
});

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import axios from "axios";
import {
  Trophy, Target, TrendingUp, Scale, ArrowRight, Info, CheckCircle,
  Download, Sparkles, MapPin, Zap, Lightbulb, Medal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import PlantSupplyChainModal from "@/components/PlantSupplyChainModal";
import LogoLoader from "@/components/LogoLoader";

// ─── Smart Insight Generator ─────────────────────────────────────
function generateInsight(site, allSites, features) {
  if (!site || !features || features.length === 0) return null;
  const benefitFeatures = features.filter(f => {
    const l = f.toLowerCase();
    return !l.includes("cost") && !l.includes("capex") && !l.includes("risk");
  });
  const costFeatures = features.filter(f => {
    const l = f.toLowerCase();
    return l.includes("cost") || l.includes("capex");
  });
  const insights = [];
  benefitFeatures.forEach(f => {
    const siteVal = parseFloat(site[f]) || 0;
    const isTop = allSites.every(s => (parseFloat(s[f]) || 0) <= siteVal || s === site);
    if (isTop) insights.push(`leading ${f}`);
  });
  costFeatures.forEach(f => {
    const siteVal = parseFloat(site[f]) || 0;
    const isLowest = allSites.every(s => (parseFloat(s[f]) || 0) >= siteVal || s === site);
    if (isLowest) insights.push(`lowest ${f}`);
  });
  if (insights.length === 0) return "Strong balanced performance across all criteria.";
  if (insights.length === 1) return `Stands out for ${insights[0]}.`;
  return `Best in class: ${insights.slice(0, 2).join(" and ")}.`;
}

const loadingMessages = [
  "Analyzing dataset…",
  "Normalizing decision matrix…",
  "Computing TOPSIS scores…",
  "Running VIKOR algorithm…",
  "Building hybrid rankings…",
];

// ─── Podium Card ──────────────────────────────────────────────────
// Descending staircase layout: rank 1 (left, tallest) -> rank 4 (right, shortest)
function PodiumCard({ rank, site, activeMetric, insight, onClick }) {
  // Determine top padding to create the descending steps
  let ptClass = "pt-0";
  if (rank === 2) ptClass = "pt-12 md:pt-16";
  if (rank === 3) ptClass = "pt-12 md:pt-32";
  if (rank === 4) ptClass = "pt-12 md:pt-48";

  if (rank === 1) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -12, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.05, type: "spring", stiffness: 180, damping: 22 }}
        onClick={onClick}
        className={`flex-1 ${ptClass} relative cursor-pointer group min-w-0`}
      >
        <div className="neon-border rounded-[2.5rem] h-full">
          <div
            className="rounded-[2.5rem] bg-gradient-to-b from-primary/10 to-transparent p-4 xl:p-6 pt-14 text-center relative overflow-visible h-full flex flex-col"
            style={{ boxShadow: "0 0 60px rgba(0,102,179,0.15), inset 0 1px 0 rgba(0,102,179,0.1)" }}
          >
            {/* Trophy badge */}
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-14 h-14 bg-card border-2 border-primary/30 rounded-2xl flex items-center justify-center shadow-xl group-hover:border-primary transition-all z-10">
              <Trophy className="w-7 h-7 text-primary group-hover:scale-110 transition-transform" style={{ filter: "drop-shadow(0 0 6px rgba(0,102,179,0.6))" }} />
            </div>
            <p className="text-[8px] font-black text-primary/60 uppercase tracking-[0.4em] mb-1">#1 Ranked</p>
            <p className="text-[10px] xl:text-xs font-black text-foreground uppercase tracking-[0.1em] mb-2 leading-tight px-1">{site.name}</p>
            <p
              className="text-4xl xl:text-5xl font-black italic tracking-tighter text-primary leading-none mb-3"
              style={{ textShadow: "0 0 32px rgba(0,102,179,0.4)" }}
            >
              {site[activeMetric]?.toFixed(3)}
            </p>
            <div className="insight-chip insight-chip-cyan mx-auto w-fit mb-3 text-[8px] xl:text-[9px] px-2 py-1">🥇 Top Recommendation</div>
            <div className="mt-auto">
              {insight && (
                <p className="text-[9px] text-foreground/65 font-bold italic leading-relaxed group-hover:text-foreground/90 transition-colors px-1">
                  <Lightbulb className="w-3 h-3 inline mr-1 text-primary" />
                  {insight}
                </p>
              )}
              <p className="text-[7px] xl:text-[8px] text-muted-foreground/40 uppercase tracking-widest mt-4 group-hover:text-primary/50 transition-colors">
                ↗ Click for Details
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (rank === 2) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        onClick={onClick}
        className={`flex-1 ${ptClass} relative cursor-pointer group min-w-0`}
      >
        <div
          className="rounded-[2rem] bg-card border p-3 xl:p-5 pt-12 text-center relative overflow-visible transition-all duration-300 h-full flex flex-col"
          style={{ borderColor: "rgba(99,102,241,0.25)", boxShadow: "0 0 30px rgba(99,102,241,0.06)" }}
        >
          <div className="absolute inset-0 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ boxShadow: "inset 0 0 40px rgba(99,102,241,0.07)" }} />
          {/* Rank badge */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-400/30 flex items-center justify-center shadow-lg group-hover:bg-violet-500 group-hover:border-violet-500 transition-all z-10">
            <span className="text-xl font-black text-violet-500 group-hover:text-white transition-colors">2</span>
          </div>
          <p className="text-[8px] font-black text-violet-400/70 uppercase tracking-[0.35em] mb-1">#2 Ranked</p>
          <p className="text-[9px] xl:text-[10px] font-black text-foreground uppercase tracking-[0.1em] mb-2 leading-tight px-1">{site.name}</p>
          <p className="text-2xl xl:text-3xl font-black italic tracking-tighter text-foreground leading-none mb-3">
            {site[activeMetric]?.toFixed(3)}
          </p>
          <div className="insight-chip insight-chip-purple mx-auto w-fit mb-3 text-[8px] px-2 py-1">⚖️ VIKOR Compromise</div>
          <div className="mt-auto">
            {insight && (
              <p className="text-[8px] text-muted-foreground font-bold italic leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity px-1">
                {insight}
              </p>
            )}
            <p className="text-[7px] xl:text-[8px] text-muted-foreground/35 uppercase tracking-widest mt-4 group-hover:text-violet-400/60 transition-colors">
              ↗ Click for Details
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (rank === 3) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        onClick={onClick}
        className={`flex-1 ${ptClass} relative cursor-pointer group min-w-0`}
      >
        <div
          className="rounded-[2rem] bg-card border p-3 xl:p-5 pt-12 text-center relative overflow-visible transition-all duration-300 h-full flex flex-col"
          style={{ borderColor: "rgba(245,158,11,0.2)" }}
        >
          <div className="absolute inset-0 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ boxShadow: "inset 0 0 40px rgba(245,158,11,0.06)" }} />
          {/* Rank badge */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center shadow-lg group-hover:bg-amber-500 group-hover:border-amber-500 transition-all z-10">
            <span className="text-xl font-black text-amber-500 group-hover:text-white transition-colors">3</span>
          </div>
          <p className="text-[8px] font-black text-amber-400/70 uppercase tracking-[0.35em] mb-1">#3 Ranked</p>
          <p className="text-[9px] xl:text-[10px] font-black text-foreground uppercase tracking-[0.1em] mb-2 leading-tight px-1">{site.name}</p>
          <p className="text-2xl xl:text-3xl font-black italic tracking-tighter text-foreground leading-none mb-3">
            {site[activeMetric]?.toFixed(3)}
          </p>
          <div className="insight-chip insight-chip-emerald mx-auto w-fit mb-3 text-[8px] px-2 py-1">📊 Strong Contender</div>
          <div className="mt-auto">
            <p className="text-[7px] xl:text-[8px] text-muted-foreground/35 uppercase tracking-widest mt-4 group-hover:text-amber-400/60 transition-colors">
              ↗ Click for Details
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // ── 4th place
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      onClick={onClick}
      className={`flex-1 ${ptClass} relative cursor-pointer group min-w-0 hidden md:block`}
    >
      <div
        className="rounded-[2rem] bg-card border p-3 xl:p-5 pt-12 text-center relative overflow-visible transition-all duration-300 h-full flex flex-col"
        style={{ borderColor: "rgba(148,163,184,0.2)" }}
      >
        <div className="absolute inset-0 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ boxShadow: "inset 0 0 40px rgba(148,163,184,0.06)" }} />
        {/* Rank badge */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-2xl bg-slate-500/10 border border-slate-400/30 flex items-center justify-center shadow-lg group-hover:bg-slate-500 group-hover:border-slate-500 transition-all z-10">
          <span className="text-xl font-black text-slate-500 group-hover:text-white transition-colors">4</span>
        </div>
        <p className="text-[8px] font-black text-slate-400/70 uppercase tracking-[0.35em] mb-1">#4 Ranked</p>
        <p className="text-[9px] xl:text-[10px] font-black text-foreground uppercase tracking-[0.1em] mb-2 leading-tight px-1">{site.name}</p>
        <p className="text-2xl xl:text-3xl font-black italic tracking-tighter text-foreground leading-none mb-3">
          {site[activeMetric]?.toFixed(3)}
        </p>
        <div className="insight-chip insight-chip-slate mx-auto w-fit mb-3 text-[8px] px-2 py-1 bg-slate-500/10 text-slate-500">✅ Solid Choice</div>
        <div className="mt-auto">
          <p className="text-[7px] xl:text-[8px] text-muted-foreground/35 uppercase tracking-widest mt-4 group-hover:text-slate-400/60 transition-colors">
            ↗ Click for Details
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────
export default function RankingAnalysis() {
  const router = useRouter();
  const { theme } = useTheme();
  const [data, setData] = useState([]);
  const [rawFeatures, setRawFeatures] = useState([]);
  const [activeMetric, setActiveMetric] = useState("hybrid");
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState(loadingMessages[0]);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [usingCustomWeights, setUsingCustomWeights] = useState(false);

  const isDark = theme === "dark";

  useEffect(() => {
    if (!isLoading) return;
    let i = 0;
    const iv = setInterval(() => {
      i = (i + 1) % loadingMessages.length;
      setLoadingMsg(loadingMessages[i]);
    }, 900);
    return () => clearInterval(iv);
  }, [isLoading]);

  useEffect(() => {
    const runAnalysis = async () => {
      try {
        const stData = localStorage.getItem("dss_live_data");
        const stFeat = localStorage.getItem("dss_live_features");
        if (!stData || !stFeat) { setIsLoading(false); return; }

        const sites = JSON.parse(stData);
        const features = JSON.parse(stFeat);
        setRawFeatures(features);

        const matrixData = sites.map(site => features.map(f => Number(site[f] || 0)));
        const isBenefit = features.map(f => {
          const lower = f.toLowerCase();
          return !(lower.includes("cost") || lower.includes("capex") || lower.includes("risk"));
        });

        const savedWeightsRaw = localStorage.getItem("dss_ahp_weights");
        let weights;
        if (savedWeightsRaw) {
          const parsed = JSON.parse(savedWeightsRaw);
          if (parsed && parsed.length === features.length) {
            weights = parsed;
            setUsingCustomWeights(true);
          }
        }
        if (!weights) weights = features.map(() => 1 / features.length);

        const payload = { data: matrixData, weights, is_benefit: isBenefit };
        const [topsisRes, vikorRes] = await Promise.all([
          axios.post("http://127.0.0.1:8000/analyze/topsis", payload),
          axios.post("http://127.0.0.1:8000/analyze/vikor", payload),
        ]);

        const topsisScores = topsisRes.data.scores;
        const vikorQ = vikorRes.data.Q;
        const vikorScores = vikorQ.map(q => 1 - q);

        const combinedRanking = sites.map((site, idx) => ({
          ...site,
          name: site.Site || site.name || `Site ${idx + 1}`,
          topsis: topsisScores[idx],
          vikor: vikorScores[idx],
          hybrid: topsisScores[idx] * 0.5 + vikorScores[idx] * 0.5,
        }));
        combinedRanking.sort((a, b) => b.hybrid - a.hybrid);
        combinedRanking.forEach((item, index) => (item.rank = index + 1));
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

  const topInsight   = useMemo(() => data.length > 0 ? generateInsight(data[0], data, rawFeatures) : null, [data, rawFeatures]);
  const vikorInsight = useMemo(() => data.length > 1 ? generateInsight(data[1], data, rawFeatures) : null, [data, rawFeatures]);

  const barColors = (index) => {
    if (index === 0) return "var(--primary)";
    if (index === 1) return "#818cf8";
    if (index === 2) return "#f59e0b";
    return isDark ? "#1e293b" : "#e2e8f0";
  };

  const metricHelpers = {
    hybrid: "Balanced recommendation combining TOPSIS + VIKOR",
    topsis: "Higher score = better location (distance from ideal solution)",
    vikor: "Inverted Q — closer to 1 = best compromise across all criteria",
  };

  // ─── Loading ──────────────────────────────────────────────────
  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <LogoLoader size="lg" text={loadingMsg} />
      <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-bold">
        Running TOPSIS &amp; VIKOR algorithms
      </p>
    </div>
  );

  if (data.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
      <Scale className="w-16 h-16 text-primary/30" />
      <h2 className="text-2xl font-black italic uppercase">No Dataset Available</h2>
      <p className="text-muted-foreground max-w-sm">Please upload your dataset on the Data Management page first.</p>
      <button onClick={() => router.push("/dashboard/data")} className="btn-next-step">
        Go to Data Management <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );

  return (
    <div className="space-y-10 selection:bg-primary/20 selection:text-primary pb-20">

      {/* ── Info Banner ─────────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-primary/5 border border-primary/15">
          <Info className="w-4 h-4 text-primary shrink-0" />
          <p className="text-[11px] font-bold text-primary/80 uppercase tracking-widest">
            Step 3 — TOPSIS: higher score = better location · VIKOR: best compromise solution
          </p>
        </div>
        <AnimatePresence>
          {usingCustomWeights && (
            <motion.div
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-accent/5 border border-accent/20"
            >
              <Sparkles className="w-4 h-4 text-accent shrink-0" />
              <p className="text-[11px] font-bold text-accent uppercase tracking-widest">
                Using your AHP priority weights — rankings reflect your decisions
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Metric Selector ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest">
          {metricHelpers[activeMetric]}
        </p>
        <div className="flex bg-secondary/60 p-1 rounded-2xl border border-border w-fit gap-1 self-end sm:self-auto">
          {["hybrid", "topsis", "vikor"].map(m => (
            <button
              key={m}
              onClick={() => setActiveMetric(m)}
              className={cn(
                "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                activeMetric === m
                  ? "bg-primary text-white shadow-lg"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5",
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* ── Podium ─────────────────────────────────────────────── */}
      {/* Descending staircase layout: 1 -> 4 left to right */}
      <div className="flex flex-col md:flex-row items-stretch justify-center gap-3 xl:gap-5 pt-10 pb-8">
        {data.slice(0, 4).map((site, index) => {
          const rank = index + 1;
          const insight = rank === 1 ? topInsight : (rank === 2 ? vikorInsight : null);
          return (
            <PodiumCard
              key={site.name || index}
              rank={rank}
              site={site}
              activeMetric={activeMetric}
              insight={insight}
              onClick={() => setSelectedPlant(site)}
            />
          );
        })}
      </div>

      {/* ── Geospatial Map ──────────────────────────────────────── */}
      <div className="w-full">
        <GeospatialMap data={data} />
      </div>

      {/* ── Charts & Full Ranking ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Bar Chart */}
        <div className="p-8 pb-4 rounded-[2.5rem] bg-card border border-border shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black uppercase italic tracking-tight">Score Comparison</h3>
            <span className={cn("insight-chip text-[9px]",
              activeMetric === "hybrid" ? "insight-chip-cyan"
              : activeMetric === "topsis" ? "insight-chip-blue"
              : "insight-chip-purple"
            )}>{activeMetric.toUpperCase()}</span>
          </div>
          <div className="h-[380px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ left: 40, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#0f1f35" : "#f1f5f9"} horizontal={false} />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: isDark ? "#94a3b8" : "#64748b", fontSize: 10, fontWeight: 900 }}
                  width={120}
                />
                <Tooltip
                  cursor={{ fill: isDark ? "rgba(0,102,179,0.04)" : "rgba(0,102,179,0.03)" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-card border border-border p-4 rounded-2xl shadow-xl space-y-1">
                          <p className="text-xs font-black uppercase tracking-wider">{item.name}</p>
                          <p className="text-primary font-black italic text-lg">{Number(payload[0].value).toFixed(3)}</p>
                          <div className="pt-1 border-t border-border space-y-0.5">
                            <p className="text-[9px] text-muted-foreground font-bold">TOPSIS: {item.topsis?.toFixed(3)}</p>
                            <p className="text-[9px] text-muted-foreground font-bold">VIKOR: {item.vikor?.toFixed(3)}</p>
                            <p className="text-[9px] text-muted-foreground font-bold">Hybrid: {item.hybrid?.toFixed(3)}</p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey={activeMetric} radius={[0, 8, 8, 0]} barSize={26} animationDuration={900}>
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={barColors(index)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Full Audit Ranking Table */}
        <div className="p-8 rounded-[2.5rem] bg-card border border-border shadow-sm flex flex-col">
          <h3 className="text-xl font-black uppercase italic tracking-tight mb-6">Full Audit Ranking</h3>
          <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-1">
            {data.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30 border border-border hover:border-primary/25 hover:bg-secondary/50 transition-all group cursor-pointer"
                onClick={() => setSelectedPlant(item)}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-sm shrink-0",
                    i === 0 ? "bg-primary text-white" : i === 1 ? "bg-violet-500/15 text-violet-500" : i === 2 ? "bg-amber-500/15 text-amber-500" : "bg-muted text-muted-foreground",
                  )}
                    style={i === 0 ? { boxShadow: "0 4px 15px var(--glow-blue)" } : {}}
                  >
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-tight text-foreground">{item.name}</p>
                    <div className="flex gap-3 mt-0.5">
                      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">T: {item.topsis?.toFixed(3)}</p>
                      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">V: {item.vikor?.toFixed(3)}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black italic text-primary leading-none">{item.hybrid?.toFixed(3)}</p>
                  {i === 0 && (
                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1 justify-end mt-1">
                      <TrendingUp className="w-3 h-3" /> Top
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col sm:flex-row items-center justify-between gap-6 p-8 rounded-[2rem] border"
        style={{
          background: "linear-gradient(135deg, rgba(0,102,179,0.06) 0%, rgba(99,102,241,0.05) 100%)",
          borderColor: "rgba(0,102,179,0.2)",
        }}
      >
        <div>
          <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">
            🏆 Top Site: {data[0]?.name}
          </p>
          <h3 className="text-lg font-black italic uppercase tracking-tight text-foreground">
            Analysis complete — download your executive report
          </h3>
          <p className="text-xs text-muted-foreground font-bold mt-1">
            Export structured Excel &amp; PDF with rankings, weights, and insights.
          </p>
        </div>
        <button onClick={() => router.push("/dashboard/export")} className="btn-next-step shrink-0">
          View &amp; Export Results
          <ArrowRight className="w-5 h-5 stroke-[2.5]" />
        </button>
      </motion.div>

      {/* ── Modal ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedPlant && (
          <PlantSupplyChainModal
            plant={selectedPlant}
            onClose={() => setSelectedPlant(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
