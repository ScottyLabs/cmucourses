import React, { ReactElement } from "react";
import { Box, Grid, Drawer } from "@mui/material";
import CourseList from "./CourseList";
import SearchBar from "./SearchBar";
import Filter from "./Filter";

interface Props {}

const filterWidth = 300;

export default function CourseSearch({}: Props): ReactElement {
  return (
    <Grid container spacing={2} pl={2}>
      <Grid item xs={3} sx={{ backgroundColor: 'white' }}>
        <Filter />
      </Grid>
      <Grid item xs={9}>
        <div
          style={{
            height: "100vh",
            overflowY: "scroll",
            padding: "2em"
          }}
        >
          <SearchBar />
          <CourseList />
        </div>
      </Grid>
    </Grid>
  );
}
