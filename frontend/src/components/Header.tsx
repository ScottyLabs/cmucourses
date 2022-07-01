import React, { ReactElement, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import Link from "next/link";
import Image from "next/image";
import Passlink from "passlink";
import * as jose from "jose";
import { userSlice } from "../app/user";
import {
  AnnotationIcon,
  ClockIcon,
  LoginIcon,
  LogoutIcon,
  StarIcon,
} from "@heroicons/react/solid";
import DarkModeButton from "./DarkModeButton";
import nightwind from "nightwind/helper";

const BASE_URL = process.env.NEXT_PUBLIC_REACT_APP_API_URL;

export default function Header({ children }): ReactElement {
  const dispatch = useAppDispatch();

  const token = useAppSelector((state) => state.user.token);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  let passlink;
  let loginHandler;

  if (window !== undefined) {
    passlink = new Passlink(window);
    loginHandler = passlink.generateloginHandler(
      `${process.env.backendUrl}/signingrequest`,
      () => {
        setLoading(true);
      },
      () => {
        setLoading(false);
      },
      () => {
        setLoading(false);
      },
      () => {
        setLoading(false);
      },
      (data) => {
        setLoading(false);
        dispatch(userSlice.actions.setToken(data));
      }
    );
  }

  useEffect(() => {
    try {
      const userDecode = jose.decodeJwt(token);
      if (Date.now().valueOf() / 1000 > userDecode.exp) {
        setUser(null);
        dispatch(userSlice.actions.logOut());
      } else {
        setUser(userDecode);
        dispatch(userSlice.actions.logIn());
      }
    } catch {
      setUser(null);
      dispatch(userSlice.actions.logOut());
    }
  }, [dispatch, token]);

  const darkMode = useAppSelector((state) => state.user.darkMode);
  useEffect(() => {
    nightwind.enable(darkMode);
  }, [darkMode]);

  let logInButton;

  if (user) {
    logInButton = (
      <>
        <div
          onClick={() => {
            setUser(null);
            dispatch(userSlice.actions.logOut());
          }}
        >
          <span className="flex items-center">
            <LogoutIcon className="mr-1 inline h-4 w-4" /> Log Out
          </span>
        </div>
      </>
    );
  } else {
    logInButton = (
      <>
        {loading && <p>Loading...</p>}
        {!loading && passlink && loginHandler && (
          <div onClick={loginHandler}>
            <span className="flex items-center">
              <LoginIcon className="mr-1 inline h-4 w-4" /> Log In
            </span>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="relative">
      <header className="bg-gray-50 fixed inset-x-0 top-0 z-50 h-32 drop-shadow dark:bg-zinc-800 md:h-16">
        <div className="flex h-full flex-col justify-between p-6 md:flex-row md:items-center">
          <div className="text-gray-800 flex-initial font-semibold hover:cursor-pointer">
            <Link href="/">
              <span className="flex items-center">
                <Image
                  src="/favicon.ico"
                  className="rounded-md"
                  width={30}
                  height={30}
                  alt="favicon"
                />
                <span className="ml-2">
                  ScottyLabs Course Tool <sup>β</sup>
                </span>
              </span>
            </Link>
          </div>
          <div className="text-gray-600 flex flex-row flex-wrap items-center justify-end gap-x-8 gap-y-1">
            <div>
              <Link href="/saved">
                <span className="flex items-center hover:cursor-pointer">
                  <StarIcon className="mr-1 inline h-4 w-4" /> Saved
                </span>
              </Link>
            </div>
            <div>
              <Link href="/schedules">
                <span className="flex items-center hover:cursor-pointer">
                  <ClockIcon className="mr-1 inline h-4 w-4" /> Schedules
                </span>
              </Link>
            </div>
            <div>
              <a
                href="https://forms.gle/6vPTN6Eyqd1w7pqJA"
                target="_blank"
                rel="noreferrer"
              >
                <span className="flex items-center hover:cursor-pointer">
                  <AnnotationIcon className="mr-1 inline h-4 w-4" /> Feedback
                </span>
              </a>
            </div>
            <DarkModeButton />
            <div className="hover:cursor-pointer">{logInButton}</div>
          </div>
        </div>
      </header>
      <main className="relative">{children}</main>
    </div>
  );
}
