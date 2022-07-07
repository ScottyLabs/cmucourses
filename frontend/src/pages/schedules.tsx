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

const SchedulePage: NextPage = () => {
  const scheduled = useAppSelector(selectCoursesInActiveSchedule);

  return (
    <Page
      activePage={"schedules"}
      content={
        <>
          <Topbar>
            <h1 className="text-lg font-semibold">Schedule Explorer</h1>
            <ScheduleSearch />
            <ScheduleData scheduled={scheduled} />
          </Topbar>
          <CourseList courseIDs={scheduled}>
            <div className="text-gray-500 mt-6 text-center font-semibold">
              Nothing in your schedule yet!
            </div>
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
