import { useCallback, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  useCombobox,
  UseComboboxGetInputPropsOptions,
  useMultipleSelection,
} from "downshift";
import {
  MagnifyingGlassIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/solid";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import useDeepCompareEffect from "use-deep-compare-effect";
import {
  selectCoursesInActiveSchedule,
  userSchedulesSlice,
} from "~/app/userSchedules";
import { useFetchAllCourses } from "~/app/api/course";

type selectedItem = {
  courseID: string;
  name: string;
};

const unhyphenatedCourseCodeRegex = /^(\d{2})(\d{1,3})/g;

const CourseCombobox = ({
  onSelectedItemsChange,
}: {
  onSelectedItemsChange: (items: string[]) => void;
}) => {
  const [inputValue, setInputValue] = useState("");
  const listRef = useRef(null);
  const dispatch = useAppDispatch();

  const { data: allCourses } = useFetchAllCourses();
  const activeSchedule = useAppSelector(selectCoursesInActiveSchedule);

  useDeepCompareEffect(() => {
    setSelectedItems(
      activeSchedule.map((courseID) => ({ courseID, name: "" }))
    );
  }, [activeSchedule]);

  function getCourses() {
    // hyphenates 3 to 5 digit numbers, e.g. 152 -> 15-2, 1521 -> 15-21, 15213 -> 15-213
    // otherwise, input value remains the same
    const hyphenated = inputValue.replace(unhyphenatedCourseCodeRegex, "$1-$2");
    if (!allCourses) return [];
    return allCourses.filter(
      (course) =>
        (course.courseID.includes(hyphenated) ||
          course.name.toLowerCase().includes(inputValue)) &&
        selectedItems.map(({ courseID }) => courseID).indexOf(course.courseID) <
          0
    );
  }

  const {
    getSelectedItemProps,
    getDropdownProps,
    addSelectedItem,
    removeSelectedItem,
    setSelectedItems,
    activeIndex,
    selectedItems,
  } = useMultipleSelection<selectedItem>({
    onSelectedItemsChange: ({ selectedItems }) => {
      onSelectedItemsChange(
        selectedItems?.map(({ courseID }) => courseID) || []
      );
    },
  });

  const filteredCourses = getCourses();
  const rowVirtualizer = useVirtualizer({
    count: filteredCourses.length,
    getScrollElement: () => listRef.current || null,
    estimateSize: useCallback(() => 40, []),
  });

  const {
    getInputProps,
    getItemProps,
    getLabelProps,
    getMenuProps,
    highlightedIndex,
    selectedItem,
    getComboboxProps,
    isOpen,
  } = useCombobox<selectedItem>({
    items: filteredCourses,
    itemToString: (item) => {
      if (!item) return "";
      return `${item.courseID}`;
    },
    selectedItem: null,
    inputValue,
    defaultHighlightedIndex: 0,
    onInputValueChange: ({ inputValue: newValue }) =>
      setInputValue(newValue || ""),
    onHighlightedIndexChange: ({ highlightedIndex }) =>
      rowVirtualizer.scrollToIndex(highlightedIndex || 0),
    stateReducer: (state, actionAndChanges) => {
      const { changes, type } = actionAndChanges;
      switch (type) {
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
          return {
            ...changes,
            isOpen: false,
          };
      }
      return changes;
    },
    onStateChange: ({ inputValue, type, selectedItem }) => {
      switch (type) {
        case useCombobox.stateChangeTypes.InputChange:
          setInputValue(inputValue || "");
          break;
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
          if (selectedItem) {
            setInputValue("");
            addSelectedItem(selectedItem);
            dispatch(
              userSchedulesSlice.actions.addCourseToActiveSchedule(
                selectedItem.courseID
              )
            );
          }
          break;
        default:
          break;
      }
    },
  });

  return (
    <div>
      <div>
        <label {...getLabelProps()} />
      </div>
      <div className="relative flex items-baseline mt-0 flex-row flex-wrap space-y-0">
        <div className="flex max-w-full overflow-x-auto w-auto flex-none">
          {selectedItems.map((selectedItem, index) => (
            <div
              key={`selected-item-${index}`}
              className={`mr-2 whitespace-nowrap rounded px-2 py-1 text-blue-800 bg-blue-50 ${
                activeIndex === index ? "border-blue-800" : "border-blue-50"
              } border-2`}
              {...getSelectedItemProps({ selectedItem, index })}
            >
              {selectedItem.courseID}
              <span
                className="ml-2 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  removeSelectedItem(selectedItem);
                  dispatch(
                    userSchedulesSlice.actions.removeCourseFromActiveSchedule(
                      selectedItem.courseID
                    )
                  );
                }}
              >
                &#10005;
              </span>
            </div>
          ))}
        </div>
        <div {...getComboboxProps()} className="w-full flex-1">
          <div className="relative flex w-full border-b border-b-gray-300">
            <span className="absolute inset-y-0 left-0 flex items-center">
              <MagnifyingGlassIcon className="h-5 w-5" />
            </span>
            <input
              className="min-w-0 flex-1 py-2 pl-7 text-xl bg-transparent text-gray-500 focus:outline-none"
              type="search"
              {...getInputProps(
                getDropdownProps({
                  preventKeyAction: isOpen,
                }) as UseComboboxGetInputPropsOptions
              )}
              placeholder="Add a Course by Course ID/Name"
            />
            <ul
              {...getMenuProps({
                ref: listRef,
              })}
              className="absolute left-0 right-0 top-full z-50 max-h-96 overflow-y-scroll drop-shadow bg-white"
            >
              {isOpen && (
                <>
                  <li
                    key="total-size"
                    style={{
                      height: rowVirtualizer.getTotalSize(),
                      width: "100%",
                    }}
                  />
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const course = filteredCourses[virtualRow.index];
                    return (
                      <li
                        key={course.courseID}
                        className={
                          (highlightedIndex === virtualRow.index
                            ? "bg-gray-100"
                            : "") + " cursor-pointer pl-7"
                        }
                        {...getItemProps({
                          index: virtualRow.index,
                          item: course,
                          style: {
                            fontWeight:
                              selectedItem &&
                              selectedItem.courseID === course.courseID
                                ? "bold"
                                : "normal",
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: virtualRow.size,
                            transform: `translateY(${virtualRow.start}px)`,
                          },
                        })}
                      >
                        <span className="flex h-full w-full items-center">
                          <span className="inline-block w-16 flex-none font-semibold">
                            {course.courseID}
                          </span>
                          <span className="ml-2 inline-block min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                            {course.name}
                          </span>
                        </span>
                      </li>
                    );
                  })}
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const ScheduleSearch = () => {
  const dispatch = useAppDispatch();
  const savedSchedules = useAppSelector((state) => state.schedules.saved);
  const active = useAppSelector((state) => state.schedules.active);

  return (
    <div className="mb-6">
      <div className="flex flex-col gap-y-2">
        {active !== null && (
          <div className="flex items-center">
            <PencilSquareIcon className="mr-2 h-4 w-4" />
            <input
              className="bg-white"
              value={savedSchedules[active].name}
              onChange={(e) =>
                dispatch(
                  userSchedulesSlice.actions.updateActiveScheduleName(
                    e.target.value
                  )
                )
              }
              placeholder="Schedule Name"
            />
          </div>
        )}

        <CourseCombobox
          onSelectedItemsChange={(courseIDs) => {
            dispatch(
              userSchedulesSlice.actions.setActiveScheduleCourses(courseIDs)
            );
          }}
        />
      </div>
    </div>
  );
};

export default ScheduleSearch;
