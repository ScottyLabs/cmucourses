import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { useEffect } from "react";
import { fetchGenedsBySchool } from "~/app/api/geneds";
import { aggregateFCEs, filterFCEs } from "~/app/fce";
import { GenedsDataTable } from "~/components/GenedsDataTable";

const GenedsViewer = () => {
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
    <GenedsDataTable
      data={data}
    />
  );
}

export default GenedsViewer;