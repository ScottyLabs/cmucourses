import React, { FunctionComponent } from "react";
import { MoonIcon, SunIcon } from "@heroicons/react/outline";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { userSlice } from "../app/user";

const DarkModeButton: FunctionComponent = () => {
  const dispatch = useAppDispatch();
  const darkMode = useAppSelector((state) => state.user.darkMode);

  const toggleDarkMode = () => {
    dispatch(userSlice.actions.toggleDarkMode());
  };

  return (
    <div onClick={toggleDarkMode} className="cursor-pointer">
      {darkMode ? (
        <SunIcon className="h-6 w-6 stroke-gray-500 " />
      ) : (
        <MoonIcon className="h-6 w-6 stroke-gray-500 " />
      )}
    </div>
  );
};

export default DarkModeButton;
