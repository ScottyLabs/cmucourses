import { standardizeCourseID } from "../schema";
import { MISM_REQUIREMENTS } from "./mism";

export interface Requirement {
  id: string;
  label: string;
  /** Satisfied by any one of these course IDs. More than one option means a choice. */
  options: readonly string[];
  units: number;
}

export interface MajorRequirements {
  majorID: string;
  core: readonly Requirement[];
  /** Units required outside the core list; this module does not track which courses count. */
  electiveUnits: number;
  totalUnits: number;
  /** Where this data comes from, shown in the UI so a stale handbook page can be spotted. */
  source: string;
}

export type RequirementFulfillmentStatus = "TAKEN" | "IN_PROGRESS" | "PLANNED" | "UNMET";

export interface RequirementStatus {
  requirement: Requirement;
  /** The course id that satisfied this requirement, standardized. Null if UNMET. */
  satisfiedBy: string | null;
  status: RequirementFulfillmentStatus;
}

export interface DegreeProgress {
  requirements: RequirementStatus[];
  /** Units from TAKEN requirements only — an IN_PROGRESS requirement does not count yet. */
  coreUnitsEarned: number;
  coreUnitsTotal: number;
  electiveUnitsRequired: number;
}

// Registry of majors with requirement data. MISM is the only one so far — see mism.ts for why
// (the user supplied the handbook data; no other major's requirements have been transcribed).
const REQUIREMENTS_BY_MAJOR: ReadonlyMap<string, MajorRequirements> = new Map([
  [MISM_REQUIREMENTS.majorID, MISM_REQUIREMENTS],
]);

/** Requirement data for a major, or null if none has been entered yet. */
export const requirementsForMajor = (majorID: string): MajorRequirements | null =>
  REQUIREMENTS_BY_MAJOR.get(majorID) ?? null;

export interface TakenCourse {
  courseID: string;
  status: "TAKEN" | "IN_PROGRESS" | "PLANNED";
}

/**
 * Matches the student's taken/in-progress courses against a major's core requirements. A choice
 * requirement (multiple `options`) is satisfied by whichever option the student took; if they
 * took more than one, TAKEN wins over IN_PROGRESS, and the first match otherwise.
 */
export const degreeProgress = (majorID: string, courses: readonly TakenCourse[]): DegreeProgress | null => {
  const major = requirementsForMajor(majorID);
  if (!major) return null;

  const byCourseID = new Map<string, "TAKEN" | "IN_PROGRESS" | "PLANNED">();
  for (const { courseID, status } of courses) {
    const id = standardizeCourseID(courseID);
    const existing = byCourseID.get(id);
    // A course recorded twice (shouldn't happen - profile dedupes - but stay defensive):
    // TAKEN wins over IN_PROGRESS.
    if (!existing || status === "TAKEN" || (status === "IN_PROGRESS" && existing === "PLANNED"))
      byCourseID.set(id, status);
  }

  const requirements: RequirementStatus[] = major.core.map((requirement) => {
    let best: RequirementStatus = { requirement, satisfiedBy: null, status: "UNMET" };
    for (const option of requirement.options) {
      const status = byCourseID.get(option);
      if (status === "TAKEN") {
        best = { requirement, satisfiedBy: option, status: "TAKEN" };
        break; // TAKEN is the best possible status - no need to keep looking
      }
      if (status === "IN_PROGRESS" && best.status === "UNMET") {
        best = { requirement, satisfiedBy: option, status: "IN_PROGRESS" };
      }
      if (status === "PLANNED" && best.status === "UNMET") {
        best = { requirement, satisfiedBy: option, status: "PLANNED" };
      }
    }
    return best;
  });

  const coreUnitsEarned = requirements
    .filter((r) => r.status === "TAKEN")
    .reduce((sum, r) => sum + r.requirement.units, 0);

  return {
    requirements,
    coreUnitsEarned,
    coreUnitsTotal: major.totalUnits - major.electiveUnits,
    electiveUnitsRequired: major.electiveUnits,
  };
};

export { MISM_REQUIREMENTS } from "./mism";
