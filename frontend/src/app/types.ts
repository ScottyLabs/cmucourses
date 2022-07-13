export type Semester = "fall" | "spring" | "summer";
export type SummerSession =
  | "summer one"
  | "summer two"
  | "summer all"
  | "qatar summer";

export interface Time {
  begin: string;
  end: string;
  days: number[];
}

export interface Session {
  year: string;
  semester: Semester;
  session?: SummerSession;
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
  schedules?: Schedule[];
  units: string;
  fces?: FCE[];
}

interface Lesson {
  instructors: string[];
  name: string;
  location: string;
  times: {
    days: number[];
    begin: string;
    end: string;
    building: string;
    room: string;
  }[];
}

export type Lecture = Lesson;

export interface Section extends Lesson {
  lecture: string;
}

export interface Schedule extends Session {
  courseID: string;
  lectures: Lecture[];
  sections: Section[];
}

export interface FCE extends Session {
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
}
