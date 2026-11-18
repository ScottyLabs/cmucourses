import React, { CSSProperties, ReactElement, useEffect } from "react";
import { useAppSelector } from "~/app/hooks";
import Link from "./Link";
import Image from "next/image";
import MechanizeBanner from "./MechanizeBanner";
import nightwind from "nightwind/helper";

const SNOWFLAKES = [
  { x: "3%", size: 10, duration: 7, delay: -1, drift: 8, rest: 6 },
  { x: "11%", size: 14, duration: 9, delay: -5, drift: -10, rest: 34 },
  { x: "22%", size: 8, duration: 6, delay: -3, drift: 6, rest: 18 },
  { x: "34%", size: 12, duration: 10, delay: -8, drift: -6, rest: 42 },
  { x: "46%", size: 9, duration: 7.5, delay: -2, drift: 10, rest: 10 },
  { x: "58%", size: 13, duration: 8.5, delay: -6, drift: -8, rest: 30 },
  { x: "69%", size: 8, duration: 6.5, delay: -4, drift: 7, rest: 46 },
  { x: "80%", size: 11, duration: 9.5, delay: -7, drift: -9, rest: 14 },
  { x: "91%", size: 9, duration: 7, delay: -3.5, drift: 6, rest: 38 },
];

const Snowflake = ({ x, size, duration, delay, drift, rest }: (typeof SNOWFLAKES)[number]) => (
  <svg
    className="christmas-snowflake"
    viewBox="-10 -10 20 20"
    style={
      {
        "--flake-x": x,
        "--flake-size": `${size}px`,
        "--flake-duration": `${duration}s`,
        "--flake-delay": `${delay}s`,
        "--flake-drift": `${drift}px`,
        "--flake-rest": `${rest}px`,
      } as CSSProperties
    }
  >
    {[0, 60, 120, 180, 240, 300].map((angle) => (
      <path key={angle} transform={`rotate(${angle})`} d="M0 0V-9M-2.5-7.5L0-5L2.5-7.5" />
    ))}
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
        <div className="christmas-snow" aria-hidden>
          {SNOWFLAKES.map((flake) => (
            <Snowflake key={flake.x} {...flake} />
          ))}
        </div>
        <div className="flex flex-initial cursor-pointer flex-row justify-start font-semibold text-gray-800">
          <Link href="/">
            <div className="flex items-center">
              <span className="christmas-hat">
                <Image
                  src="/favicon.ico"
                  className="rounded"
                  width={30}
                  height={30}
                  alt="favicon"
                />
              </span>
              <span className="christmas-wordmark ml-2 font-festive text-2xl font-bold tracking-wide">
                CMU Courses
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
