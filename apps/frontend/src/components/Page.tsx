import React, { useEffect } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { LoginModal } from "./LoginModal";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { uiSlice } from "~/app/ui";
import { Toaster } from "react-hot-toast";
import { SideNav } from "./SideNav";
import Link from "./Link";
import { useAuth } from "@clerk/nextjs";
import { userSlice } from "~/app/user";

type Props = {
  sidebar?: React.ReactNode;
  content: React.ReactNode;
  activePage?: string;
};

export const Page = ({ sidebar, content, activePage }: Props) => {
  const loggedIn = useAppSelector((state) => state.user.loggedIn);
  const modalShown = useAppSelector(
    (state) => state.ui.session.loginModalShown
  );
  const dispatch = useAppDispatch();

  const { isLoaded, userId, sessionId, getToken } = useAuth();

  useEffect(() => {
    if (isLoaded && userId && sessionId) {
      dispatch(userSlice.actions.logIn());
      getToken()
        .then((token) => {
          if (token) {
            dispatch(userSlice.actions.setToken(token));
          }
        })
        .catch(() => {
          userSlice.actions.logOut();
        });
    } else {
      dispatch(userSlice.actions.logOut());
    }
  }, [isLoaded, userId, sessionId, getToken, dispatch]);

  useEffect(() => {
    if (!loggedIn && !modalShown) {
      dispatch(uiSlice.actions.openLoginModal());
    } else if (loggedIn) {
      dispatch(uiSlice.actions.closeLoginModal());
    }
  }, [dispatch, loggedIn, modalShown]);

  return (
    <div className="accent-blue-600 dark:accent-blue-800">
      <LoginModal />
      <Toaster position="bottom-right" />
      <header className="fixed inset-x-0 top-0 z-40 h-16 border-b drop-shadow bg-gray-50 border-gray-200 dark:bg-zinc-800">
        <Header />
      </header>
      <main className="relative flex min-h-full flex-col pt-16 md:h-screen md:flex-row md:justify-around">
        <SideNav activePage={activePage} />
        {sidebar && <Sidebar>{sidebar}</Sidebar>}
        <div
          className={`flex-1 overflow-y-auto md:h-full ${
            !sidebar ? "max-w-7xl" : ""
          }`}
        >
          {content}
        </div>
      </main>
      <footer className="min-h-28 z-50 border-t p-8 text-sm text-gray-500 bg-gray-50 border-gray-100">
        <div className="mx-auto max-w-4xl">
          <p>
            Designed, developed and maintained with ❤️ by{" "}
            <Link href="https://scottylabs.org">ScottyLabs</Link>.
          </p>
          <p>
            Want to help us make CMU Courses better? Join us at ScottyLabs or
            make a pull request on our{" "}
            <Link href="https://github.com/ScottyLabs/course-tool">
              GitHub repository
            </Link>
            .
          </p>
        </div>
      </footer>
    </div>
  );
};
