import React, { ReactElement, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import Link from "next/link";
import Passlink from "passlink";
import * as jose from "jose";
import { userSlice } from "../app/user";

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
        }}>Log Out</div>
      </>
    );
  } else {
    logInButton = (
      <>
        {loading && <p>Loading...</p>}
        {!loading && passlink && loginHandler && (
          <div onClick={loginHandler}>Log In</div>
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
            <Link href="/">ScottyLabs Course Tool</Link>
          </div>
          <div className="flex flex-row space-x-10">
            <div>
              <Link href="/bookmarked">Bookmarked</Link>
            </div>
            <div>
              <a href="https://forms.gle/6vPTN6Eyqd1w7pqJA" target="_blank">
                Feedback
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
