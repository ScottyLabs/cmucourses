import {
  FormControl,
  FormControlLabel,
  FormLabel,
  FormGroup,
  Checkbox,
  Stack,
  Typography,
  Select,
  MenuItem,
} from "@mui/material";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { throttledFilter } from "../app/store";

const Filter = () => {
  const [departments, setDepartments] = useState([]);
  const dispatch = useDispatch();

  const changeDepartment = (e) => {
    const value = e.target.value;
    const departmentArr = typeof value === "string" ? value.split(",") : value;
    setDepartments(departmentArr);
    dispatch({ type: "courses/updateDepartments", payload: departmentArr });
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
    "StuCo (Student Led Courses)"
  ];

  return (
    <Stack spacing={2} pt={5} pr={5} pl={3}>
      <Typography variant="h6">Filter by</Typography>
      <FormControl>
        <Stack spacing={2}>
          <FormGroup>
            <FormLabel component="label">Available in</FormLabel>
            <FormControlLabel
              control={<Checkbox checked={false} size="small" />}
              label="Fall 2021"
            />
            <FormControlLabel
              control={<Checkbox checked={false} size="small" />}
              label="Spring 2022"
            />
          </FormGroup>

          <FormGroup row>
            <FormControlLabel
              control={<Checkbox checked={true} size="small" />}
              label="Minis"
            />
            <FormControlLabel
              control={<Checkbox checked={true} size="small" />}
              label="Non-Minis"
            />
          </FormGroup>

          <FormGroup>
            <FormLabel component="label">Level</FormLabel>
            <FormControlLabel
              control={<Checkbox checked={false} size="small" />}
              label="Undergrad 100-200"
            />
            <FormControlLabel
              control={<Checkbox checked={false} size="small" />}
              label="Undergrad 300-400"
            />
            <FormControlLabel
              control={<Checkbox checked={false} size="small" />}
              label="Graduate"
            />
          </FormGroup>

          <FormGroup>
            <FormLabel component="label">Department</FormLabel>
            <Select
              multiple
              value={departments}
              size="small"
              onChange={changeDepartment}
            >
              {DEPARTMENTS.map((department) => (
                <MenuItem key={department} value={department}>
                  {department}
                </MenuItem>
              ))}
            </Select>
          </FormGroup>
        </Stack>
      </FormControl>
    </Stack>
  );
};

export default Filter;
