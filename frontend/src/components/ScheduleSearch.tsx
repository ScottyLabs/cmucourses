import { useCallback, useEffect, useRef, useState } from "react";
import { useVirtual } from "react-virtual";
import {
  useCombobox,
  UseComboboxGetInputPropsOptions,
  useMultipleSelection,
} from "downshift";
import {
  MagnifyingGlassIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/solid";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import useDeepCompareEffect from "use-deep-compare-effect";
import {
  selectCoursesInActiveSchedule,
  userSchedulesSlice,
} from "../app/userSchedules";
import { fetchAllCourses, fetchCourseInfos } from "../app/api/course";
import { fetchFCEInfosByCourse } from "../app/api/fce";

type selectedItem = {
  courseID: string;
  name: string;
};

const CourseCombobox = ({
  onSelectedItemsChange,
}: {
  onSelectedItemsChange: (items: string[]) => void;
}) => {
  const [inputValue, setInputValue] = useState("");
  const listRef = useRef();
  const dispatch = useAppDispatch();

  const allCourses = useAppSelector((state) => state.cache.allCourses);
  const activeSchedule = useAppSelector(selectCoursesInActiveSchedule);

  useEffect(() => {
    void dispatch(fetchAllCourses());
  }, [dispatch]);

  useDeepCompareEffect(() => {
    setSelectedItems(
      activeSchedule.map((courseID) => ({ courseID, name: "" }))
    );
  }, [activeSchedule]);

  function getCourses() {
    return allCourses.filter(
      (course) =>
        (course.courseID.includes(inputValue) ||
          course.courseID.replaceAll('-', '').includes(inputValue) ||
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
      onSelectedItemsChange(selectedItems.map(({ courseID }) => courseID));
    },
  });

  const filteredCourses = getCourses();
  const rowVirtualizer = useVirtual({
    size: filteredCourses.length,
    parentRef: listRef,
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
    onInputValueChange: ({ inputValue: newValue }) => setInputValue(newValue),
    onHighlightedIndexChange: ({ highlightedIndex }) =>
      rowVirtualizer.scrollToIndex(highlightedIndex),
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
          setInputValue(inputValue);
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
      <div className="relative mt-2 flex flex-col items-baseline space-y-2 md:mt-0 md:flex-row md:space-y-0">
        <div className="flex w-full max-w-full overflow-x-auto md:w-auto md:flex-none">
          {selectedItems.map((selectedItem, index) => (
            <div
              key={`selected-item-${index}`}
              className={`text-blue-800 bg-blue-50 mr-2 whitespace-nowrap rounded px-2 py-1 ${
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
              className="text-gray-500 min-w-0 flex-1 py-2 pl-7 text-xl bg-transparent focus:outline-none"
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
              className="bg-white absolute left-0 right-0 top-full z-50 max-h-96 overflow-y-scroll drop-shadow"
            >
              {isOpen && (
                <>
                  <li
                    key="total-size"
                    style={{ height: rowVirtualizer.totalSize, width: "100%" }}
                  />
                  {rowVirtualizer.virtualItems.map((virtualRow) => {
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
                        <span className="inline-block flex h-full w-full items-center">
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
            void dispatch(fetchFCEInfosByCourse({ courseIDs }));
            void dispatch(fetchCourseInfos(courseIDs));
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
