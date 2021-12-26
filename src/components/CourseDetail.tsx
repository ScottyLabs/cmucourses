import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Typography,
  Grid,
  Stack,
  Tabs,
  Tab,
  Divider,
  List,
} from "@mui/material";
import {
  compareSessions,
  displayUnits,
  sessionToShortString,
  courseListToString,
  filterSessions,
  injectLinks,
  timeArrToString,
} from "../app/utils";

const Lecture = ({ lectureInfo, sections }) => {
  console.log(lectureInfo);
  return (
    <>
      <Grid container>
        <Grid item xs={1}>
          <b>{lectureInfo.name}</b>
        </Grid>
        <Grid item xs={6}>
          {lectureInfo.instructors.join("; ")}
        </Grid>
        <Grid item xs={5}>
          {lectureInfo.times.map((time, id) => (
            <Grid container>
              <Grid item xs={8}>
                {timeArrToString([time])}
              </Grid>
              <Grid item xs={4}>
                {time.building} {time.room}
              </Grid>
            </Grid>
          ))}
        </Grid>
      </Grid>
      {sections.map((section) => (
        <Grid container>
          <Grid item xs={1}>
            <b>{section.name}</b>
          </Grid>
          <Grid item xs={6}>
            {section.instructors.join("; ")}
          </Grid>
          <Grid item xs={5}>
            {section.times.map((time, id) => (
              <Grid container>
                <Grid item xs={8}>
                  {timeArrToString([time])}
                </Grid>
                <Grid item xs={4}>
                  {time.building} {time.room}
                </Grid>
              </Grid>
            ))}
          </Grid>
        </Grid>
      ))}
    </>
  );
};

const Schedule = ({ scheduleInfo }) => {
  console.log(scheduleInfo);

  let scheduleDivs = <></>;

  if (scheduleInfo.lectures.length !== 0) {
    scheduleDivs = scheduleInfo.lectures.map((lecture) => (
      <Lecture
        lectureInfo={lecture}
        sections={scheduleInfo.sections.filter(
          (section) => section.lecture === lecture.name
        )}
      />
    ));
  } else {
    console.log(scheduleInfo.sections);
    scheduleDivs = scheduleInfo.sections.map((section) => (
      <Lecture lectureInfo={section} sections={[]} />
    ));
  }
  return (
    <Stack>
      <Typography variant="h6" pb={2}>
        <b>{sessionToShortString(scheduleInfo)}</b>
      </Typography>
      <Stack spacing={1}>{scheduleDivs}</Stack>
    </Stack>
  );
};

const Schedules = ({ scheduleInfos }) => {
  const [scheduleIdx, setScheduleIdx] = useState(0);
  console.log(scheduleInfos);

  const handleChange = (event, newValue) => {
    setScheduleIdx(newValue);
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: "background.paper", display: "flex" }}>
      <Tabs orientation="vertical" value={scheduleIdx} onChange={handleChange}>
        {scheduleInfos.map((scheduleInfo) => {
          const label = sessionToShortString(scheduleInfo);
          return (
            <Tab
              sx={{ alignItems: "right", minHeight: 0 }}
              label={label}
              key={label}
            />
          );
        })}
      </Tabs>
      <Box pl={3} sx={{ flexGrow: 1 }}>
        <Schedule scheduleInfo={scheduleInfos[scheduleIdx]} />
      </Box>
    </Box>
  );
};

const CourseDetail = ({ courseInfo }) => {
  const sortedSchedules = filterSessions(courseInfo.schedules).sort(
    compareSessions
  );

  console.log(courseInfo);

  return (
    <Box p={3} pt={6}>
      <Stack>
        <Grid container spacing={4} mb={3}>
          <Grid item xs={8}>
            <Typography variant="h5" color="primary">
              <b>{courseInfo.courseID}</b>&nbsp;&nbsp; {courseInfo.name}
            </Typography>
            <Typography variant="h6" sx={{ mb: 1.5 }} color="text.secondary">
              {courseInfo.department}
            </Typography>
            <Typography variant="body1">
              {injectLinks(courseInfo.desc)}
            </Typography>
          </Grid>
          <Grid item xs={3} color="text.secondary">
            <Typography variant="h6">
              {displayUnits(courseInfo.units)} units
            </Typography>
            <Stack spacing={1}>
              <div>
                <Typography variant="subtitle1">
                  <b>Prerequisites</b>
                </Typography>
                <Typography variant="subtitle1">
                  {courseListToString(courseInfo.prereqs)}
                </Typography>
              </div>
              <div>
                <Typography variant="subtitle1">
                  <b>Corequisites</b>
                </Typography>
                <Typography variant="subtitle1">
                  {courseListToString(courseInfo.coreqs)}
                </Typography>
              </div>
            </Stack>
          </Grid>
        </Grid>
        <Divider />
        <Grid spacing={4} mt={2}>
          <Schedules scheduleInfos={sortedSchedules} />
        </Grid>
      </Stack>
    </Box>
  );
};

export default CourseDetail;
