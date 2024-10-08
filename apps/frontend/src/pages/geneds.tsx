import type { NextPage } from "next";
import React, {useEffect} from "react";
import { GenedsTable } from "~/components/GenedsTable";
import Aggregate from "~/components/Aggregate";
import {useAppDispatch, useAppSelector} from "~/app/hooks";
import { Page } from "~/components/Page";
import {aggregateFCEs, filterFCEs} from "~/app/fce";
import {fetchGenedsBySchool} from "~/app/api/geneds";

const GenedsPage: NextPage = () => {
  const dispatch = useAppDispatch();
  const loggedIn = useAppSelector((state) => state.user.loggedIn);

  const geneds = useAppSelector((state) => state.cache.geneds);

  useEffect(() => {
    void dispatch(fetchGenedsBySchool("SCS"));
  }, [dispatch, loggedIn]);

  const aggregationOptions = useAppSelector(
    (state) => state.user.fceAggregation
  );

  const data = geneds
    .map(gened => {
      const lastInstructor = gened.fces[0]?.instructor;
      const filtered = filterFCEs(gened.fces, aggregationOptions);
      const aggregated = aggregateFCEs(filtered);
      return {
        ...gened,
        ...aggregated,
        lastInstructor
      };
    });

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
