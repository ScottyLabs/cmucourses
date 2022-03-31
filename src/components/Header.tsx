import React, { ReactElement, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootStateOrAny } from "react-redux";
import Link from "next/link";
import Passlink from "passlink";
import * as jose from 'jose';

const BASE_URL = process.env.NEXT_PUBLIC_REACT_APP_API_URL;

export default function Header({ children }): ReactElement {
  const dispatch = useDispatch();

  const token = useSelector((state: RootStateOrAny) => state.user.token);
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
        dispatch({ type: "user/setToken", payload: data });
      }
    );
  }

  useEffect(() => {
    try {
      const userDecode = jose.decodeJwt(token);
      setUser(userDecode);
      dispatch({ type: "user/logIn" });
    } catch {
      dispatch({ type: "user/setToken", payload: null });
      setUser(null);
      dispatch({ type: "user/logOut" });
    }
  }, [token]);

  let logInButton;

  if (user) {
    logInButton = (<>
      <div onClick={() => setUser(null)}>Log Out</div>
    </>);
  } else {
    logInButton = (
      <>
        {loading && <p>Loading...</p>}
        {!loading && passlink && loginHandler && (
          <div onClick={loginHandler}>Log In</div>
        )}
      </>
    )
  }

  const loggedIn = useSelector((state: RootStateOrAny) => state.user.loggedIn);

  return (
    <div className="relative">
      <header className="fixed inset-x-0 top-0 z-10 h-16 text-white bg-indigo-700 drop-shadow">
        <div className="flex items-center justify-between h-full p-6">
          <div className="font-semibold">
            <Link href="/">ScottyLabs Course Tool</Link>
          </div>
          <div className="flex flex-row space-x-10">
            <div>
              <Link href="/bookmarked">Bookmarked</Link>
            </div>
            <div>
              <a href="https://forms.gle/6vPTN6Eyqd1w7pqJA" target="_blank">Feedback</a>
            </div>
            <div className="hover:cursor-pointer">
              {logInButton}
            </div>
          </div>
        </div>
      </header>
      <main className="relative">{children}</main>
    </div>
  );
}
