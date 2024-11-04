import React, { useCallback, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { throttledFilter } from "~/app/store";
import { userSlice } from "~/app/user";
import { cacheSlice } from "~/app/cache";
import { filtersSlice } from "~/app/filters";
import { getCourseIDs } from "~/app/utils";

const ShowFilter = () => {
    const dispatch = useAppDispatch();
    const search = useAppSelector((state) => state.filters.search);
  
    const dispatchSearch = useCallback(
      (search: string) => {
        const exactCourses = getCourseIDs(search);
        if (exactCourses)
          dispatch(cacheSlice.actions.setExactResultsCourses(exactCourses));
        else dispatch(cacheSlice.actions.setExactResultsCourses([]));
        throttledFilter();
      },
      [dispatch]
    );
  
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(filtersSlice.actions.updateSearch(e.target.value));
    };
  
    useEffect(() => {
      dispatchSearch(search);
    }, [dispatchSearch, search]);
  
    const loggedIn = useAppSelector((state) => state.user.loggedIn);
    const showFCEs = useAppSelector((state) => state.user.savedShowFCEs);
    const showCourseInfos = useAppSelector((state) => state.user.savedShowCourseInfos);
    const showSchedules = useAppSelector((state) => state.user.savedShowSchedules);
  
    const showAll = useAppSelector((state) => state.user.savedShowAll);
  
    const showAllRef = useRef<any>(null);
    useEffect(() => {
      if (showAllRef.current) {
        if (loggedIn) {
          if (showFCEs && showCourseInfos && showSchedules) {
            showAllRef.current.indeterminate = false;
            showAllRef.current.checked = true;
          } else if (!(showFCEs || showCourseInfos || showSchedules)) {
            showAllRef.current.indeterminate = false;
            showAllRef.current.checked = false;
          } else
            showAllRef.current.indeterminate = true;
        } else {
          if (showCourseInfos && showSchedules) {
            showAllRef.current.indeterminate = false;
            showAllRef.current.checked = true;
          } else if (!(showCourseInfos || showSchedules)) {
            showAllRef.current.indeterminate = false;
            showAllRef.current.checked = false;
          } else
            showAllRef.current.indeterminate = true;
        }
      }
    }, [showAllRef, showAllRef.current, showFCEs, showCourseInfos, showSchedules]);
  
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
      if (loggedIn) dispatch(userSlice.actions.savedShowFCEs(e.target.checked));
      dispatch(userSlice.actions.savedShowCourseInfos(e.target.checked));
      dispatch(userSlice.actions.savedShowSchedules(e.target.checked));
    };

    return (
    <div>
      <div className="mb-3 text-lg">Show</div>
      <div className="space-y-4 text-sm">
      <div className="mt-3 flex justify-end text-gray-500">
          <div className="mr-6">
            <input
              id="selectAll"
              type="checkbox"
              className="mr-2"
              onChange={setShowAll}
              checked={showAll}
              ref = {showAllRef}
            />
            <span>All</span>
          </div>
          <div className="mr-6">
            <input
              type="checkbox"
              className="mr-2"
              disabled={!loggedIn}
              onChange={setShowFCEs}
              checked={showFCEs}
            />
            <span>FCEs</span>
          </div>
          <div className="mr-6">
            <input
              type="checkbox"
              className="mr-2"
              onChange={setShowCourseInfos}
              checked={showCourseInfos}
            />
            <span>Course Info</span>
          </div>
          <div>
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
