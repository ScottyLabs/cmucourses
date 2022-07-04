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

const HeaderItemIconText = ({ icon, text, href = undefined }) => {
  const Icon = icon;
  const content = (
    <span className="flex flex-col items-center hover:cursor-pointer md:flex-row">
      <Icon className="mr-1 inline h-5 w-5 sm:h-4 sm:w-4" />{" "}
      <div className="mt-1 text-sm sm:mt-0 sm:text-base">{text}</div>
    </span>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
};

const HeaderItem = ({ children, disableHover = false, active = false }) => {
  return (
    <div
      className={`rounded px-2 py-1 hover:cursor-pointer md:p-2 ${
        !disableHover && "hover:bg-gray-100"
      } ${active && "bg-gray-100"}`}
    >
      {children}
    </div>
  );
};

export let passlink;
export let loginHandler;

export default function Header({ activePage }): ReactElement {
  const dispatch = useAppDispatch();

  const token = useAppSelector((state) => state.user.token);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

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

  const darkMode = useAppSelector((state) => state.ui.darkMode);
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
          <HeaderItemIconText icon={LogoutIcon} text="Log Out" />
        </div>
      </>
    );
  } else {
    logInButton = (
      <>
        {loading && <p>Loading...</p>}
        {!loading && passlink && loginHandler && (
          <div onClick={loginHandler}>
            <HeaderItemIconText icon={LoginIcon} text="Log In" />
          </div>
        )}
      </>
    );
  }

  return (
    <div className="flex h-full flex-col justify-between p-6 md:flex-row md:items-center">
      <div className="text-gray-800 flex flex-initial flex-row justify-between gap-x-5 font-semibold hover:cursor-pointer sm:justify-start">
        <Link href="/">
          <div className="flex items-center">
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
          </div>
        </Link>
        <DarkModeButton />
      </div>
      <div className="text-gray-600 mt-3 flex flex-row flex-wrap items-center justify-between md:mt-0 md:gap-x-4">
        <HeaderItem active={activePage === "saved"}>
          <HeaderItemIconText icon={StarIcon} text="Saved" href="/saved" />
        </HeaderItem>
        <HeaderItem active={activePage === "schedules"}>
          <HeaderItemIconText
            icon={ClockIcon}
            text="Schedules"
            href="/schedules"
          />
        </HeaderItem>
        <HeaderItem>
          <a
            href="https://forms.gle/6vPTN6Eyqd1w7pqJA"
            target="_blank"
            rel="noreferrer"
          >
            <HeaderItemIconText icon={AnnotationIcon} text="Feedback" />
          </a>
        </HeaderItem>

        <HeaderItem>{logInButton}</HeaderItem>
      </div>
    </div>
  );
}
