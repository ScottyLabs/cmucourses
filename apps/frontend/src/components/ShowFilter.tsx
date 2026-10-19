import React, { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { userSlice } from "~/app/user";

const ShowFilter = () => {
  const dispatch = useAppDispatch();
  const showFCEs = useAppSelector((state) => state.user.savedShowFCEs);
  const showCourseInfos = useAppSelector(
    (state) => state.user.savedShowCourseInfos
  );
  const showSchedules = useAppSelector(
    (state) => state.user.savedShowSchedules
  );

  const showAll = useAppSelector((state) => state.user.savedShowAll);

  const showAllRef = useRef<any>(null);
  useEffect(() => {
    if (showAllRef.current) {
      if (showFCEs && showCourseInfos && showSchedules) {
        showAllRef.current.indeterminate = false;
        showAllRef.current.checked = true;
      } else if (!(showFCEs || showCourseInfos || showSchedules)) {
        showAllRef.current.indeterminate = false;
        showAllRef.current.checked = false;
      } else showAllRef.current.indeterminate = true;
    }
  }, [showAllRef, showFCEs, showCourseInfos, showSchedules]);

  const setShowFCEs = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(userSlice.actions.savedShowFCEs(e.target.checked));
  };

  const setShowCourseInfos = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(userSlice.actions.savedShowCourseInfos(e.target.checked));
  };

  const setShowSchedules = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(userSlice.actions.savedShowSchedules(e.target.checked));
  };

  const setShowAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(userSlice.actions.savedShowAll(e.target.checked));
    dispatch(userSlice.actions.savedShowFCEs(e.target.checked));
    dispatch(userSlice.actions.savedShowCourseInfos(e.target.checked));
    dispatch(userSlice.actions.savedShowSchedules(e.target.checked));
  };

  return (
    <div>
      <div className="mb-3 text-lg">Show</div>
      <div className="space-y-4 text-sm">
        <div className="mt-3 grid grid-flow-row-dense grid-cols-2 text-gray-500 text-sm md:flex md:justify-end">
          <div className="mr-2 md:mr-6">
            <input
              id="selectAll"
              type="checkbox"
              className="mr-2"
              onChange={setShowAll}
              checked={showAll}
              ref={showAllRef}
            />
            <span>All</span>
          </div>
          <div className="mr-2 md:mr-6">
            <input
              type="checkbox"
              className="mr-2"
              onChange={setShowFCEs}
              checked={showFCEs}
            />
            <span>FCEs</span>
          </div>
          <div className="mr-2 md:mr-6">
            <input
              type="checkbox"
              className="mr-2"
              onChange={setShowCourseInfos}
              checked={showCourseInfos}
            />
            <span>Course&nbsp;Info</span>
          </div>
          <div className="mr-2 md:mr-6">
            <input
              type="checkbox"
              className="mr-2"
              onChange={setShowSchedules}
              checked={showSchedules}
            />
            <span>Schedules</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowFilter;
