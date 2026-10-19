import React, { ReactElement, useEffect } from "react";
import { useAppSelector } from "~/app/hooks";
import Link from "./Link";
import Image from "next/image";
import DarkModeButton from "./DarkModeButton";
import MechanizeBanner from "./MechanizeBanner";
import nightwind from "nightwind/helper";

export default function Header(): ReactElement {
  const darkMode = useAppSelector((state) => state.ui.darkMode);
  useEffect(() => {
    nightwind.enable(darkMode);
  }, [darkMode]);

  return (
    <div className="">
      <MechanizeBanner />

      {/* <div className="lg:p-1.5 md:p-2 p-3 lg:text-lg md:text-base text-xs text-white text-center bg-[#007fff]"> */}
      {/*   Spring/Summer 2026 instructors and room information temporarily */}
      {/*   unavailable due to changes in the Schedule of Classes. */}
      {/* </div> */}

      <div className="flex flex-row items-center justify-between p-6 bg-gray-50 h-16">
        <div className="flex flex-initial cursor-pointer flex-row justify-start font-semibold text-gray-800">
          <Link href="/">
            <div className="flex items-center">
              <Image
                src="/favicon.ico"
                className="rounded"
                width={30}
                height={30}
                alt="favicon"
              />
              <span className="ml-2">CMU Courses</span>
            </div>
          </Link>
        </div>

        <div className="flex flex-row items-center justify-between gap-x-2 text-gray-600">
          <DarkModeButton />
        </div>
      </div>
    </div>
  );
}
