import React from "react";
import { MoonIcon, SunIcon } from "@heroicons/react/solid";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { uiSlice } from "../app/ui";

const DarkModeButton = () => {
  const dispatch = useAppDispatch();
  const darkMode = useAppSelector((state) => state.ui.darkMode);

  const toggleDarkMode = () => {
    dispatch(uiSlice.actions.toggleDarkMode());
  };

  return (
    <div
      onClick={toggleDarkMode}
      className="bg-gray-100 cursor-pointer rounded-full p-2"
    >
      {darkMode ? (
        <SunIcon className="h-4 w-4 stroke-gray-600 dark:stroke-zinc-400" />
      ) : (
        <MoonIcon className="h-4 w-4 stroke-gray-600 dark:stroke-zinc-400" />
      )}
    </div>
  );
};

export default DarkModeButton;
