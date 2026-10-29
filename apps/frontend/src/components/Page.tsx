import React, { useEffect } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { Toaster } from "react-hot-toast";
import { SideNav } from "./SideNav";
import Link from "./Link";

type Props = {
  sidebar?: React.ReactNode;
  content: React.ReactNode;
  activePage?: string;
  title?: string;
};

export const Page = ({ sidebar, content, activePage,title }: Props) => {
  useEffect(() => {
    // Set the browser tab title
    if (title) {
      document.title = title;
    }
  }, [title]);

  return (
    <div className="accent-blue-600 flex flex-col md:h-screen min-h-screen">
      <Toaster position="bottom-right" />
      <header className="sticky top-0 border-b drop-shadow bg-gray-50 border-gray-200 zinc-800 z-10">
        <Header />
      </header>
      <main className="relative flex flex-1 flex-col md:flex-row md:justify-around md:overflow-hidden">
        <div className="halloween-cobweb" aria-hidden />
        <div className="halloween-spider" aria-hidden />
        <SideNav activePage={activePage} />
        {sidebar && <Sidebar>{sidebar}</Sidebar>}
        <div
          className={`flex-1 overflow-y-auto md:h-full ${
            !sidebar ? "" : ""
          }`}
        >
          {content}
        </div>
      </main>
      <footer className="border-t lg:px-8 md:py-4 md:px-4 p-4 pb-8 text-sm text-gray-500 bg-gray-50 border-gray-100">
        <div className="max-w-4xl">
          <p>
            Designed, developed and maintained with 🎃 by{" "}
            <Link href="https://scottylabs.org">ScottyLabs</Link>.
          </p>
        </div>
      </footer>
    </div>
  );
};
