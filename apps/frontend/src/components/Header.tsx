import React, { ReactElement, useEffect } from "react";
import { useAppSelector } from "../app/hooks";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeftOnRectangleIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/solid";
import DarkModeButton from "./DarkModeButton";
import nightwind from "nightwind/helper";
import { SignedIn, SignedOut, SignInButton, SignOutButton } from "@clerk/nextjs";

const LogInButton = () => {
  return (
    <div
      className={`cursor-pointer rounded p-2 px-2 py-1 hover:bg-gray-100 `}
    >
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
  const darkMode = useAppSelector((state) => state.ui.darkMode);
  useEffect(() => {
    /* eslint-disable-next-line */
    nightwind.enable(darkMode);
  }, [darkMode]);

  return (
    <div className="bg-gray-50 flex h-full flex-row items-center justify-between p-6">
    <div className="text-gray-800 flex flex-initial cursor-pointer flex-row justify-start font-semibold">
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
      <div className="text-gray-600 flex flex-row items-center justify-between gap-x-2">
        <DarkModeButton />
        <LogInButton />
      </div>
    </div>
  );
}
