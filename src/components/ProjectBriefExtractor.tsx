"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  AlertCircle, 
  Calendar, 
  DollarSign, 
  Layers, 
  X,
  FileText,
  Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";

export function ProjectBriefExtractor() {
  const [isOpen, setIsOpen] = useState(false);
  const [briefText, setBriefText] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const router = useRouter();

  const sampleBrief = `Hi Priya,

We need a comprehensive redesign of our Fintech SaaS onboarding platform. The project scope includes:
1. User research, heuristic evaluation, and wireframe prototypes (delivered in 3 weeks).
2. Production design tokens, component library, and Figma interactive specs (delivered 3 weeks later).

Our total budget is $6,000 USD, structured as 50% ($3,000) upon wireframe delivery and 50% ($3,000) upon final component handoff. Looking forward to kicking off!

Best,
Alex Rivera, VP Product at Apex Innovations`;

  const handleExtract = async () => {
    if (!briefText.trim()) return;
    setLoading(true);
    setError(null);
    setSavedSuccess(false);

    try {
      const res = await fetch("/api/ai/extract-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief: briefText }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to extract brief.");

      setResult(data.extracted);
    } catch (err: any) {
      setError(err.message || "Extraction error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToDb = async () => {
    if (!briefText.trim()) return;
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/extract-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief: briefText, saveToDb: true }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save project.");

      setSavedSuccess(true);
      router.refresh();
      setTimeout(() => {
        setIsOpen(false);
        setResult(null);
        setSavedSuccess(false);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to save project");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-purple-600/30 transition-all cursor-pointer"
      >
        <Sparkles className="w-3.5 h-3.5 text-purple-200" />
        <span>Extract Brief with Gemini AI</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-900/60 border border-purple-700/60 flex items-center justify-center text-purple-300">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">AI Project Brief Extractor</h3>
                  <p className="text-xs text-slate-400">Gemini 2.5 Flash &bull; Convert client briefs into milestone payment contracts</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Input & Sample Trigger */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-300">Client Brief or Inbound Email</label>
                <button
                  onClick={() => setBriefText(sampleBrief)}
                  className="text-purple-400 hover:text-purple-300 font-medium underline cursor-pointer"
                >
                  Load Sample Inbound Brief
                </button>
              </div>

              <textarea
                value={briefText}
                onChange={(e) => setBriefText(e.target.value)}
                placeholder="Paste client inquiry, scope email, or contract notes here..."
                rows={5}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 font-sans"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {savedSuccess && (
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Project and milestone deliverables successfully saved to Neon PostgreSQL!</span>
              </div>
            )}

            {/* Extracted Preview */}
            {result && (
              <div className="space-y-4 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Structured Extraction ({result.source === "gemini_ai" ? "Gemini 2.5 Flash" : "Rule-Based Engine"})
                  </span>
                  <span className="text-xs font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                    ${(result.totalAmountCents / 100).toLocaleString()} USD
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Project Title</span>
                    <div className="font-bold text-slate-100 text-sm">{result.projectName}</div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Extracted Deliverables</span>
                    <ul className="list-disc list-inside text-slate-300 space-y-0.5 mt-0.5">
                      {result.deliverables.map((d: string, idx: number) => (
                        <li key={idx}>{d}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Payment Milestones</span>
                    <div className="space-y-1.5 mt-1">
                      {result.milestones.map((m: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                          <span className="font-medium text-slate-200">{m.name}</span>
                          <div className="flex items-center gap-3 font-mono">
                            <span className="text-slate-400 text-[11px]">{m.suggestedDueDate}</span>
                            <span className="font-bold text-emerald-400">${(m.amountCents / 100).toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                {!result ? (
                  <button
                    onClick={handleExtract}
                    disabled={loading || !briefText.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Analyzing Brief...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Extract with AI</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleSaveToDb}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving to Database...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Accept & Save to Projects</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

