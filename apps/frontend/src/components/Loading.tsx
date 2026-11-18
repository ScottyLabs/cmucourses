import React from "react";
import PulseLoader from "react-spinners/PulseLoader";

const Loading = () => {
  return (
    <div className="text-center">
      <PulseLoader
        color="var(--christmas-red)"
        loading={true}
        size={10}
        margin={5}
      />
    </div>
  );
};

export default Loading;
