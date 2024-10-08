import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { useEffect, useState } from "react";
import { fetchGenedsBySchool } from "~/app/api/geneds";
import { aggregateFCEs, filterFCEs } from "~/app/fce";
import { Combobox } from "@headlessui/react";
import { GenedsDataTable } from "~/components/GenedsDataTable";
import { ChevronUpDownIcon } from "@heroicons/react/24/outline";
import { Gened } from "~/app/types";

const schools = ["SCS", "CIT", "MCS", "Dietrich"];

const GenedsViewer = () => {
  const dispatch = useAppDispatch();
  const loggedIn = useAppSelector((state) => state.user.loggedIn);
  const geneds = useAppSelector((state) => state.cache.geneds);
  const aggregationOptions = useAppSelector((state) => state.user.fceAggregation);

  const [selectedSchool, setSelectedSchool] = useState(schools[0]);
  const [data, setData] = useState<Gened[]>([]);

  useEffect(() => {
    if (selectedSchool)
      void dispatch(fetchGenedsBySchool(selectedSchool));
  }, [dispatch, loggedIn, selectedSchool]);

  useEffect(() => {
    if (geneds) {
      setData(geneds.map(gened => {
        const lastInstructor = gened.fces[0]?.instructor;
        const filtered = filterFCEs(gened.fces, aggregationOptions);
        const aggregated = aggregateFCEs(filtered);
        return {
          ...gened,
          ...aggregated,
          lastInstructor
        };
      }));
    }
  }, [geneds]);

  return (
    <div className="mx-4 my-6">
      <div className="my-4 relative">
        <Combobox value={selectedSchool} onChange={setSelectedSchool}>
          <Combobox.Button
            className="relative mt-2 w-full cursor-default rounded border py-1 pl-1 pr-10 text-left transition duration-150 ease-in-out border-gray-200 sm:text-sm sm:leading-5">
        <span className="flex flex-wrap gap-1">
          <span className="p-0.5">{selectedSchool}</span>
        </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <ChevronUpDownIcon className="h-5 w-5 stroke-gray-500 dark:stroke-zinc-400"/>
        </span>
          </Combobox.Button>
          <div className="absolute mt-1 w-full rounded shadow-lg bg-white">
            <Combobox.Options
              className="shadow-xs relative z-50 max-h-60 overflow-auto rounded py-1 text-base leading-6 bg-white focus:outline-none sm:text-sm sm:leading-5">
              {schools.map((school) => (
                <Combobox.Option
                  key={school}
                  value={school}
                  className="relative cursor-pointer select-none py-2 pl-3 pr-9 focus:outline-none "
                >
                  {school}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          </div>
        </Combobox>
      </div>
      {
        data.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-zinc-400">
            Loading...
          </div>
        ) : (
          <GenedsDataTable
            data={data}
          />
        )
      }
    </div>
  );
}

export default GenedsViewer;