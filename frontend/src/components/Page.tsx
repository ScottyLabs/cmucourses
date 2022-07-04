import React from "react";
import Header from "./Header";

type Props = {
  sidebar?: React.ReactNode;
  content: React.ReactNode;
  footer?: React.ReactNode;
};

export const Page = ({ sidebar, content, footer }: Props) => {
  return (
    <div>
      <header className="bg-gray-50 fixed inset-x-0 top-0 z-50 h-32 drop-shadow dark:bg-zinc-800 md:h-16">
        <Header activePage="" />
      </header>
      <main className="relative flex flex-col md:h-screen md:flex-row">
        <div className="relative mt-28 w-full md:mt-16 md:w-72 lg:w-96">
          <div className="bg-white text-gray-700 inset-0 z-20 space-y-6 p-6 drop-shadow-md md:absolute">
            {sidebar}
          </div>
        </div>
        <div className="flex-1 overflow-y-scroll md:h-full md:pt-16">
          {content}
        </div>
      </main>
      {footer && <footer>{footer}</footer>}
    </div>
  );
};
