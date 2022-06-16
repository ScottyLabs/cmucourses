import { useCallback, useEffect, useRef, useState } from "react";
import { useVirtual } from "react-virtual";
import { useCombobox, useMultipleSelection } from "downshift";
import { PencilAltIcon, SearchIcon } from "@heroicons/react/solid";
import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "../../tailwind.config.js";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { userSlice } from "../app/user";
import {
  fetchAllCourses,
  fetchCourseInfos,
  fetchFCEInfos,
} from "../app/courses";

const fullConfig = resolveConfig(tailwindConfig);

const CourseCombobox = ({ onSelectedItemsChange }) => {
  const [inputValue, setInputValue] = useState("");
  const listRef = useRef();
  const dispatch = useAppDispatch();

  const allCourses = useAppSelector((state) => state.courses.allCourses);

  useEffect(() => {
    dispatch(fetchAllCourses());
  }, []);

  function getCourses() {
    return allCourses.filter(
      (course) =>
        (course.courseID.includes(inputValue) ||
          course.name.toLowerCase().includes(inputValue)) &&
        selectedItems.map(({ courseID }) => courseID).indexOf(course.courseID) <
          0
    );
  }

  const scheduled = useAppSelector((state) => state.user.schedules.current);
  useEffect(() => {
    setSelectedItems(scheduled.map((courseID) => ({ courseID, name: "" })));
  }, [scheduled.join(" ")]);

  const {
    getSelectedItemProps,
    getDropdownProps,
    addSelectedItem,
    removeSelectedItem,
    setSelectedItems,
    activeIndex,
    selectedItems,
  } = useMultipleSelection({
    initialSelectedItems: [],
    onSelectedItemsChange,
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
  } = useCombobox({
    items: filteredCourses,
    itemToString: (item) => {
      if (!item) return "";
      return `${item.courseID}`;
    },
    selectedItem: null,
    inputValue,
    defaultHighlightedIndex: 0,
    onInputValueChange: ({ inputValue: newValue }) => setInputValue(newValue),
    scrollIntoView: () => {},
    onHighlightedIndexChange: ({ highlightedIndex }) =>
      rowVirtualizer.scrollToIndex(highlightedIndex),
    stateReducer: (state, actionAndChanges) => {
      const { changes, type } = actionAndChanges;
      switch (type) {
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
          return {
            ...changes,
            isOpen: true, // keep the menu open after selection.
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
              userSlice.actions.addToCurrentSchedule(selectedItem.courseID)
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
      <div className="mt-2 flex flex-col items-baseline space-y-2 md:mt-0 md:flex-row md:space-y-0">
        <div className="flex">
          {selectedItems.map((selectedItem, index) => (
            <div
              key={`selected-item-${index}`}
              className={`text-blue-800 bg-blue-50 mr-2 rounded-md px-2 py-1 ${
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
        <div {...getComboboxProps()} className="flex-1">
          <div className="border-b-grey-300 relative flex w-full border-b">
            <span className="absolute inset-y-0 left-0 flex items-center">
              <SearchIcon className="h-5 w-5" />
            </span>
            <input
              className="text-gray-500 min-w-0 flex-1 py-2 pl-7 text-xl bg-transparent focus:outline-none"
              type="search"
              {...getInputProps(getDropdownProps({ preventKeyAction: isOpen }))}
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
                    style={{ height: rowVirtualizer.totalSize }}
                  />
                  {rowVirtualizer.virtualItems.map((virtualRow) => {
                    const course = filteredCourses[virtualRow.index];
                    return (
                      <li
                        key={course.courseID}
                        className={
                          (highlightedIndex === virtualRow.index
                            ? "bg-gray-100"
                            : "") + " table pl-7 hover:cursor-pointer"
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
                        <span className="inline-block table-cell h-full align-middle">
                          <span className="inline-block w-16 font-semibold">
                            {course.courseID}
                          </span>
                          <span className="ml-2">{course.name}</span>
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
  const savedSchedules = useAppSelector((state) => state.user.schedules.saved);
  const active = useAppSelector((state) => state.user.schedules.active);

  return (
    <div className="mb-6">
      <div className="flex flex-col">
        {active !== null && (
          <div className="flex items-center">
            <PencilAltIcon className="mr-2 h-4 w-4" />
            <input
              className="bg-white"
              value={savedSchedules[active].name}
              onChange={(e) =>
                dispatch(
                  userSlice.actions.updateActiveScheduleName(e.target.value)
                )
              }
              placeholder="Schedule Name"
            />
          </div>
        )}

        <CourseCombobox
          onSelectedItemsChange={({ selectedItems }) => {
            const courseIDs = selectedItems.map(({ courseID }) => courseID);
            dispatch(fetchFCEInfos({ courseIDs }));
            dispatch(fetchCourseInfos(courseIDs));
            dispatch(userSlice.actions.updateCurrentSchedule(courseIDs));
          }}
        />
      </div>
    </div>
  );
};

export default ScheduleSearch;
