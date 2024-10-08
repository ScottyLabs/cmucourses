import { Semester } from "./types";

export const SEMESTERS_COUNTED: Semester[] = ["spring", "summer", "fall"];

export type Department = { name: string; shortName: string; prefix: string };

export const DEPARTMENTS: Department[] = [
  { name: "Architecture", shortName: "Architecture", prefix: "48" },
  { name: "Art", shortName: "Art", prefix: "60" },
  { name: "Arts & Entertainment Management", shortName: "A&EM", prefix: "93" },
  { name: "BXA Intercollege Degree Programs", shortName: "BXA", prefix: "52" },
  { name: "Biological Sciences", shortName: "Biology", prefix: "03" },
  { name: "Biomedical Engineering", shortName: "BME", prefix: "42" },
  { name: "Business Administration", shortName: "Business", prefix: "70" },
  { name: "CFA Interdisciplinary", shortName: "CFA Itd.", prefix: "62" },
  { name: "CIT Interdisciplinary", shortName: "CIT Itd.", prefix: "39" },
  {
    name: "Carnegie Mellon University-Wide Studies",
    shortName: "CMU Studies",
    prefix: "99",
  },
  { name: "Center for the Arts in Society", shortName: "CAS", prefix: "64" },
  { name: "Chemical Engineering", shortName: "ChemE", prefix: "06" },
  {
    name: "Civil & Environmental Engineering",
    shortName: "CEE",
    prefix: "12",
  },
  { name: "Computational Biology", shortName: "CB", prefix: "02" },
  { name: "Computer Science", shortName: "CS", prefix: "15" },
  { name: "Computer Science and Arts", shortName: "CS&A", prefix: "62" },
  { name: "Design", shortName: "Design", prefix: "51" },
  {
    name: "Dietrich College Information Systems",
    shortName: "IS",
    prefix: "67",
  },
  {
    name: "Dietrich College Interdisciplinary",
    shortName: "Dietrich Itd.",
    prefix: "66",
  },
  { name: "Drama", shortName: "Drama", prefix: "54" },
  { name: "Economics", shortName: "Economics", prefix: "73" },
  { name: "Electrical & Computer Engineering", shortName: "ECE", prefix: "18" },
  { name: "Engineering & Public Policy", shortName: "EPP", prefix: "19" },
  { name: "English", shortName: "English", prefix: "76" },
  {
    name: "Entertainment Technology Pittsburgh",
    shortName: "ETC",
    prefix: "53",
  },
  { name: "General Dietrich College", shortName: "Dietrich", prefix: "65" },
  { name: "Heinz College Wide Courses", shortName: "Heinz", prefix: "94" },
  { name: "History", shortName: "History", prefix: "79" },
  { name: "Human-Computer Interaction", shortName: "HCI", prefix: "05" },
  { name: "Humanities and Arts", shortName: "H&A", prefix: "62" },
  {
    name: "Information & Communication Technology",
    shortName: "ICT",
    prefix: "04",
  },
  { name: "Information Networking Institute", shortName: "INI", prefix: "14" },
  {
    name: "Information Systems:Sch of IS & Mgt",
    shortName: "ISM",
    prefix: "95",
  },
  {
    name: "Institute of Politics and Strategy",
    shortName: "IPS",
    prefix: "84",
  },
  { name: "Institute for Software Research", shortName: "ISR", prefix: "17" },
  { name: "Integrated Innovation Institute", shortName: "III", prefix: "49" },
  { name: "Language Technologies Institute", shortName: "LTI", prefix: "11" },
  { name: "MCS Interdisciplinary", shortName: "MCS Itd.", prefix: "38" },
  { name: "Machine Learning", shortName: "ML", prefix: "10" },
  { name: "Materials Science & Engineering", shortName: "MSE", prefix: "27" },
  { name: "Mathematical Sciences", shortName: "Math", prefix: "21" },
  { name: "Mechanical Engineering", shortName: "MechE", prefix: "24" },
  {
    name: "Medical Management:Sch of Pub Pol & Mgt",
    shortName: "Medical Mgmt.",
    prefix: "92",
  },
  { name: "Modern Languages", shortName: "Languages", prefix: "82" },
  { name: "Music", shortName: "Music", prefix: "57" },
  { name: "Naval Science - ROTC", shortName: "ROTC", prefix: "32" },
  { name: "Neuroscience Institute", shortName: "Neuroscience", prefix: "86" },
  { name: "Philosophy", shortName: "Philosophy", prefix: "80" },
  { name: "Physical Education", shortName: "PE", prefix: "69" },
  { name: "Physics", shortName: "Physics", prefix: "33" },
  { name: "Psychology", shortName: "Psychology", prefix: "85" },
  {
    name: "Public Management:Sch of Pub Pol & Mgt",
    shortName: "Public Mgmt.",
    prefix: "91",
  },
  {
    name: "Public Policy & Mgt:Sch of Pub Pol & Mgt",
    shortName: "Public Policy & Mgmt.",
    prefix: "90",
  },
  { name: "Robotics", shortName: "Robotics", prefix: "16" },
  { name: "SCS Interdisciplinary", shortName: "SCS Itd.", prefix: "07" },
  { name: "Science and Arts", shortName: "Sci. & Arts", prefix: "62" },
  { name: "Social & Decision Sciences", shortName: "SDS", prefix: "88" },
  {
    name: "Statistics and Data Science",
    shortName: "Stats",
    prefix: "36",
  },
  { name: "StuCo (Student Led Courses)", shortName: "StuCo", prefix: "98" },
];

export const DEPARTMENT_MAP_NAME: { [name: string]: Department } =
  DEPARTMENTS.reduce(function (map, obj) {
    map[obj.name] = obj;
    return map;
  }, {});

export const DEPARTMENT_MAP_SHORTNAME: { [name: string]: Department } =
  DEPARTMENTS.reduce(function (map, obj) {
    map[obj.shortName] = obj;
    return map;
  }, {});

export const GENED_SCHOOLS = ["SCS"];