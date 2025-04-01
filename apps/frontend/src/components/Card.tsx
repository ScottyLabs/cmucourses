import React, { useEffect, useRef, useState } from "react";

export const Card = ({ children }: { children: React.ReactNode }) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [lockedHeight, setLockedHeight] = useState<number | undefined>(
    undefined
  );

  useEffect(() => {
    if (divRef.current && lockedHeight === undefined) {
      const initialHeight = divRef.current.clientHeight;
      setLockedHeight(initialHeight);
    }
  }, [lockedHeight]);

  return (
    <div
      ref={divRef}
      style={lockedHeight ? { height: lockedHeight } : {}}
      className="bg-white border-gray-100 rounded border p-6"
    >
      {children}
    </div>
  );
};

const Header = ({ children }: { children: React.ReactNode }) => {
  return <h1 className="text-gray-700 text-lg">{children}</h1>;
};

Card.Header = Header;
