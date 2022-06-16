import React, { FunctionComponent } from "react";
import { MoonIcon, SunIcon } from "@heroicons/react/solid";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { userSlice } from "../app/user";

const DarkModeButton: FunctionComponent = () => {
  const dispatch = useAppDispatch();
  const darkMode = useAppSelector((state) => state.user.darkMode);

  const toggleDarkMode = () => {
    dispatch(userSlice.actions.toggleDarkMode());
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
