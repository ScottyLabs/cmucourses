import React from "react";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
} from "@heroicons/react/solid";
import { FlushedButton } from "./Buttons";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { uiSlice } from "../app/ui";

const Sidebar = ({ children }) => {
  const open = useAppSelector((state) => state.ui.sidebarOpen);
  const dispatch = useAppDispatch();

  return open ? (
    <div className="relative z-20 z-40 w-full md:w-72 lg:w-96">
      <button className="absolute right-3 top-3 z-40 md:top-4 md:right-2">
        <FlushedButton
          onClick={() => dispatch(uiSlice.actions.toggleSidebarOpen())}
        >
          <div className="hidden items-center md:flex">
            <div className="mr-1">Hide</div>
            <ChevronLeftIcon className="h-5 w-5" />
          </div>
          <div className="block flex items-center md:hidden">
            <div className="mr-2">Hide</div>
            <ChevronUpIcon className="h-5 w-5" />
          </div>
        </FlushedButton>
      </button>
      <div className="bg-white text-gray-700 inset-0 z-40 space-y-6 p-6 drop-shadow-md md:absolute">
        {children}
      </div>
    </div>
  ) : (
    <div className="bg-white relative z-30 h-12 w-full drop-shadow-md md:h-full md:w-16 lg:w-16">
      <button className="absolute right-3 top-3 z-50">
        <FlushedButton
          onClick={() => dispatch(uiSlice.actions.toggleSidebarOpen())}
        >
          <div className="hidden md:block">
            <ChevronRightIcon className="h-5 w-5" />
          </div>
          <div className="block flex items-center md:hidden">
            <div className="mr-1">Show</div>
            <ChevronDownIcon className="h-5 w-5" />
          </div>
        </FlushedButton>
      </button>
    </div>
  );
};

export default Sidebar;
