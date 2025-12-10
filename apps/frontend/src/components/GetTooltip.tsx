"use client";
import React from "react";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";

export const GetTooltip = ({
  id,
  children,
}: {
  id: string;
  children?: React.ReactNode;
}) => {
  return (
    <Tooltip
      id={id}
      className="!bg-gray-50 !text-gray-800 !border !border-gray-300 !rounded !shadow-md max-w-sm z-50 !p-3"
      noArrow={false}
      opacity={1}
      place="top"
      positionStrategy="fixed"
      clickable={true}
    >
      {children}
    </Tooltip>
  );
};
