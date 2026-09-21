import { describe, expect, test } from "bun:test";
import { degreeProgress, requirementsForMajor } from "./index";

describe("requirementsForMajor", () => {
  test("returns MISM's requirements", () => {
    const mism = requirementsForMajor("mism");
    expect(mism).not.toBeNull();
    expect(mism!.majorID).toBe("mism");
  });

  test("returns null for a major with no requirement data", () => {
    expect(requirementsForMajor("swe-does-not-exist")).toBeNull();
    expect(requirementsForMajor("aim")).toBeNull(); // a real Heinz major, just not entered yet
  });
});

describe("MISM requirement data", () => {
  const mism = requirementsForMajor("mism")!;

  test("core units sum to exactly 108", () => {
    const sum = mism.core.reduce((total, r) => total + r.units, 0);
    expect(sum).toBe(108);
  });

  test("core + elective units equal the total", () => {
    expect(mism.core.reduce((t, r) => t + r.units, 0) + mism.electiveUnits).toBe(mism.totalUnits);
  });

  test("every requirement has at least one option and a unique id", () => {
    const ids = new Set<string>();
    for (const requirement of mism.core) {
      expect(requirement.options.length).toBeGreaterThan(0);
      expect(ids.has(requirement.id), `duplicate requirement id "${requirement.id}"`).toBe(false);
      ids.add(requirement.id);
    }
  });

  test("the design-elective requirement is a three-way choice", () => {
    const choice = mism.core.find((r) => r.id === "design-elective");
    expect(choice!.options.length).toBe(3);
  });
});

describe("degreeProgress", () => {
  test("returns null for a major with no requirement data", () => {
    expect(degreeProgress("not-a-major", [])).toBeNull();
  });

  test("with no courses taken, everything is UNMET and no units are earned", () => {
    const progress = degreeProgress("mism", [])!;
    expect(progress.requirements.every((r) => r.status === "UNMET")).toBe(true);
    expect(progress.coreUnitsEarned).toBe(0);
    expect(progress.coreUnitsTotal).toBe(108);
    expect(progress.electiveUnitsRequired).toBe(54);
  });

  test("a taken course marks its requirement TAKEN and counts its units", () => {
    const progress = degreeProgress("mism", [{ courseID: "94-700", status: "TAKEN" }])!;
    const orgDesign = progress.requirements.find((r) => r.requirement.id === "org-design")!;
    expect(orgDesign.status).toBe("TAKEN");
    expect(orgDesign.satisfiedBy).toBe("94-700");
    expect(progress.coreUnitsEarned).toBe(6);
  });

  test("an in-progress course marks its requirement IN_PROGRESS but earns no units yet", () => {
    const progress = degreeProgress("mism", [{ courseID: "94-700", status: "IN_PROGRESS" }])!;
    const orgDesign = progress.requirements.find((r) => r.requirement.id === "org-design")!;
    expect(orgDesign.status).toBe("IN_PROGRESS");
    expect(progress.coreUnitsEarned).toBe(0);
  });

  test("a planned course marks its requirement PLANNED but earns no units yet", () => {
    const progress = degreeProgress("mism", [{ courseID: "94-700", status: "PLANNED" }])!;
    const orgDesign = progress.requirements.find((requirement) => requirement.requirement.id === "org-design")!;
    expect(orgDesign.status).toBe("PLANNED");
    expect(progress.coreUnitsEarned).toBe(0);
  });

  test("a choice requirement is satisfied by any one of its options", () => {
    for (const option of ["95-706", "95-874", "94-866"]) {
      const progress = degreeProgress("mism", [{ courseID: option, status: "TAKEN" }])!;
      const choice = progress.requirements.find((r) => r.requirement.id === "design-elective")!;
      expect(choice.status, `option ${option} should satisfy design-elective`).toBe("TAKEN");
      expect(choice.satisfiedBy).toBe(option);
    }
  });

  test("standardizes course ids before matching (95706 == 95-706)", () => {
    const progress = degreeProgress("mism", [{ courseID: "94700", status: "TAKEN" }])!;
    const orgDesign = progress.requirements.find((r) => r.requirement.id === "org-design")!;
    expect(orgDesign.status).toBe("TAKEN");
  });

  test("95-867 (not in the live catalog) still appears as a normal, unmet requirement", () => {
    const progress = degreeProgress("mism", [])!;
    const techStrategy = progress.requirements.find((r) => r.requirement.id === "tech-strategy")!;
    expect(techStrategy.requirement.options).toEqual(["95-867"]);
    expect(techStrategy.status).toBe("UNMET");
  });

  test("courses that satisfy no requirement don't affect core progress", () => {
    const progress = degreeProgress("mism", [{ courseID: "15-122", status: "TAKEN" }])!;
    expect(progress.coreUnitsEarned).toBe(0);
    expect(progress.requirements.every((r) => r.status === "UNMET")).toBe(true);
  });
});
