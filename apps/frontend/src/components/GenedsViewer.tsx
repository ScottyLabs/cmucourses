import { useAppDispatch, useAppSelector } from "~/app/hooks";
import React, { useEffect, useState } from "react";
import { useFetchGenedsBySchool } from "~/app/api/geneds";
import { aggregateFCEs, filterFCEs } from "~/app/fce";
import { Combobox } from "@headlessui/react";
import { GenedsDataTable } from "~/components/GenedsDataTable";
import { ChevronUpDownIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Gened } from "~/app/types";
import { classNames } from "~/app/utils";
import { CheckIcon } from "@heroicons/react/20/solid";
import { SignInButton, useAuth } from "@clerk/nextjs";
import { userSlice } from "~/app/user";
import { GENED_SCHOOLS, GENED_SOURCES } from "~/app/constants";
import Link from "~/components/Link";

const GenedsViewer = () => {
  const dispatch = useAppDispatch();
  const selectedSchool = useAppSelector((state) => state.user.selectedSchool);
  const selectedTags = useAppSelector((state) => state.user.selectedTags);
  const aggregationOptions = useAppSelector((state) => state.user.fceAggregation);
  const { isSignedIn, getToken } = useAuth();
  const { isPending, error, data: geneds } = useFetchGenedsBySchool(selectedSchool, isSignedIn, getToken);

  const [tagQuery, setTagQuery] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [data, setData] = useState<Gened[]>(geneds || []);
  const [searchQuery, setSearchQuery] = useState("");

  const deleteTag = (tagToDelete: string) => {
    dispatch(userSlice.actions.setSelectedTags(selectedTags.filter((tag) => tag !== tagToDelete)));
  };

  const getGenedTable = () => {
    if (isPending) {
      return (
        <div className="py-4 text-center text-gray-500 dark:text-zinc-400">
          Loading...
        </div>
      );
    }

    if (error) {
      console.log(error.message);

      return (
        <div className="py-4 text-center text-gray-500 dark:text-zinc-400">
          Sorry there was an error in displaying this, please refresh!
        </div>
      );
    }

    if (!geneds || geneds.length === 0) {
      return (
        <div className="py-4 text-center text-gray-500 dark:text-zinc-400">
          No geneds found for {selectedSchool}. If you would like to map geneds for your school, please fill in the feedback form in the sidebar!
        </div>
      );
    }

    return (
      <>
        <div className="px-3 pt-2 text-gray-600">
          <b>{data?.length}</b> geneds found
        </div>
        <div className="p-2 mt-4 ml-2 mr-2 overflow-x-auto bg-gray-50 rounded-md">
          <GenedsDataTable
            data={data}
          />
        </div>
      </>
    );
  }

  useEffect(() => {
    if (geneds && geneds.length > 0) {
      let mappedGeneds = geneds.map(gened => {
        const filtered = filterFCEs(gened.fces, aggregationOptions);
        const instructor = filtered[0]?.instructor;
        const aggregated = aggregateFCEs(filtered);
        return {
          ...gened,
          ...aggregated,
          instructor
        };
      })
      if (selectedTags.length > 0) {
        mappedGeneds = mappedGeneds.filter((gened) =>
          selectedTags.some((tag) => gened.tags?.includes(tag))
        );
      }
      if (searchQuery.length > 0) {
        mappedGeneds = mappedGeneds.filter((gened) =>
          gened.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          gened.instructor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          gened.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
          gened.desc?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          gened.courseID?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      setData(mappedGeneds);
      setTags([...new Set(geneds.map(gened => gened.tags).flat().filter((tag) => tag !== undefined))]);
    }
  }, [geneds, selectedTags, searchQuery, aggregationOptions]);

  return (
    <div className="p-3 m-2 bg-white rounded">
      <div className="relative m-2">
        <Combobox value={selectedSchool}
                  onChange={(payload) => {
                    dispatch(userSlice.actions.setSelectedSchool(payload));
                    dispatch(userSlice.actions.setSelectedTags([]));
                    setSearchQuery("");
                  }}>
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
              {GENED_SCHOOLS.map((school) => (
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
        <Combobox value={selectedTags} onChange={(payload) => dispatch(userSlice.actions.setSelectedTags(payload))} multiple>
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
                      dispatch(userSlice.actions.setSelectedTags(selectedTags.concat([tagToAdd])));
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
              {tags.filter((tag) => tag.toLowerCase().includes(tagQuery.toLowerCase())).map((tag) => (
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
        <Combobox value={searchQuery} onChange={(payload) => setSearchQuery(payload)}>
          <Combobox.Label className="flex pt-2">
            Search
          </Combobox.Label>
          <Combobox.Input
            className="relative mt-2 w-full cursor-default rounded border py-1 pl-1 pr-10 text-left transition duration-150 ease-in-out border-gray-200 sm:text-sm sm:leading-5"
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses by ID, description, instructor, name, or tag..."
          />
        </Combobox>
      </div>
      <div className="px-3">
        <span className="text-center text-gray-400">
          Note: this list of geneds for {selectedSchool} is based off the list {" "}
          <Link className="text-blue-600 hover:text-blue-800"
            href={GENED_SOURCES[selectedSchool as keyof typeof GENED_SOURCES]}>
            here
          </Link>.
          If there is anything missing, or if you would like a similar list for your school, do fill in the feedback
          form in the sidebar!
        </span>
      </div>
      {
        !isSignedIn && (
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
      {getGenedTable()}
    </div>
  );
}

export default GenedsViewer;