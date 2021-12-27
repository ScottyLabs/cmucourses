import React, { ReactElement } from "react";

export default function Header({ children }): ReactElement {
  return (
    <div className="relative w-screen h-screen">
      <header className="fixed top-0 z-10 h-16 inset-x-0 bg-indigo-700 text-white drop-shadow">
        <div className="flex h-full p-6 items-center justify-between">
          <div className="font-semibold">ScottyLabs Course Tool</div>
        </div>
      </header>
      <main className="relative">{children}</main>
    </div>
  );
}
