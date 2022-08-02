import React from "react";
import PulseLoader from "react-spinners/PulseLoader";

import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "../../tailwind.config.js";
import { useAppSelector } from "../app/hooks";

/* eslint-disable-next-line */
const fullConfig: any = resolveConfig(tailwindConfig);

const Loading = () => {
  const darkMode = useAppSelector((state) => state.ui.darkMode);

  return (
    <div className="text-center">
      <PulseLoader
        color={
          /* eslint-disable */
          darkMode
            ? fullConfig.theme.colors.zinc[300]
            : fullConfig.theme.colors.gray[500]
          /* eslint-enable */
        }
        loading={true}
        size={10}
        margin={5}
      />
    </div>
  );
};

export default Loading;
