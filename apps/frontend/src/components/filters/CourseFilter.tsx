import React, { useEffect, useState } from "react";
import { ChevronUpDownIcon } from "@heroicons/react/24/outline";
import { CheckIcon } from "@heroicons/react/20/solid";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { Combobox } from "@headlessui/react";
import { classNames, getUnique } from "~/app/utils";
import { userSlice } from "~/app/user";
import { useFetchFCEInfosByInstructor } from "~/app/api/fce";
import { useAuth } from "@clerk/nextjs";

type Props = {
  name: string;
};

const CourseFilter = ({ name }: Props) => {
  const dispatch = useAppDispatch();

  const [query, setQuery] = useState("");

  const filteredCourses = useAppSelector(
    (state) => state.user.fceAggregation.filters.courses
  );

  const { isSignedIn, getToken } = useAuth();
  const { data: fces } = useFetchFCEInfosByInstructor(
    name,
    isSignedIn,
    getToken
  );
  const courses = getUnique(
    fces?.fces?.map((fce) => fce.courseID).sort() || []
  );

  useEffect(() => {
    dispatch(
      userSlice.actions.setFilters({
        type: "courses",
        courses: getUnique(fces?.fces?.map((fce) => fce.courseID).sort() || []),
        instructors: [],
      })
    );
  }, [fces, dispatch]);

  const setCourses = (courses: string[]) => {
    dispatch(
      userSlice.actions.setFilters({
        type: "courses",
        courses: courses,
        instructors: [],
      })
    );
  };

  const searchCourses = (course: string) => {
    const searchTerm = query.toLowerCase();
    return course.toLowerCase().includes(searchTerm);
  };

  const noSelectAll = () => {
    return filteredCourses?.filter((x) => x !== "SELECT ALL");
  };

  const toggleAllCourses = () => {
    if (noSelectAll().length >= courses?.length) {
      setCourses([]);
    } else {
      setCourses(courses);
    }
  };

  return (
    <div className="relative mt-1">
      <Combobox value={filteredCourses} onChange={setCourses} multiple>
        <div className="text-lg">Courses</div>
        <Combobox.Button className="relative mt-2 w-full cursor-default rounded border py-1 pl-1 pr-10 text-left transition duration-150 ease-in-out border-gray-200 sm:text-sm sm:leading-5">
          <span className="flex flex-wrap gap-1">
            <span className="flex items-center gap-1 rounded px-2 py-0.5 text-blue-800 bg-blue-50">
              {noSelectAll().length} selected
            </span>
            <Combobox.Input
              className="shadow-xs flex rounded py-0.5 text-base leading-6 bg-white focus:outline-none sm:text-sm sm:leading-5"
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === " ") {
                  setQuery(query + " science");
                } else if (e.key === "Tab") {
                  const course = courses?.filter(searchCourses)[0];
                  if (!filteredCourses.includes(course)) {
                    setCourses(filteredCourses.concat([course]));
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
            <ChevronUpDownIcon className="h-5 w-5 stroke-gray-500 " />
          </span>
        </Combobox.Button>
        <div className="absolute mt-1 w-full rounded shadow-lg bg-white">
          <Combobox.Options className="shadow-xs relative z-50 max-h-60 overflow-auto rounded py-1 text-base leading-6 bg-white focus:outline-none sm:text-sm sm:leading-5">
            <span onClick={toggleAllCourses}>
              <Combobox.Option
                value={"SELECT ALL"}
                className="relative cursor-pointer select-none py-2 pl-3 pr-9 focus:outline-none"
                disabled={true}
              >
                <span className={"block truncate"}>
                  <span
                    className={classNames(
                      "ml-1 text-gray-700",
                      noSelectAll().length === courses?.length
                        ? "font-semibold"
                        : "font-normal"
                    )}
                  >
                    SELECT ALL
                  </span>
                </span>
                {noSelectAll().length === courses?.length && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <CheckIcon className="h-5 w-5" />
                  </span>
                )}
              </Combobox.Option>
            </span>
            {courses?.filter(searchCourses).map((name) => (
              <Combobox.Option
                key={name}
                value={name}
                className="relative cursor-pointer select-none py-2 pl-3 pr-9 focus:outline-none "
              >
                {({ selected }) => (
                  <>
                    <span className={"block truncate"}>
                      <span
                        className={classNames(
                          "ml-1 text-gray-700",
                          selected ? "font-semibold" : "font-normal"
                        )}
                      >
                        {name}
                      </span>
                    </span>
                    {selected && (
                      <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                        <CheckIcon className="h-5 w-5" />
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
  );
};

export default CourseFilter;
