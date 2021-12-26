import React, { Component, useMemo } from "react";
import { useDispatch } from "react-redux";
import { TextField, Paper, Typography, InputAdornment, Stack, Box } from "@mui/material";
import { fetchCourseInfos } from "../app/courses";
import { throttledFilter } from "../app/store";
import SearchIcon from "@mui/icons-material/Search";

const SearchBar = () => {
  const dispatch = useDispatch();

  const onChange = (e) => {
    dispatch({ type: "courses/updateSearch", payload: e.target.value });
    throttledFilter();
  };

  return (
    <Paper elevation={2} sx={{ padding: '2em', margin: '0em 0em 2em 0', position: 'sticky', top: '0em' }}>
      <Typography variant="h6">Course Search</Typography>
      <TextField
        variant="outlined"
        margin="dense"
        fullWidth
        placeholder="Search by Course ID, description..."
        inputProps={{ style: { fontSize: "1em" } }}
        onChange={onChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
      <Stack>
        <Box>
          <Typography variant="body2">Applied Filters</Typography>
        </Box>
        <Box>
          <Typography variant="body2">My Courses</Typography>
        </Box>
      </Stack>
    </Paper>
  );
};

export default SearchBar;
