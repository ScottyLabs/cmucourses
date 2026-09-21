import { availabilityFit, parseCatalogTime, type MeetingTime } from "./availability";
import type { BusyBlock, Modality, SchedulePreferences, Workload } from "./schema";
import { CAREER_SKILLS } from "./mapping/careerSkills";
import { courseSkillsIndex, isCareerID } from "./mapping/internal";
import { SkillID } from "./taxonomy/skills";
import { CareerID } from "./taxonomy/careers";

/**
 * Builds up to a few candidate weekly schedules from a fixed list of courses the student
 * picked, choosing one lecture (+ section, if the lecture has any) per course so that no two
 * courses' meeting times conflict, then ranks candidates by availability/workload/career fit.
 * Pure and DOM-free so it can be unit-tested and reused by any client (web, script, etc.).
 */

export interface GenSection {
  name: string;
  times: MeetingTime[];
}

export interface GenLecture extends GenSection {
  sections: GenSection[];
}

export interface CandidateCourse {
  courseID: string;
  /** Parsed from the catalog's `units` string; 0 or NaN excluded from the workload total. */
  units: number;
  lectures: GenLecture[];
}

export interface GeneratorInput {
  courses: CandidateCourse[];
  busyBlocks: BusyBlock[];
  workload: Workload | null;
  /** profile.careers — ordered by priority; the first is weighted highest. */
  careers: readonly string[];
  skillsWant: readonly string[];
  skillsHave: readonly string[];
  preferences: SchedulePreferences;
  preferredModality: Modality | null;
  maxCandidates?: number;
}

export interface SectionPick {
  courseID: string;
  lecture: string;
  section: string | null;
  times: MeetingTime[];
}

export type WorkloadFit = "UNDER" | "IN_RANGE" | "OVER" | "UNKNOWN";

export interface ScheduleCandidate {
  picks: SectionPick[];
  totalUnits: number;
  availability: { status: "FITS" | "CONFLICTS" | "UNKNOWN"; conflicts: string[] };
  workloadFit: WorkloadFit;
  careerScore: number;
  preferenceScore: number;
  totalScore: number;
  reasons: string[];
}

const DEFAULT_MAX_CANDIDATES = 3;
const BEAM_WIDTH = 200;
const DIVERSITY_THRESHOLD = 0.7;

const AVAILABILITY_WEIGHT = 0.35;
const WORKLOAD_WEIGHT = 0.25;
const CAREER_WEIGHT = 0.2;
const PREFERENCE_WEIGHT = 0.2;

const FIT_SCORE: Record<"FITS" | "CONFLICTS" | "UNKNOWN", number> = { FITS: 100, UNKNOWN: 50, CONFLICTS: 0 };

// Same weights as recommendCourses (packages/profile/mapping/index.ts), applied without excluding
// taken courses — the student already chose these courses, so "already taken" doesn't apply.
const CORE_WEIGHT_PRIMARY = 3;
const CORE_WEIGHT_OTHER = 2;
const SUPPORTING_WEIGHT = 1;
const WANT_WEIGHT = 2;
// Scales the raw per-candidate career point total into a 0-100 score. Chosen so one course
// matching a primary career's core skill (3 points) plus a want-list skill (2 points) on a
// single-course schedule lands near the middle of the range, not saturating instantly.
const CAREER_SCALE = 5;

// A course's units range is scored 0 outside [min, max]; WORKLOAD_WIDTH_FLOOR keeps a very
// narrow or single-value range from making the score fall off a cliff, and
// WORKLOAD_DEFAULT_RANGE approximates a missing bound (e.g. only unitsMin set) as "give or take
// 12 units" either side.
const WORKLOAD_WIDTH_FLOOR = 3;
const WORKLOAD_DEFAULT_RANGE = 12;

interface Option {
  lecture: string;
  section: string | null;
  times: MeetingTime[];
}

const optionsFor = (course: CandidateCourse): Option[] => {
  const options: Option[] = [];
  for (const lecture of course.lectures) {
    if (lecture.sections.length === 0) {
      options.push({ lecture: lecture.name, section: null, times: lecture.times });
    } else {
      for (const section of lecture.sections) {
        options.push({ lecture: lecture.name, section: section.name, times: [...lecture.times, ...section.times] });
      }
    }
  }
  return options;
};

const timePairOverlaps = (a: MeetingTime, b: MeetingTime): boolean => {
  if (!a.days.some((day) => b.days.includes(day))) return false;
  const aBegin = parseCatalogTime(a.begin);
  const aEnd = parseCatalogTime(a.end);
  const bBegin = parseCatalogTime(b.begin);
  const bEnd = parseCatalogTime(b.end);
  // An unparseable/TBA time carries no information, so it never conflicts (matches
  // availabilityFit's treatment of TBA as neutral rather than "assume worst case").
  if (aBegin === null || aEnd === null || bBegin === null || bEnd === null) return false;
  return aBegin < bEnd && bBegin < aEnd;
};

const conflictsWithAny = (times: MeetingTime[], used: MeetingTime[]): boolean =>
  times.some((t) => used.some((u) => timePairOverlaps(t, u)));

interface PartialSchedule {
  picks: SectionPick[];
  usedTimes: MeetingTime[];
  unscheduled: string[];
}

/** Cheap heuristic for beam pruning: fewer courses forced into an unscheduled/conflicting pick wins. */
const partialScore = (partial: PartialSchedule): number => -partial.unscheduled.length;

const buildPartials = (courses: CandidateCourse[]): PartialSchedule[] => {
  // Most-constrained-first: fewer options to try first narrows the beam faster.
  const sorted = [...courses].sort((a, b) => optionsFor(a).length - optionsFor(b).length);

  let partials: PartialSchedule[] = [{ picks: [], usedTimes: [], unscheduled: [] }];

  for (const course of sorted) {
    const options = optionsFor(course);
    if (options.length === 0) {
      partials = partials.map((p) => ({ ...p, unscheduled: [...p.unscheduled, course.courseID] }));
      continue;
    }

    let next: PartialSchedule[] = [];
    for (const partial of partials) {
      for (const option of options) {
        if (conflictsWithAny(option.times, partial.usedTimes)) continue;
        next.push({
          picks: [
            ...partial.picks,
            { courseID: course.courseID, lecture: option.lecture, section: option.section, times: option.times },
          ],
          usedTimes: [...partial.usedTimes, ...option.times],
          unscheduled: partial.unscheduled,
        });
      }
    }

    // No complete conflict-free combination exists for the requested courses. Do not silently
    // recommend a schedule with overlapping classes; the UI will ask the student to change the
    // course set instead.
    if (next.length === 0) return [];

    partials =
      next.length > BEAM_WIDTH
        ? [...next].sort((a, b) => partialScore(b) - partialScore(a)).slice(0, BEAM_WIDTH)
        : next;
  }

  return partials;
};

const workloadFitFor = (totalUnits: number, workload: Workload | null): { fit: WorkloadFit; score: number } => {
  const min = workload?.unitsMin ?? null;
  const max = workload?.unitsMax ?? null;
  if (min === null && max === null) return { fit: "UNKNOWN", score: 100 };

  const lo = min ?? 0;
  const hi = max ?? lo + WORKLOAD_DEFAULT_RANGE;
  if (totalUnits >= lo && totalUnits <= hi) return { fit: "IN_RANGE", score: 100 };

  const width = Math.max(hi - lo, WORKLOAD_WIDTH_FLOOR);
  const dist = totalUnits < lo ? lo - totalUnits : totalUnits - hi;
  const score = Math.max(0, 100 - (dist / width) * 100);
  return { fit: totalUnits < lo ? "UNDER" : "OVER", score };
};

const careerScoreFor = (
  courseID: string,
  careers: readonly string[],
  skillsWant: readonly string[],
  skillsHave: readonly string[]
): { raw: number; reasons: string[] } => {
  const skills = courseSkillsIndex[courseID] ?? [];
  const have = new Set(skillsHave);
  const want = new Set(skillsWant);
  const newSkills = skills.filter((skill) => !have.has(skill));
  const [primaryCareer, ...otherCareers] = careers.filter(isCareerID);

  let raw = 0;
  const reasonSkills = new Set<SkillID>();

  const scoreAgainstCareer = (career: CareerID, coreWeight: number) => {
    const { core, supporting } = CAREER_SKILLS[career];
    for (const skill of newSkills) {
      if ((core as readonly SkillID[]).includes(skill)) {
        raw += coreWeight;
        reasonSkills.add(skill);
      } else if ((supporting as readonly SkillID[]).includes(skill)) {
        raw += SUPPORTING_WEIGHT;
        reasonSkills.add(skill);
      }
    }
  };

  if (primaryCareer) scoreAgainstCareer(primaryCareer, CORE_WEIGHT_PRIMARY);
  for (const career of otherCareers) scoreAgainstCareer(career, CORE_WEIGHT_OTHER);
  for (const skill of newSkills) {
    if (want.has(skill)) {
      raw += WANT_WEIGHT;
      reasonSkills.add(skill);
    }
  }

  return { raw, reasons: [...reasonSkills] };
};

const inferredModality = (times: MeetingTime[]): Modality | null => {
  const known = times
    .map((time) => `${time.location ?? ""} ${time.building ?? ""} ${time.room ?? ""}`.trim())
    .filter(Boolean);
  if (known.length === 0) return null;
  const remoteCount = known.filter((value) => /remote|online|zoom/i.test(value)).length;
  if (remoteCount === known.length) return "REMOTE";
  if (remoteCount > 0) return "HYBRID";
  return "IN_PERSON";
};

const preferenceScoreFor = (
  picks: SectionPick[],
  preferences: SchedulePreferences,
  preferredModality: Modality | null
): { score: number; reasons: string[] } => {
  const times = picks.flatMap((pick) => pick.times);
  const hasPreferences =
    preferences.earliestStart !== null ||
    preferences.latestEnd !== null ||
    preferences.preferredDays.length > 0 ||
    preferences.compactDays ||
    preferredModality !== null;
  if (!hasPreferences) return { score: 100, reasons: [] };

  let checks = 0;
  let matches = 0;
  const reasons: string[] = [];
  const meetingDays = new Set<number>();

  for (const time of times) {
    const begin = parseCatalogTime(time.begin);
    const end = parseCatalogTime(time.end);
    for (const day of time.days) meetingDays.add(day);
    if (begin === null || end === null) continue;

    if (preferences.earliestStart !== null) {
      checks += 1;
      if (begin >= preferences.earliestStart) matches += 1;
    }
    if (preferences.latestEnd !== null) {
      checks += 1;
      if (end <= preferences.latestEnd) matches += 1;
    }
    if (preferences.preferredDays.length > 0) {
      checks += time.days.length;
      matches += time.days.filter((day) => preferences.preferredDays.includes(day)).length;
    }
  }

  if (preferences.compactDays && meetingDays.size > 0) {
    checks += 1;
    matches += Math.max(0, 1 - Math.max(0, meetingDays.size - 3) * 0.2);
  }

  if (preferredModality !== null) {
    const modalities = picks
      .map((pick) => inferredModality(pick.times))
      .filter((value): value is Modality => value !== null);
    if (modalities.length > 0) {
      checks += modalities.length;
      matches += modalities.filter((modality) => modality === preferredModality).length;
    }
  }

  const score = checks === 0 ? 100 : (matches / checks) * 100;
  if (score >= 99) reasons.push("Matches your saved time and format preferences");
  else if (score < 60) reasons.push("Some meetings fall outside your saved preferences");
  return { score, reasons };
};

const pickKey = (p: SectionPick): string => `${p.courseID}:${p.lecture}:${p.section ?? ""}`;

const pickSignature = (picks: SectionPick[]): string =>
  [...picks]
    .sort((a, b) => a.courseID.localeCompare(b.courseID))
    .map(pickKey)
    .join("|");

const similarity = (a: SectionPick[], b: SectionPick[]): number => {
  if (a.length === 0 || b.length === 0) return 0;
  const bKeys = new Set(b.map(pickKey));
  const shared = a.filter((p) => bKeys.has(pickKey(p))).length;
  return shared / Math.max(a.length, b.length);
};

const buildCandidate = (
  partial: PartialSchedule,
  { busyBlocks, workload, careers, skillsWant, skillsHave, preferences, preferredModality }: GeneratorInput,
  unitsByCourse: ReadonlyMap<string, number>
): ScheduleCandidate => {
  const conflicts: string[] = [];
  let availabilitySum = 0;
  let careerRaw = 0;
  const reasons: string[] = [];
  let totalUnits = 0;

  for (const pick of partial.picks) {
    const fit = availabilityFit([pick.times], busyBlocks);
    availabilitySum += FIT_SCORE[fit.status];
    if (fit.status === "CONFLICTS") conflicts.push(pick.courseID);

    const units = unitsByCourse.get(pick.courseID) ?? 0;
    if (units > 0 && !Number.isNaN(units)) totalUnits += units;

    const { raw, reasons: skillReasons } = careerScoreFor(pick.courseID, careers, skillsWant, skillsHave);
    careerRaw += raw;
    for (const skill of skillReasons) reasons.push(`Builds ${skill} toward your goals (${pick.courseID})`);
  }

  for (const courseID of partial.unscheduled) {
    reasons.push(`No schedule data for ${courseID}; excluded from this candidate`);
  }

  const count = partial.picks.length || 1;
  const availabilityScore = availabilitySum / count;
  const { fit: workloadFit, score: workloadScore } = workloadFitFor(totalUnits, workload);
  const careerScore = Math.min(100, careerRaw * CAREER_SCALE);
  const { score: preferenceScore, reasons: preferenceReasons } = preferenceScoreFor(
    partial.picks,
    preferences,
    preferredModality
  );
  reasons.push(...preferenceReasons);

  if (conflicts.length > 0) reasons.unshift(`Time conflict: ${conflicts.join(", ")}`);
  if (workloadFit === "OVER") reasons.push(`${totalUnits} units — above your target`);
  else if (workloadFit === "UNDER") reasons.push(`${totalUnits} units — below your target`);
  else if (workloadFit === "IN_RANGE") reasons.push(`${totalUnits} units — within your target range`);

  const totalScore =
    AVAILABILITY_WEIGHT * availabilityScore +
    WORKLOAD_WEIGHT * workloadScore +
    CAREER_WEIGHT * careerScore +
    PREFERENCE_WEIGHT * preferenceScore;

  return {
    picks: partial.picks,
    totalUnits,
    availability: {
      status: conflicts.length > 0 ? "CONFLICTS" : availabilityScore >= 100 ? "FITS" : "UNKNOWN",
      conflicts,
    },
    workloadFit,
    careerScore,
    preferenceScore,
    totalScore,
    reasons,
  };
};

export const generateSchedules = (input: GeneratorInput): ScheduleCandidate[] => {
  if (input.courses.length === 0) return [];

  const unitsByCourse = new Map(input.courses.map((c) => [c.courseID, c.units]));
  const partials = buildPartials(input.courses);

  const seen = new Set<string>();
  const candidates: ScheduleCandidate[] = [];
  for (const partial of partials) {
    const sig = pickSignature(partial.picks);
    if (seen.has(sig)) continue;
    seen.add(sig);
    candidates.push(buildCandidate(partial, input, unitsByCourse));
  }

  candidates.sort(
    (a, b) => b.totalScore - a.totalScore || pickSignature(a.picks).localeCompare(pickSignature(b.picks))
  );

  const maxCandidates = input.maxCandidates ?? DEFAULT_MAX_CANDIDATES;
  const diverse: ScheduleCandidate[] = [];
  for (const candidate of candidates) {
    if (diverse.length >= maxCandidates) break;
    const tooSimilar = diverse.some((chosen) => similarity(chosen.picks, candidate.picks) > DIVERSITY_THRESHOLD);
    if (!tooSimilar) diverse.push(candidate);
  }
  // Not enough sufficiently-different candidates: fill the rest by score alone.
  for (const candidate of candidates) {
    if (diverse.length >= maxCandidates) break;
    if (!diverse.includes(candidate)) diverse.push(candidate);
  }

  return diverse;
};
