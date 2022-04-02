export interface Time {
  begin: string;
  end: string;
  days: string[];
}

export interface Session {
  year: string;
  semester: "fall" | "spring" | "summer";
  session?: "summer one" | "summer two" | "summer all" | "qatar summer";
}

export interface Course {
  prereqs: string[];
  prereqString: string;
  coreqs: string[];
  crosslisted: string[];
  name: string;
  department: string;
  courseID: string;
  desc: string;
  schedules?: Session[];
  units: string;
  fces?: FCE[];
}

export interface FCE {
  andrewID?: string;
  college: string;
  courseID: string;
  courseName: string;
  department: string;
  hrsPerWeek: number;
  instructor: string;
  level: string;
  numRespondents: number;
  possibleRespondents: number;
  rating: number[];
  responseRate: string;
  semester: string;
  session?: string;
  year: string;
}

export interface AggregateFCEsOptions {
  counted: {
    spring: boolean;
    summer: boolean;
    fall: boolean;
  },
  numSemesters: number;
}