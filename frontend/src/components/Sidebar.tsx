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

const Sidebar = ({ children }: { children: React.ReactNode }) => {
  const open = useAppSelector((state) => state.ui.sidebarOpen);
  const dispatch = useAppDispatch();

  return open ? (
    <div className="border-gray-100 relative z-20 z-30 w-full border-r border-b md:w-72 lg:w-96">
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
      <div className="bg-white text-gray-700 inset-0 space-y-6 p-6 md:absolute md:space-y-12">
        {children}
      </div>
    </div>
  ) : (
    <div className="bg-white border-gray-100 relative z-30 h-12 w-full border-r border-b md:h-full md:w-16 lg:w-16">
      <button className="absolute right-3 top-3 z-40">
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
