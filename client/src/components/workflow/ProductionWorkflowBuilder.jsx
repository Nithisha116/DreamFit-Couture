import React, { useRef } from "react";
import GarmentPDF from "../GarmentPDF";
import { ArrowDown, ArrowUp, GitBranch, Plus, Trash2 } from "lucide-react";
import {
  AVAILABLE_WORKFLOW_BLOCKS,
  DEFAULT_WORKFLOW_STAGES,
  getStageLabel,
} from "../../workflow/workflowStageUtils";

const PRESETS = [
  {
    id: "standard",
    label: "Standard",
    stages: [
      "cutting",
      "stitching",
      "final_finishing",
      "ironing_packing",
      "trial",
      "alteration",
      "delivered"
    ],
  },
  {
    id: "purchase",
    label: "Purchase",
    stages: [
      "purchase",
      "cutting",
      "stitching",
      "final_finishing",
      "ironing_packing",
      "trial",
      "alteration",
      "delivered"
    ],
  },
  {
    id: "aari",
    label: "Aari",
    stages: [
      "marking",
      "purchase",
      "aari_started",
      "aari_completed",
      "cutting",
      "stitching",
      "final_finishing",
      "ironing_packing",
      "trial",
      "alteration",
      "delivered"
    ],
  },
];

export default function ProductionWorkflowBuilder({ stages, onChange, garment, order, job }) {
  const selected = stages?.length ? stages : [...DEFAULT_WORKFLOW_STAGES];
  const available = AVAILABLE_WORKFLOW_BLOCKS.filter((b) => !selected.includes(b.key));
  
  // Dedicated document printing ref engine setup
  const printEngineRef = useRef(null);

  const addStage = (key) => {
    if (selected.includes(key)) return;
    onChange([...selected, key]);
  };

  const removeStage = (key) => {
    if (selected.length <= 1) return;
    onChange(selected.filter((k) => k !== key));
  };

  const move = (index, direction) => {
    const next = [...selected];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-violet-50/40">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
            <GitBranch className="h-5 w-5 text-violet-700" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">Production Workflow</h2>
            <p className="text-xs text-slate-500 mt-0.5 max-w-lg">
              Define the stage sequence for this order. QR scans and the delivery pipeline
              follow this path exactly.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onChange([...preset.stages])}
              className="text-xs font-bold px-3 py-1.5 rounded-lg border border-violet-200 text-violet-800 bg-white hover:bg-violet-50 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 space-y-5">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-500 mb-2">
            Add stage
          </p>
          <div className="flex flex-wrap gap-2">
            {available.length ? (
              available.map((block) => (
                <button
                  key={block.key}
                  type="button"
                  onClick={() => addStage(block.key)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-violet-300 bg-violet-50/50 px-3 py-2 text-sm font-bold text-violet-800 hover:bg-violet-100 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  {block.label}
                </button>
              ))
            ) : (
              <span className="text-xs text-slate-400">All stages added</span>
            )}
          </div>
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-500 mb-2">
            Selected sequence ({selected.length} stages)
          </p>
          <ol className="space-y-2">
            {selected.map((key, index) => (
              <li
                key={key}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-xs font-black text-white">
                  {index + 1}
                </span>
                <span className="flex-1 font-bold text-slate-800 text-sm">
                  {getStageLabel(key)}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    title="Move up"
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-white hover:text-violet-700 disabled:opacity-30"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    title="Move down"
                    disabled={index === selected.length - 1}
                    onClick={() => move(index, 1)}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-white hover:text-violet-700 disabled:opacity-30"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    title="Remove"
                    disabled={selected.length <= 1}
                    onClick={() => removeStage(key)}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ol>
          <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1">
            <span className="font-mono text-violet-600">
              {selected.join(" → ")}
            </span>
          </p>
        </div>
      </div>

      {/* Hidden 3-page print template tracking pipeline node mapping context definitions */}
      <GarmentPDF 
        ref={printEngineRef} 
        garment={garment} 
        order={order} 
        job={job || { stages: selected }} 
      />
    </div>
  );
}