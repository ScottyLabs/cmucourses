import { NextPage } from "next";
import Sidebar from "../components/Sidebar";
import Aggregate from "../components/Aggregate";
import Topbar from "../components/Topbar";
import { useAppSelector } from "../app/hooks";
import ScheduleSelector from "../components/ScheduleSelector";
import CourseList from "../components/CourseList";
import ScheduleSearch from "../components/ScheduleSearch";
import ScheduleData from "../components/ScheduleData";
import { selectCoursesInActiveSchedule } from "../app/userSchedules";

const SchedulePage: NextPage = () => {
  const scheduled = useAppSelector(selectCoursesInActiveSchedule);

  return (
    <div className="font-sans">
      <div className="flex flex-col md:h-screen md:flex-row">
        <div className="relative mt-28 w-full md:mt-16 md:w-72 lg:w-96">
          <Sidebar>
            <ScheduleSelector />
            <Aggregate />
          </Sidebar>
        </div>
        <div className="flex-1 overflow-y-scroll md:h-full md:pt-16">
          <Topbar>
            <h1 className="text-lg font-semibold">Schedule Explorer</h1>
            <ScheduleSearch />
            <ScheduleData scheduled={scheduled} />
          </Topbar>
          <CourseList courseIDs={scheduled}>
            <div className="text-grey-500 text-center font-semibold">
              Nothing in your schedule yet!
            </div>
          </CourseList>
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;
