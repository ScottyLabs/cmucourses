import React from "react";
import { Tooltip } from "react-tooltip";

export const getTooltip = (id: string, info: string) => {
  return <Tooltip id={id} className="max-w-sm z-40 rounded" noArrow={true} opacity={1} style={{ padding: 0 }}>
    <div className="flex flex-col bg-gray-50 text-gray-800 -m-1 p-3 rounded border">
      <span className="text-wrap text-sm">{info}</span>
    </div>
  </Tooltip>;
};