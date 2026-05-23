import { 
  PIPELINE_STAGE_DEFS,
  DEFAULT_WORKFLOW_STAGES,
  normalizeStageKey,
  normalizeWorkflowStages,
  getStageLabelFromDef
} from "./workflowConstants";

/** Selectable blocks for order workflow builder */
export const AVAILABLE_WORKFLOW_BLOCKS = [
  { key: "cutting", label: "Cutting" },
  { key: "stitching", label: "Stitching" },
  { key: "ironing", label: "Ironing" },
  { key: "packed", label: "Packed" },
  { key: "embroidery", label: "Embroidery" },
  { key: "aari", label: "Aari Work" },
];

// Re-exporting if other parts of your app imported it from here previously
export { DEFAULT_WORKFLOW_STAGES, normalizeStageKey, normalizeWorkflowStages };

export function getStageLabel(key, workflowStages) {
  return getStageLabelFromDef(normalizeStageKey(key), workflowStages);
}

export function isValidWorkflowStages(stages) {
  return normalizeWorkflowStages(stages).length > 0;
}