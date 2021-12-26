import { Grid, Typography, Stack, Box, Paper } from "@mui/material";
import Link from "next/link";
import {
  compareSessions,
  sessionToShortString,
  displayUnits,
  courseListToString,
  filterSessions,
  injectLinks
} from "../app/utils";

const Course = ({ info }) => {
  console.log(info);
  const sortedSchedules = filterSessions([...info.schedules]).sort(compareSessions);
  const mostRecentSchedules = sortedSchedules.slice(0, 3);
  const schedulesAvailableString = mostRecentSchedules
    .map(sessionToShortString)
    .join(", ");

  return (
    <Paper elevation={1}>
      <Grid container spacing={4} p={5}>
        <Grid item xs={9}>
          <Typography
            variant="h6"
            color="primary"
            sx={{ lineHeight: 1.2, cursor: "pointer" }}
          >
            <Link href={`course/${info.courseID}`}>
              <span>
                <b>{info.courseID}</b>&nbsp;&nbsp; {info.name}
              </span>
            </Link>
          </Typography>
          <Typography sx={{ mb: 1.5 }} color="text.secondary" gutterBottom>
            {info.department}
          </Typography>
          <Typography variant="body1">{injectLinks(info.desc)}</Typography>
        </Grid>
        <Grid item xs={3} color="text.secondary">
          <Typography variant="h6">{displayUnits(info.units)} units</Typography>
          <Typography variant="subtitle1" gutterBottom>
            {schedulesAvailableString}
          </Typography>
          <Stack spacing={1}>
            <div>
              <Typography variant="subtitle1">
                <b>Prerequisites</b>
              </Typography>
              <Typography variant="subtitle1">
                {courseListToString(info.prereqs)}
              </Typography>
            </div>
            <div>
              <Typography variant="subtitle1">
                <b>Corequisites</b>
              </Typography>
              <Typography variant="subtitle1">
                {courseListToString(info.coreqs)}
              </Typography>
            </div>
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default Course;
