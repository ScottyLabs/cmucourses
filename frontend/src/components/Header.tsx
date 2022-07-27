import React, { ReactElement, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import Link from "next/link";
import Image from "next/image";
import Passlink from "passlink";
import * as jose from "jose";
import { userSlice } from "../app/user";
import { LoginIcon, LogoutIcon, XIcon } from "@heroicons/react/solid";
import DarkModeButton from "./DarkModeButton";
import nightwind from "nightwind/helper";
import { showToast } from "./Toast";

const HeaderItemIconText = ({
  icon,
  text,
  href,
}: {
  icon: React.ComponentType<{ className: string }>;
  text: string;
  href?: string;
}) => {
  const Icon = icon;
  const content = (
    <span className="flex cursor-pointer flex-row items-center">
      <Icon className="mr-1 inline h-4 w-4" />{" "}
      <div className="mt-0 hidden text-base md:block">{text}</div>
    </span>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
};

const HeaderItem = ({
  children,
  disableHover = false,
  active = false,
}: {
  children: React.ReactNode;
  disableHover?: boolean;
  active?: boolean;
}) => {
  return (
    <div
      className={`cursor-pointer rounded p-2 px-2 py-1 ${
        !disableHover && "hover:bg-gray-100"
      } ${active && "bg-gray-100"}`}
    >
      {children}
    </div>
  );
};

export let passlink: Passlink;
export let loginHandler: () => void = undefined;

export default function Header({ activePage }): ReactElement {
  const dispatch = useAppDispatch();

  const token = useAppSelector((state) => state.user.token);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<jose.JWTPayload>(null);

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
      (data: string) => {
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
        showToast({
          message: "Login expired, please log in again.",
          icon: XIcon,
        });
        return;
      } else {
        setUser(userDecode);
        dispatch(userSlice.actions.logIn());
      }
    } catch {
      setUser(null);
      dispatch(userSlice.actions.logOut());
      return;
    }
  }, [dispatch, token]);

  const darkMode = useAppSelector((state) => state.ui.darkMode);
  useEffect(() => {
    /* eslint-disable-next-line */
    nightwind.enable(darkMode);
  }, [darkMode]);

  let logInButton: React.ReactNode;

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
            <span className="ml-2">
              ScottyLabs Course Tool <sup>β</sup>
            </span>
          </div>
        </Link>
      </div>
      <div className="text-gray-600 flex flex-row items-center justify-between gap-x-2">
        <DarkModeButton />
        <HeaderItem>{logInButton}</HeaderItem>
      </div>
    </div>
  );
}
