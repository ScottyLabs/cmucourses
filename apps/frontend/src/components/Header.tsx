import React, { ReactElement, useEffect } from "react";
import { useAppSelector } from "~/app/hooks";
import Link from "./Link";
import Image from "next/image";
import MechanizeBanner from "./MechanizeBanner";
import nightwind from "nightwind/helper";

const Bat = () => (
  <svg className="halloween-bat" viewBox="0 0 100 50">
    <path
      className="halloween-bat-wing"
      d="M47 19C40 12 28 8 4 14c6 4 8 8 7 14 5-4 11-3 14 2 3-5 9-5 12 1 2-5 6-6 10-3z"
    />
    <path
      className="halloween-bat-wing halloween-bat-wing-right"
      d="M53 19c7-7 19-11 43-5-6 4-8 8-7 14-5-4-11-3-14 2-3-5-9-5-12 1-2-5-6-6-10-3z"
    />
    <ellipse cx="50" cy="27" rx="5" ry="9" />
    <circle cx="50" cy="17" r="4.5" />
    <path d="M46 15l-.5-7 3.5 5zM54 15l.5-7-3.5 5z" />
  </svg>
);

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

      <div className="relative flex flex-row items-center justify-between p-6 bg-gray-50 h-16">
        <div className="halloween-bats" aria-hidden>
          <Bat />
          <Bat />
          <Bat />
        </div>
        <div className="flex flex-initial cursor-pointer flex-row justify-start font-semibold text-gray-800">
          <Link href="/">
            <div className="flex items-center">
              <span className="halloween-hat">
                <Image
                  src="/favicon.ico"
                  className="rounded"
                  width={30}
                  height={30}
                  alt="favicon"
                />
              </span>
              <span className="halloween-wordmark ml-2 font-spooky text-2xl font-normal tracking-wide">
                CMU Courses
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
