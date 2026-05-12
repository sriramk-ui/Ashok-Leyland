"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import LogoLoader from "@/components/LogoLoader";
import {
  Scale, Info, CheckCircle, AlertTriangle, RefreshCcw,
  ArrowRight, Sparkles, Zap, Settings2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { cn } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from "recharts";

const defaultCriteria = [
  "Vendor Base", "Manpower/Skill", "Capex",
  "Govt Norms/Tax SOPs", "Logistics Cost", "Economies of Scale"
];

// Quick Mode: slider steps 1-5 → AHP scale 1,3,5,7,9
const SLIDER_TO_AHP = [1, 3, 5, 7, 9];
const SLIDER_LABELS = ["Very Low", "Low", "Medium", "High", "Very High"];

function buildMatrixFromSliders(sliderValues) {
  const ahp = sliderValues.map(v => SLIDER_TO_AHP[v - 1]);
  const n = ahp.length;
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) =>
      i === j ? 1 : ahp[i] / ahp[j]
    )
  );
}

// Advanced Mode helpers
const intensityLevels = [
  { value: 3, label: "Slight",   desc: "Slightly more important" },
  { value: 5, label: "Moderate", desc: "Moderately more important" },
  { value: 7, label: "Strong",   desc: "Strongly more important" },
  { value: 9, label: "Extreme",  desc: "Extremely more important" },
];

function buildMatrixFromPairs(pairs, n) {
  const m = Array.from({ length: n }, () => Array(n).fill(1));
  pairs.forEach(p => {
    if (p.preference === "left")  { m[p.i][p.j] = p.intensity; m[p.j][p.i] = 1 / p.intensity; }
    if (p.preference === "right") { m[p.i][p.j] = 1 / p.intensity; m[p.j][p.i] = p.intensity; }
  });
  return m;
}

// ── Results Panel ─────────────────────────────────────────────────
function ResultsPanel({ results, criteria, isLoading }) {
  const chartData = useMemo(() => {
    if (!results?.weights || !criteria.length) return [];
    return results.weights
      .map((w, i) => ({ name: criteria[i], shortName: criteria[i].split(" ")[0], weight: w * 100 }))
      .sort((a, b) => b.weight - a.weight);
  }, [results, criteria]);

  const COLORS = ["#06b6d4", "#a855f7", "#f59e0b", "#10b981", "#f97316", "#6366f1"];

  return (
    <div className="lg:col-span-5 space-y-6 sticky top-6">
      {/* CR Card */}
      {results && (
        <motion.div
          key={results.cr}
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className={cn(
            "p-6 rounded-[2rem] relative overflow-hidden border",
            results.cr < 0.1
              ? "bg-emerald-500/8 border-emerald-500/20"
              : "bg-rose-500/8 border-rose-500/20"
          )}
        >
          <div className="flex gap-4">
            <div className={cn(
              "w-11 h-11 rounded-2xl flex items-center justify-center shrink-0",
              results.cr < 0.1 ? "bg-emerald-500 text-white" : "bg-rose-500 text-white animate-pulse"
            )}>
              {results.cr < 0.1 ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <h3 className={cn("font-black uppercase italic tracking-tight", results.cr < 0.1 ? "text-emerald-500" : "text-rose-500")}>
                {results.cr < 0.1 ? "Consistent Inputs" : "Inconsistent — Adjust Priorities"}
              </h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                Consistency Ratio: {results.cr.toFixed(4)}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Weights Panel */}
      <div className="soft-card p-8 rounded-[2.5rem]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black uppercase italic tracking-tight">Priority Weights</h3>
          {isLoading && <LogoLoader size="sm" text="" />}
        </div>

        {results && chartData.length > 0 ? (
          <div className="space-y-6">
            {/* Top highlight */}
            <div className="flex items-center gap-4 p-4 rounded-2xl border"
              style={{ background: "rgba(6,182,212,0.06)", borderColor: "rgba(6,182,212,0.2)" }}>
              <div className="w-10 h-10 bg-primary text-white flex items-center justify-center rounded-xl font-black shadow-lg"
                style={{ boxShadow: "0 4px 15px var(--glow-cyan)" }}>1</div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest">Top Priority</p>
                <p className="text-sm font-black uppercase tracking-tight">{chartData[0].name}</p>
              </div>
              <p className="text-2xl font-black italic tracking-tighter">{chartData[0].weight.toFixed(1)}%</p>
            </div>

            {/* Bar chart */}
            <div className="h-[220px] -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 50, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" hide domain={[0, "dataMax + 10"]} />
                  <YAxis dataKey="shortName" type="category" axisLine={false} tickLine={false}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontWeight: 900 }} width={110} />
                  <Tooltip cursor={{ fill: "rgba(6,182,212,0.04)" }}
                    content={({ active, payload }) => active && payload?.length ? (
                      <div className="bg-card border border-border p-3 rounded-2xl shadow-xl">
                        <p className="text-xs font-black uppercase">{payload[0].payload.name}</p>
                        <p className="text-primary font-black italic text-lg">{Number(payload[0].value).toFixed(1)}%</p>
                      </div>
                    ) : null} />
                  <Bar dataKey="weight" radius={[0, 8, 8, 0]} barSize={18} animationDuration={800}>
                    {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Full list */}
            <div className="space-y-2 pt-4 border-t border-border">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-3">Breakdown</p>
              {chartData.map((item, i) => (
                <div key={i} className="flex justify-between items-center px-2">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-xs font-bold">{item.name}</span>
                  </div>
                  <span className="text-xs font-black bg-secondary px-3 py-1 rounded-full">{item.weight.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground opacity-30">
            <Scale className="w-12 h-12 mb-3" />
            <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Input…</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Quick Mode ─────────────────────────────────────────────────────
function QuickMode({ criteria, onMatrixChange }) {
  const [sliders, setSliders] = useState(() => criteria.map(() => 3)); // default Medium

  useEffect(() => {
    setSliders(criteria.map(() => 3));
  }, [criteria]);

  useEffect(() => {
    onMatrixChange(buildMatrixFromSliders(sliders));
  }, [sliders]);

  const update = (i, v) => setSliders(prev => prev.map((s, idx) => idx === i ? v : s));
  const reset  = () => setSliders(criteria.map(() => 3));

  return (
    <div className="lg:col-span-7 space-y-6">
      {/* Helper */}
      <div className="flex items-center gap-3 p-5 rounded-2xl bg-primary/5 border border-primary/15">
        <Zap className="w-4 h-4 text-primary shrink-0" />
        <p className="text-[11px] font-bold text-primary/80 uppercase tracking-widest">
          Drag each slider to set how important each criterion is to your decision
        </p>
      </div>

      <div className="soft-card p-8 space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black uppercase italic tracking-tight">Set Criterion Importance</h3>
          <button onClick={reset} className="btn-soft-secondary text-xs gap-2">
            <RefreshCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>

        <div className="space-y-7">
          {criteria.map((name, i) => {
            const val = sliders[i] ?? 3;
            const TRACK_COLORS = ["#06b6d4", "#a855f7", "#f59e0b", "#10b981", "#f97316", "#6366f1"];
            const color = TRACK_COLORS[i % TRACK_COLORS.length];
            const pct = ((val - 1) / 4) * 100;

            return (
              <div key={name} className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-black uppercase tracking-tight">{name}</p>
                  <span className="insight-chip text-[9px] font-black px-3 py-1 rounded-full border"
                    style={{ background: `${color}15`, borderColor: `${color}30`, color }}>
                    {SLIDER_LABELS[val - 1]}
                  </span>
                </div>
                <div className="relative flex items-center h-8 group">
                  {/* Track background */}
                  <div className="absolute w-full h-2 rounded-full bg-secondary border border-border overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-200"
                      style={{ width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}60` }} />
                  </div>
                  {/* Tick marks */}
                  <div className="absolute w-full flex justify-between px-0">
                    {[1,2,3,4,5].map(tick => (
                      <div key={tick} className="w-1 h-3 rounded-full"
                        style={{ background: tick <= val ? color : "var(--border)", opacity: 0.6 }} />
                    ))}
                  </div>
                  {/* Range input */}
                  <input
                    type="range" min={1} max={5} step={1} value={val}
                    onChange={e => update(i, Number(e.target.value))}
                    className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                    style={{ margin: 0 }}
                  />
                  {/* Thumb */}
                  <div
                    className="absolute w-5 h-5 rounded-full border-2 border-white shadow-lg transition-all duration-200 pointer-events-none"
                    style={{
                      left: `calc(${pct}% - ${pct * 0.18}px)`,
                      background: color,
                      boxShadow: `0 0 12px ${color}80`,
                    }}
                  />
                </div>
                <div className="flex justify-between px-0.5">
                  {SLIDER_LABELS.map((l, li) => (
                    <span key={l} className="text-[8px] font-bold uppercase tracking-wider transition-all"
                      style={{ color: li + 1 === val ? color : "var(--muted-foreground)", fontWeight: li + 1 === val ? 900 : 700 }}>
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Advanced Mode (Pairwise) ───────────────────────────────────────
function AdvancedMode({ criteria, onMatrixChange }) {
  const [pairs, setPairs] = useState(() => {
    const p = [];
    for (let i = 0; i < criteria.length; i++)
      for (let j = i + 1; j < criteria.length; j++)
        p.push({ id: `${i}-${j}`, i, j, leftName: criteria[i], rightName: criteria[j], preference: "equal", intensity: 1 });
    return p;
  });

  useEffect(() => {
    const matrix = buildMatrixFromPairs(pairs, criteria.length);
    onMatrixChange(matrix);
  }, [pairs]);

  const setPreference = (id, pref) => setPairs(prev => prev.map(p =>
    p.id !== id ? p : { ...p, preference: pref, intensity: pref === "equal" ? 1 : (p.intensity === 1 ? 3 : p.intensity) }
  ));
  const setIntensity  = (id, v)    => setPairs(prev => prev.map(p => p.id !== id ? p : { ...p, intensity: v }));
  const reset         = ()         => setPairs(prev => prev.map(p => ({ ...p, preference: "equal", intensity: 1 })));

  const completed = pairs.filter(p => p.preference !== "equal").length;

  return (
    <div className="lg:col-span-7 space-y-6">
      <div className="flex items-center justify-between bg-card border border-border p-5 rounded-[2rem] shadow-sm">
        <div>
          <h3 className="text-lg font-black uppercase italic tracking-tight">Pairwise Comparisons</h3>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold font-mono mt-1">
            {completed} of {pairs.length} Non-Equal Pairs
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-14 h-14 flex items-center justify-center bg-secondary/50 rounded-full border border-border">
            <svg className="w-full h-full transform -rotate-90 absolute">
              <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeWidth="4" className="text-border opacity-20" />
              <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeWidth="4"
                strokeDasharray={24 * 2 * Math.PI}
                strokeDashoffset={(24 * 2 * Math.PI) - (completed / (pairs.length || 1)) * (24 * 2 * Math.PI)}
                className="text-primary transition-all duration-500" />
            </svg>
            <span className="text-[10px] font-black">{pairs.length ? Math.round(completed / pairs.length * 100) : 0}%</span>
          </div>
          <button onClick={reset} className="btn-soft-secondary text-xs"><RefreshCcw className="w-3.5 h-3.5" /> Reset</button>
        </div>
      </div>

      <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
        {pairs.map((pair, idx) => (
          <motion.div key={pair.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
            className={cn("p-6 rounded-[2rem] border transition-all duration-300",
              pair.preference !== "equal" ? "bg-primary/5 border-primary/20 shadow-sm" : "bg-card border-border shadow-sm hover:border-primary/20"
            )}>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-center mb-4">
              Which is more important?
            </h4>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {[["left", pair.leftName, "bg-primary text-white border-primary shadow-[0_0_20px_rgba(6,182,212,0.4)]"],
                ["right", pair.rightName, "bg-emerald-500 text-white border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]"]
              ].map(([pref, label, activeClass]) => (
                <button key={pref} onClick={() => setPreference(pair.id, pref)}
                  className={cn("flex-1 w-full py-4 px-4 rounded-2xl text-sm font-black uppercase tracking-tight transition-all border-2",
                    pair.preference === pref ? activeClass : "bg-secondary border-transparent text-muted-foreground hover:bg-secondary/80"
                  )}>
                  {label}
                </button>
              ))}
              <button onClick={() => setPreference(pair.id, "equal")}
                className={cn("shrink-0 w-16 h-12 rounded-xl text-[10px] font-black uppercase transition-all",
                  pair.preference === "equal" ? "bg-slate-600 border border-slate-500 text-white" : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                )}>Equal</button>
            </div>

            <AnimatePresence>
              {pair.preference !== "equal" && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="pt-4 border-t border-border/50 flex flex-col items-center gap-3 mt-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                      How much more important is <span className="text-foreground">{pair.preference === "left" ? pair.leftName : pair.rightName}</span>?
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {intensityLevels.map(lvl => (
                        <button key={lvl.value} onClick={() => setIntensity(pair.id, lvl.value)} title={lvl.desc}
                          className={cn("px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                            pair.intensity === lvl.value
                              ? pair.preference === "left" ? "bg-primary text-white scale-105 border border-primary/50" : "bg-emerald-500 text-white scale-105 border border-emerald-400"
                              : "bg-card border border-border text-muted-foreground hover:bg-secondary"
                          )}>
                          {lvl.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────
export default function AHPWeighting() {
  const router = useRouter();
  const [criteria, setCriteria] = useState(defaultCriteria);
  const [mode, setMode]         = useState("quick"); // "quick" | "advanced"
  const [matrix, setMatrix]     = useState([]);
  const [results, setResults]   = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [weightsSaved, setWeightsSaved] = useState(false);

  useEffect(() => {
    const stFeat = localStorage.getItem("dss_live_features");
    if (stFeat) setCriteria(JSON.parse(stFeat));
  }, []);

  // Debounced API call whenever matrix changes
  useEffect(() => {
    if (!matrix.length) return;
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/analyze/ahp`, { matrix });
        setResults(res.data);
        localStorage.setItem("dss_ahp_weights", JSON.stringify(res.data.weights));
        setWeightsSaved(true);
      } catch (e) {
        console.error("AHP failed", e);
      } finally {
        setIsLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [matrix]);

  const topCriterion = useMemo(() => {
    if (!results?.weights || !criteria.length) return null;
    const idx = results.weights.indexOf(Math.max(...results.weights));
    return criteria[idx];
  }, [results, criteria]);

  return (
    <div className="space-y-8 pb-20 selection:bg-primary/20 selection:text-primary">
      {/* Step helper */}
      <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-primary/5 border border-primary/15">
        <Info className="w-4 h-4 text-primary shrink-0" />
        <p className="text-[11px] font-bold text-primary/80 uppercase tracking-widest">
          Step 2 — Set which criteria matter most to your plant location decision
        </p>
      </div>

      {/* Header + mode toggle */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic text-foreground">
            Criteria <span className="text-primary">Weighting</span>
          </h1>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
            Analytic Hierarchy Process · AHP
          </p>
        </div>
        <div className="flex items-center gap-3">
          {weightsSaved && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              className="insight-chip insight-chip-emerald">
              <CheckCircle className="w-3 h-3" /> Weights Saved
            </motion.div>
          )}
          {/* Mode Toggle */}
          <div className="flex bg-secondary p-1 rounded-2xl border border-border gap-1">
            <button onClick={() => setMode("quick")}
              className={cn("flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                mode === "quick" ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-foreground"
              )}>
              <Zap className="w-3.5 h-3.5" /> Quick
            </button>
            <button onClick={() => setMode("advanced")}
              className={cn("flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                mode === "advanced" ? "bg-card text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"
              )}>
              <Settings2 className="w-3.5 h-3.5" /> Advanced
            </button>
          </div>
        </div>
      </header>

      {/* Mode description pill */}
      <AnimatePresence mode="wait">
        <motion.div key={mode} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
          className="flex items-center gap-2">
          {mode === "quick" ? (
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              ⚡ Quick Mode — One slider per criterion. System builds the full comparison matrix automatically.
            </span>
          ) : (
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              ⚙ Advanced Mode — Full pairwise comparisons for maximum precision.
            </span>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <AnimatePresence mode="wait">
          {mode === "quick" ? (
            <motion.div key="quick" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="lg:col-span-7">
              <QuickMode criteria={criteria} onMatrixChange={setMatrix} />
            </motion.div>
          ) : (
            <motion.div key="advanced" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="lg:col-span-7">
              <AdvancedMode criteria={criteria} onMatrixChange={setMatrix} />
            </motion.div>
          )}
        </AnimatePresence>

        <ResultsPanel results={results} criteria={criteria} isLoading={isLoading} />
      </div>

      {/* Next Step CTA */}
      {results && results.cr < 0.1 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-6 p-8 rounded-[2rem] border"
          style={{ background: "linear-gradient(135deg,rgba(6,182,212,.05),rgba(168,85,247,.05))", borderColor: "rgba(6,182,212,.2)" }}>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <p className="text-[10px] font-black text-primary uppercase tracking-widest">Using your selected priorities</p>
            </div>
            <h3 className="text-lg font-black italic uppercase tracking-tight text-foreground">
              {topCriterion ? `${topCriterion} is your top priority — run the ranking` : "Run the ranking analysis"}
            </h3>
            <p className="text-xs text-muted-foreground font-bold mt-1">
              TOPSIS & VIKOR will use these exact weights to rank all candidate sites.
            </p>
          </div>
          <button onClick={() => router.push("/dashboard/analysis")} className="btn-next-step shrink-0">
            Continue to Ranking <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </motion.div>
      )}
    </div>
  );
}
