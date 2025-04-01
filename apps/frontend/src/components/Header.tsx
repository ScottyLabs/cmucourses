import React, { ReactElement, useEffect } from "react";
import { useAppSelector } from "~/app/hooks";
import Link from "./Link";
import Image from "next/image";
import {
  ArrowLeftOnRectangleIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/solid";
import DarkModeButton from "./DarkModeButton";
import nightwind from "nightwind/helper";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
} from "@clerk/nextjs";
import { useAprilFools } from "./aprilfools/AprilFoolsContext";

const LogInButton = () => {
  return (
    <div className={`cursor-pointer rounded p-2 px-2 py-1 hover:bg-gray-100 `}>
      <span className="flex cursor-pointer flex-row items-center">
        <SignedOut>
          <ArrowRightOnRectangleIcon className="mr-1 inline h-4 w-4" />{" "}
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <ArrowLeftOnRectangleIcon className="mr-1 inline h-4 w-4" />{" "}
          <SignOutButton />
        </SignedIn>
      </span>
    </div>
  );
};

export default function Header(): ReactElement {
  const { enabled, setEnabled } = useAprilFools();

  const darkMode = useAppSelector((state) => state.ui.darkMode);
  useEffect(() => {
    nightwind.enable(darkMode);
  }, [darkMode]);

  const toggleHandler = () => {
    setEnabled(!enabled);
  };

  return (
    <div className="">
      <div className="lg:p-1.5 md:p-2 p-3 lg:text-lg md:text-base text-xs text-black invert text-center bg-[#fb406c] h-10">
        <span className="text-sm my-auto ml-2 italic">
          happy april fool&apos;s! try hovering over stuff (especially course
          descriptions){" "}
          <a
            className="text-muted underline font-black cursor-pointer"
            onClick={toggleHandler}
          >
            press me to toggle!!!
          </a>
        </span>
      </div>
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
          <LogInButton />
        </div>
      </div>
    </div>
  );
}
