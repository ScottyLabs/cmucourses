import { describe, expect, test } from "bun:test";
import { followInputSchema, publishedScheduleSchema, reactionInputSchema } from "./social";

describe("social schemas", () => {
  test("accepts and normalizes a published schedule", () => {
    const result = publishedScheduleSchema.parse({
      name: "Fall plan",
      semester: "fall",
      year: "2026",
      courses: [{ courseID: "15213", lecture: "Lec 1", section: "A" }],
    });
    expect(result.courses[0]?.courseID).toBe("15-213");
  });

  test("rejects invalid reactions and follow targets", () => {
    expect(reactionInputSchema.safeParse({ profileID: "p", reaction: "nope" }).success).toBe(false);
    expect(followInputSchema.safeParse({ profileID: "", follow: true }).success).toBe(false);
  });
});
