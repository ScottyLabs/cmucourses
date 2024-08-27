import React from "react";
import PulseLoader from "react-spinners/PulseLoader";
import { useAppSelector } from "~/app/hooks";

const Loading = () => {
  const darkMode = useAppSelector((state) => state.ui.darkMode);

  return (
    <div className="text-center">
      <PulseLoader
        color={
          darkMode
            ? 'zinc-300'
            : 'gray-500'
        }
        loading={true}
        size={10}
        margin={5}
      />
    </div>
  );
};

export default Loading;
