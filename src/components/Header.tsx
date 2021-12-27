import React, { ReactElement } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootStateOrAny } from "react-redux";
import { logIn, logOut } from "../app/user";

export default function Header({ children }): ReactElement {
  const dispatch = useDispatch();

  const loggedIn = useSelector(
    (state: RootStateOrAny) => state.courses.loggedIn
  );

  return (
    <div className="relative w-screen h-screen">
      <header className="fixed top-0 z-10 h-16 inset-x-0 bg-indigo-700 text-white drop-shadow">
        <div className="flex h-full p-6 items-center justify-between">
          <div className="font-semibold">ScottyLabs Course Tool</div>
          {loggedIn ? (
            <div onClick={() => logOut(dispatch)}>Log Out</div>
          ) : (
            <div onClick={() => logIn(dispatch)}>Log In</div>
          )}
        </div>
      </header>
      <main className="relative">{children}</main>
    </div>
  );
}
