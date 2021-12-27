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
}