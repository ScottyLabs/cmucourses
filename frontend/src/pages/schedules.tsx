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

  console.log(scheduled.length);

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
            {scheduled.length ? (
              <Loading />
            ) : (
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
