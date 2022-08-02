import React from "react";

export const SmallButton = ({
  onClick,
  children,
}: {
  onClick: React.MouseEventHandler<HTMLDivElement>;
  children: React.ReactNode;
}) => {
  return (
    <div
      className="text-gray-600 bg-gray-50 cursor-pointer rounded py-1 px-2 text-sm hover:bg-gray-100"
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export const FlushedButton = ({
  onClick,
  children,
}: {
  onClick: React.MouseEventHandler<HTMLDivElement>;
  children: React.ReactNode;
}) => {
  return (
    <div
      className="text-gray-700 cursor-pointer rounded py-1 px-2 text-sm hover:bg-gray-50"
      onClick={onClick}
    >
      {children}
    </div>
  );
};
