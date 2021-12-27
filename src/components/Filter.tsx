import Select from "react-select";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { throttledFilter } from "../app/store";

const Filter = () => {
  const dispatch = useDispatch();

  const changeDepartment = (e) => {
    const departments = e.map(({ value }) => value);
    dispatch({ type: "courses/updateDepartments", payload: departments });
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
    <div className="absolute inset-0 p-6 bg-zinc-100 text-zinc-700 drop-shadow-lg">
      <div className="text-lg mb-3">Filter by</div>
      <div className="divide-y text-sm">
        <div className="py-3">
          <div className="font-semibold mb-1">Semester</div>
          <div className="flex flex-col text-sm space-y-1">
            <label>
              <input type="checkbox" className="mr-2" /> Fall 2021
            </label>
            <label>
              <input type="checkbox" className="mr-2" /> Spring 2022
            </label>
          </div>
        </div>

        <div className="py-3">
          <div className="font-semibold mb-1">Course Type</div>
          <div className="flex flex-col text-sm space-y-1">
            <label>
              <input type="checkbox" className="mr-2" /> Mini
            </label>
            <label>
              <input type="checkbox" className="mr-2" /> Non-Mini
            </label>
          </div>
        </div>

        <div className="py-3">
          <div className="font-semibold mb-2">Department</div>
          <Select
            isMulti
            options={DEPARTMENT_OPTIONS}
            onChange={changeDepartment}
          ></Select>
        </div>
      </div>
    </div>
  );
};

export default Filter;
