import { useAppDispatch, useAppSelector } from "~/app/hooks";
import React, { useEffect, useState } from "react";
import { fetchGenedsBySchool } from "~/app/api/geneds";
import { aggregateFCEs, filterFCEs } from "~/app/fce";
import { Combobox } from "@headlessui/react";
import { GenedsDataTable } from "~/components/GenedsDataTable";
import { ChevronUpDownIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Gened } from "~/app/types";
import { classNames } from "~/app/utils";
import {CheckIcon} from "@heroicons/react/20/solid";
import {SignInButton} from "@clerk/nextjs";

const schools = ["SCS", "CIT", "MCS", "Dietrich"];

const GenedsViewer = () => {
  const dispatch = useAppDispatch();
  const loggedIn = useAppSelector((state) => state.user.loggedIn);
  const geneds = useAppSelector((state) => state.cache.geneds);
  const aggregationOptions = useAppSelector((state) => state.user.fceAggregation);

  const [tagQuery, setTagQuery] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [selectedSchool, setSelectedSchool] = useState(schools[0]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [data, setData] = useState<Gened[]>([]);

  const deleteTag = (tagToDelete: string) => {
    setSelectedTags(selectedTags.filter((tag) => tag !== tagToDelete));
  };

  useEffect(() => {
    if (selectedSchool)
      void dispatch(fetchGenedsBySchool(selectedSchool));
  }, [dispatch, loggedIn, selectedSchool]);

  useEffect(() => {
    if (geneds && geneds.map) {
      let mappedGeneds = geneds.map(gened => {
        const lastInstructor = gened.fces[0]?.instructor;
        const filtered = filterFCEs(gened.fces, aggregationOptions);
        const aggregated = aggregateFCEs(filtered);
        return {
          ...gened,
          ...aggregated,
          lastInstructor
        };
      })
      if (selectedTags.length > 0) {
        mappedGeneds = mappedGeneds.filter((gened) =>
          selectedTags.every((tag) => gened.tags?.includes(tag))
        );
      }
      setData(mappedGeneds);
      setTags([...new Set(geneds.map(gened => gened.tags).flat().filter((tag) => tag !== undefined))]);
    }
  }, [geneds, geneds.map, selectedTags]);

  return (
    <div className="px-3 mx-2 py-2 my-4 bg-white rounded">
      <div className="relative">
        <Combobox value={selectedSchool} onChange={setSelectedSchool}>
          <Combobox.Label className="flex">
            School
          </Combobox.Label>
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
        <Combobox value={selectedTags} onChange={setSelectedTags} multiple>
          <Combobox.Label className="flex pt-2">
            Tags
          </Combobox.Label>

          <Combobox.Button
            className="relative mt-2 w-full cursor-default rounded border py-1 pl-1 pr-10 text-left transition duration-150 ease-in-out border-gray-200 sm:text-sm sm:leading-5">
            <span className="flex flex-wrap gap-1">
              {selectedTags.length === 0
                ? selectedTags.length === 0 && <span className="p-0.5">None</span>
                : selectedTags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 rounded px-2 py-0.5 text-blue-800 bg-blue-50"
                  >
                      <span>{tag}</span>
                      <XMarkIcon
                        className="h-3 w-3 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          deleteTag(tag);
                        }}
                      />
                    </span>
                ))
              }
              <Combobox.Input
                className="shadow-xs flex rounded py-0.5 text-base leading-6 bg-white focus:outline-none sm:text-sm sm:leading-5"
                onChange={(e) => setTagQuery(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent) => {
                  if (
                    e.key === "Backspace" &&
                    tagQuery.length === 0 &&
                    selectedTags.length > 0
                  ) {
                    deleteTag(selectedTags[selectedTags.length - 1] || "");
                  } else if (e.key === "Tab") {
                    const tagToAdd =
                      tags.filter((tag) => tag.includes(tagQuery))[0];
                    if (tagToAdd && !selectedTags.includes(tagToAdd)) {
                      setSelectedTags(selectedTags.concat([tagToAdd]));
                    }
                  }
                }}
                onKeyUp={(e: React.KeyboardEvent) => {
                  if (e.key === " ") {
                    e.preventDefault();
                  }
                }}
              />
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon className="h-5 w-5 stroke-gray-500 dark:stroke-zinc-400"/>
            </span>
          </Combobox.Button>

          <div className="absolute mt-1 w-full rounded shadow-lg bg-white">
            <Combobox.Options
              className="shadow-xs relative z-50 max-h-60 overflow-auto rounded py-1 text-base leading-6 bg-white focus:outline-none sm:text-sm sm:leading-5">
              {tags.map((tag) => (
                <Combobox.Option
                  key={tag}
                  value={tag}
                  className="relative cursor-pointer select-none py-2 pl-3 pr-9 focus:outline-none "
                >
                  {({selected}) => (
                    <>
                    <span className={"block truncate"}>
                      <span
                        className={classNames(
                          "ml-1 text-gray-700",
                          selected ? "font-semibold" : "font-normal"
                        )}
                      >
                        {tag}
                      </span>
                    </span>
                      {selected && (
                        <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                        <CheckIcon className="h-5 w-5"/>
                      </span>
                      )}
                    </>
                  )}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          </div>
        </Combobox>
      </div>
      {
        !loggedIn && (
          <div className="flex justify-center">
            <button
              className="px-4 py-2 mt-4 text-sm font-medium text-white bg-gray-500 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <SignInButton>
                Sign in to see FCE data
              </SignInButton>
            </button>
          </div>
        )
      }
      {
        data.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-zinc-400">
            Loading...
          </div>
        ) : (
          <div className="pt-4">
            <GenedsDataTable
              data={data}
            />
          </div>
        )
      }
    </div>
  );
}

export default GenedsViewer;