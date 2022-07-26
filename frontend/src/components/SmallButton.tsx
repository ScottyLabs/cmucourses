import React from "react";

type Props = {
  onClick: React.MouseEventHandler<HTMLDivElement>;
  children: React.ReactNode;
};

const SmallButton = ({ onClick, children }: Props) => {
  return (
    <div
      className="text-gray-600 bg-gray-50 cursor-pointer rounded py-1 px-2 text-sm hover:bg-gray-100"
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default SmallButton;
