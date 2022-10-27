import { NextPage } from "next";
import Aggregate from "../components/Aggregate";
import Topbar from "../components/Topbar";
import { useAppSelector } from "../app/hooks";
import ScheduleSelector from "../components/ScheduleSelector";
import CourseList from "../components/CourseList";
import ScheduleSearch from "../components/ScheduleSearch";
import ScheduleData from "../components/ScheduleData";
import { selectCoursesInActiveSchedule } from "../app/userSchedules";
import { Page } from "../components/Page";
import Loading from "../components/Loading";

const SchedulePage: NextPage = () => {
  const scheduled = useAppSelector(selectCoursesInActiveSchedule);

  return (
    <Page
      activePage={"schedules"}
      content={
        <>
          <Topbar>
            <ScheduleSearch />
            <ScheduleData scheduled={scheduled} />
          </Topbar>
          <CourseList courseIDs={scheduled}>
            {/* This are the elements to show when we have no results to show. */}
            {scheduled.length ? ( // We have things in our schedule, but have no results => still loading
              <Loading />
            ) : (
              // We haven't added anything to the schedule yet
              <div className="text-gray-400 mt-6 text-center">
                Nothing in your schedule yet!
              </div>
            )}
          </CourseList>
        </>
      }
      sidebar={
        <>
          <ScheduleSelector />
          <Aggregate />
        </>
      }
    />
  );
};

export default SchedulePage;
