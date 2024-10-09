import { NextPage } from "next";
import Aggregate from "~/components/Aggregate";
import Topbar from "~/components/Topbar";
import { useAppSelector } from "~/app/hooks";
import ScheduleSelector from "~/components/ScheduleSelector";
import CourseList from "~/components/CourseList";
import ScheduleSearch from "~/components/ScheduleSearch";
import ScheduleData from "~/components/ScheduleData";
import { selectCoursesInActiveSchedule } from "~/app/userSchedules";
import { Page } from "~/components/Page";
import Loading from "~/components/Loading";
import ScheduleCalendar from "~/components/ScheduleCalendar";
import SectionSelector from "~/components/SectionSelector";
import {CAL_VIEW, SCHED_VIEW} from "~/app/constants";

const SchedulePage: NextPage = () => {
  const scheduled = useAppSelector(selectCoursesInActiveSchedule);
  const scheduleView = useAppSelector((state) => state.user.scheduleView);
  return (
    <Page
      activePage={"schedules"}
      content={
        <>
          <Topbar>
            <ScheduleSearch />
            <ScheduleData scheduled={scheduled} />
          </Topbar>
          {scheduleView === SCHED_VIEW && (
                <CourseList courseIDs={scheduled}>
                  {/* This are the elements to show when we have no results to show. */}
                  {scheduled.length ? ( // We have things in our schedule, but have no results => still loading
                    <Loading />
                  ) : (
                    // We haven't added anything to the schedule yet
                    <div className="mt-6 text-center text-gray-400">
                      Nothing in your schedule yet!
                    </div>
                  )}
                </CourseList>
            )}
          {scheduleView === CAL_VIEW && (<ScheduleCalendar courseIDs={scheduled} />)}
        </>
      }
      sidebar={
        <>
          <ScheduleSelector />
          <Aggregate />
          <SectionSelector courseIDs={scheduled}/>
        </>
      }
    />
  );
};

export default SchedulePage;
