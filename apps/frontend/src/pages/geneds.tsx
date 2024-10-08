import type { NextPage } from "next";
import React, {useEffect} from "react";
import { GenedsTable } from "~/components/GenedsTable";
import Aggregate from "~/components/Aggregate";
import {useAppDispatch, useAppSelector} from "~/app/hooks";
import { Page } from "~/components/Page";
import {aggregateFCEs, filterFCEs} from "~/app/fce";
import {fetchFCEInfosByCourse} from "~/app/api/fce";
import {fetchCourseInfos} from "~/app/api/course";
import {selectCourseResults, selectFCEResultsForCourses} from "~/app/cache";

const geneds = ["07-300", "09-101"];

const GenedsPage: NextPage = () => {
  const dispatch = useAppDispatch();
  const loggedIn = useAppSelector((state) => state.user.loggedIn);

  const fces = useAppSelector(selectFCEResultsForCourses(geneds)).map((x) => x.fces);

  const infos = useAppSelector(selectCourseResults(geneds));

  useEffect(() => {
    void dispatch(fetchCourseInfos(geneds));
    void dispatch(fetchFCEInfosByCourse({ courseIDs: geneds }));
  }, [dispatch, geneds, loggedIn]);

  const aggregationOptions = useAppSelector(
    (state) => state.user.fceAggregation
  );

  const filteredFCEs = fces
    .map(fce => filterFCEs(fce, aggregationOptions))
    .filter(fce => fce.length > 0);

  const data = filteredFCEs.map(filteredFCE => {
    const firstFCE = filteredFCE[0];
    if (firstFCE) {
      const info = infos.find((x) => x && x.courseID === firstFCE.courseID);
      if (info) {
        return {
          courseID: firstFCE.courseID,
          courseName: info.name.toUpperCase(),
          units: info.units,
          instructor: firstFCE.instructor,
          ...aggregateFCEs(filteredFCE)
        }
      }

      return {
        courseID: firstFCE.courseID,
        courseName: firstFCE.courseName,
        units: "-",
        instructor: firstFCE.instructor,
        ...aggregateFCEs(filteredFCE)
      }
    }
  }).filter((x) => x !== undefined);

  return (
    <Page
      activePage="geneds"
      sidebar={<Aggregate />}
      content={
        <GenedsTable
          data={data}
        />
      }
    />
  );
};

export default GenedsPage;
