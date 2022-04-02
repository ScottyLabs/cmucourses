import Select from "react-select";
import React from "react";
import { useAppDispatch } from "../app/hooks";
import { throttledFilter } from "../app/store";
import { userSlice } from "../app/user";

const Filter = () => {
  const dispatch = useAppDispatch();

  const changeDepartment = (e) => {
    const departments = e.map(({ value }) => value);
    dispatch(userSlice.actions.updateDepartments(departments));
    throttledFilter();
  };

  const DEPARTMENTS = [
    "Architecture",
    "Art",
    "Arts & Entertainment Management",
    "BXA Intercollege Degree Programs",
    "Biological Sciences",
    "Biomedical Engineering",
    "Business Administration",
    "CFA Interdisciplinary",
    "CIT Interdisciplinary",
    "Carnegie Mellon University-Wide Studies",
    "Center for the Arts in Society",
    "Chemical Engineering",
    "Civil & Environmental Engineering",
    "Computational Biology",
    "Computer Science",
    "Computer Science and Arts",
    "Design",
    "Dietrich College Information Systems",
    "Dietrich College Interdisciplinary",
    "Drama",
    "Economics",
    "Electrical & Computer Engineering",
    "Engineering & Public Policy",
    "English",
    "Entertainment Technology Pittsburgh",
    "General Dietrich College",
    "Heinz College Wide Courses",
    "History",
    "Human-Computer Interaction",
    "Humanities and Arts",
    "Information & Communication Technology",
    "Information Networking Institute",
    "Information Systems:Sch of IS & Mgt",
    "Institute of Politics and Strategy",
    "Institute for Software Research",
    "Integrated Innovation Institute",
    "Language Technologies Institute",
    "MCS Interdisciplinary",
    "Machine Learning",
    "Materials Science & Engineering",
    "Mathematical Sciences",
    "Mechanical Engineering",
    "Medical Management:Sch of Pub Pol & Mgt",
    "Modern Languages",
    "Music",
    "Naval Science - ROTC",
    "Neuroscience Institute",
    "Philosophy",
    "Physical Education",
    "Physics",
    "Psychology",
    "Public Management:Sch of Pub Pol & Mgt",
    "Public Policy & Mgt:Sch of Pub Pol & Mgt",
    "Robotics",
    "SCS Interdisciplinary",
    "Science and Arts",
    "Social & Decision Sciences",
    "Statistics and Data Science",
    "StuCo (Student Led Courses)",
  ];

  const DEPARTMENT_OPTIONS = DEPARTMENTS.map((name) => ({
    value: name,
    label: name,
  }));

  return (
    <div className="inset-0 p-6 bg-zinc-100 text-zinc-700 drop-shadow-lg md:absolute">
      <div className="mb-3 text-lg">Filter by</div>
      <div className="text-sm divide-y">
        <div className="py-3">
          <div className="mb-1 font-semibold">Semester</div>
          <div className="flex flex-col space-y-1 text-sm">
            <label>
              <input type="checkbox" className="mr-2" /> Fall 2021
            </label>
            <label>
              <input type="checkbox" className="mr-2" /> Spring 2022
            </label>
          </div>
        </div>

        <div className="py-3">
          <div className="mb-1 font-semibold">Course Type</div>
          <div className="flex flex-col space-y-1 text-sm">
            <label>
              <input type="checkbox" className="mr-2" /> Mini
            </label>
            <label>
              <input type="checkbox" className="mr-2" /> Non-Mini
            </label>
          </div>
        </div>

        <div className="py-3">
          <div className="mb-2 font-semibold">Department</div>
          <Select
            isMulti
            options={DEPARTMENT_OPTIONS}
            onChange={changeDepartment} />
        </div>
      </div>
    </div>
  );
};

export default Filter;
