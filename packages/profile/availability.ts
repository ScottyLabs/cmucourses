import type { BusyBlock } from "./schema";

/**
 * Bridges the two time encodings in this repo: course meeting times are 12-hour strings
 * ("08:00AM") on the catalog side, while profile busy blocks are integer minutes after
 * midnight. Everything here works in minutes after midnight.
 */

/** A single meeting slot of a lecture, as the catalog stores it. */
export interface MeetingTime {
  days: number[]; // 0 = Sunday, matching BusyBlock.day
  begin: string;
  end: string;
  building?: string | null;
  room?: string | null;
  location?: string | null;
}

export type FitStatus = "FITS" | "CONFLICTS" | "UNKNOWN";

export interface AvailabilityFit {
  status: FitStatus;
  /** The first busy block that clashes, for display. Null unless status is CONFLICTS. */
  conflict: BusyBlock | null;
}

const CATALOG_TIME = /^(\d{2}):(\d{2})(AM|PM)$/;

/**
 * "08:00AM" -> 480, "12:30PM" -> 750, "12:00AM" -> 0.
 * Returns null for "TBA" (about half of all catalog entries) and anything malformed.
 */
export const parseCatalogTime = (time: string): number | null => {
  const match = CATALOG_TIME.exec(time);
  if (!match) return null;

  const hours = parseInt(match[1] as string, 10);
  const minutes = parseInt(match[2] as string, 10);
  if (hours < 1 || hours > 12 || minutes > 59) return null;

  const base = hours === 12 ? 0 : hours;
  return (match[3] === "PM" ? base + 12 : base) * 60 + minutes;
};

/** Half-open overlap, so a class starting exactly when a busy block ends does not clash. */
const overlaps = (begin: number, end: number, block: BusyBlock): boolean => begin < block.end && block.begin < end;

const conflictFor = (time: MeetingTime, busyBlocks: BusyBlock[]): BusyBlock | null => {
  const begin = parseCatalogTime(time.begin);
  const end = parseCatalogTime(time.end);
  if (begin === null || end === null || begin >= end) return null;

  return busyBlocks.find((block) => time.days.includes(block.day) && overlaps(begin, end, block)) ?? null;
};

/**
 * Judges a course against the user's weekly busy times.
 *
 * Each group is one attendable option (see meetingGroupsFor).
 *
 * FITS if at least one lecture is entirely free, CONFLICTS if every lecture with a known
 * time clashes, UNKNOWN if there is nothing to judge (no busy times saved, no lectures, or
 * every meeting time is TBA).
 */
export const availabilityFit = (lectureTimes: MeetingTime[][], busyBlocks: BusyBlock[]): AvailabilityFit => {
  if (busyBlocks.length === 0) return { status: "UNKNOWN", conflict: null };

  let firstConflict: BusyBlock | null = null;
  let sawKnownTime = false;

  for (const times of lectureTimes) {
    const known = times.filter((time) => parseCatalogTime(time.begin) !== null);
    if (known.length === 0) continue; // a fully-TBA lecture tells us nothing either way
    sawKnownTime = true;

    let conflict: BusyBlock | null = null;
    for (const time of known) {
      conflict = conflictFor(time, busyBlocks);
      if (conflict) break;
    }

    if (!conflict) return { status: "FITS", conflict: null };
    firstConflict = firstConflict ?? conflict;
  }

  if (!sawKnownTime) return { status: "UNKNOWN", conflict: null };
  return { status: "CONFLICTS", conflict: firstConflict };
};

interface Meeting {
  times: MeetingTime[];
}

const hasKnownTime = (meeting: Meeting): boolean => meeting.times.some((time) => parseCatalogTime(time.begin) !== null);

/**
 * Picks which meetings to judge a course by.
 *
 * Lectures are preferred - a lecture is the required meeting, whereas sections are
 * recitations a student picks among. But most of the catalog does not record it that way:
 * in the live data only ~17% of courses carry times on their lectures, while ~61% leave
 * lectures empty and put the actual meeting on the sections. So when no lecture states a
 * time, fall back to the sections rather than reporting "unknown" for most of the catalog.
 */
export const meetingGroupsFor = (lectures: Meeting[], sections: Meeting[]): MeetingTime[][] => {
  const source = lectures.some(hasKnownTime) ? lectures : sections;
  return source.map((meeting) => meeting.times);
};
