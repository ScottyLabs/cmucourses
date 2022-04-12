import React, { ReactElement, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import Link from "next/link";
import Passlink from "passlink";
import * as jose from "jose";
import { userSlice } from "../app/user";
import { StarIcon, AnnotationIcon, LoginIcon, LogoutIcon } from "@heroicons/react/solid";

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
      `${BASE_URL}/signingrequest`,
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
      },
    );
  }

  useEffect(() => {
    try {
      const userDecode = jose.decodeJwt(token);
      setUser(userDecode);
      dispatch(userSlice.actions.logIn());
    } catch {
      setUser(null);
      dispatch(userSlice.actions.logOut());
    }
  }, [token]);

  let logInButton;

  if (user) {
    logInButton = (
      <>
        <div onClick={() => {
          setUser(null);
          dispatch(userSlice.actions.logOut());
        }}><span className="flex items-center"><LogoutIcon className="h-4 w-4 inline mr-1" /> Log Out</span>
        </div>
      </>
    );
  } else {
    logInButton = (
      <>
        {loading && <p>Loading...</p>}
        {!loading && passlink && loginHandler && (
          <div onClick={loginHandler}><span className="flex items-center"><LoginIcon className="h-4 w-4 inline mr-1" /> Log In</span></div>
        )}
      </>
    );
  }

  const loggedIn = useAppSelector((state) => state.user.loggedIn);

  return (
    <div className="relative">
      <header className="fixed inset-x-0 top-0 z-50 text-white bg-indigo-700 h-28 md:h-16 drop-shadow">
        <div className="flex flex-col justify-between h-full p-6 md:items-center md:flex-row">
          <div className="flex-initial font-semibold">
            <Link href="/">ScottyLabs Course Tool Beta</Link>
          </div>
          <div className="flex flex-row space-x-10">
            <div className="hover:cursor-pointer">
              <Link href="/saved"><span className="flex items-center"><StarIcon className="h-4 w-4 inline mr-1" /> Saved</span></Link>
            </div>
            <div>
              <a href="https://forms.gle/6vPTN6Eyqd1w7pqJA" target="_blank">
                <span className="flex items-center"><AnnotationIcon className="h-4 w-4 inline mr-1" /> Feedback</span>
              </a>
            </div>
            <div className="hover:cursor-pointer">{logInButton}</div>
          </div>
        </div>
      </header>
      <main className="relative">{children}</main>
    </div>
  );
}
