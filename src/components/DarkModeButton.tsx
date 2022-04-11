import React, { FunctionComponent } from "react";
import { SunIcon } from "@heroicons/react/outline";
import { MoonIcon } from "@heroicons/react/outline";
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
        <SunIcon className="h-6 w-6" />
      ) : (
        <MoonIcon className="h-6 w-6" />
      )}
    </div>
  );
};

export default DarkModeButton;
