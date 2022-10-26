import type { Toast as ToastType } from "react-hot-toast";
import toast from "react-hot-toast";
import React from "react";

type Props = {
  message?: string;
  title?: string;
  icon?: React.ElementType;
};

export const Toast = (t: ToastType, { message, title, icon }: Props) => {
  const Icon = icon;

  return (
    <div
      className={`${
        t.visible ? "animate-enter" : "animate-leave"
      } bg-white pointer-events-auto flex w-full max-w-xs items-center rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 drop-shadow`}
    >
      <div className="w-0 flex-1 p-4">
        <div className="flex items-center">
          {icon && (
            <div className="flex-shrink-0">
              <Icon className="h-4 w-4 fill-gray-500" />
            </div>
          )}
          <div className="ml-3 flex-1 gap-y-1">
            {title && (
              <p className="text-md text-gray-900 font-medium">{title}</p>
            )}
            {message && <p className="text-md text-gray-500">{message}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export const showToast = ({ message, title, icon }: Props) =>
  toast.custom((t) => Toast(t, { message, title, icon }), {
    duration: 3000,
    position: "top-center",
  });
