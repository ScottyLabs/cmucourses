import {
  ChatBubbleBottomCenterTextIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  StarIcon,
  UserCircleIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";
import React from "react";
import Link from "next/link";

const SideNavItem = ({
  icon,
  text,
  link,
  newTab = false,
  active = false,
}: {
  icon: React.ComponentType<{ className: string }>;
  text: string;
  link: string;
  newTab?: boolean;
  active?: boolean;
}) => {
  const Icon = icon;

  const contents = (
    <div className="group flex cursor-pointer flex-col items-center lg:flex-row">
      <div className="flex">
        <Icon
          className={`h-7 w-7 group-hover:stroke-blue-500 group-hover:dark:stroke-blue-500 lg:h-6 lg:w-6 ${
            active
              ? "stroke-blue-600 dark:stroke-blue-400"
              : "stroke-gray-500 dark:stroke-zinc-400"
          }`}
        />
      </div>
      <div
        className={`${
          active ? "text-blue-600" : "text-gray-500"
        } text-xs group-hover:text-blue-500 lg:ml-2 lg:text-lg`}
      >
        {text}
      </div>
    </div>
  );

  if (link && !newTab) return <Link href={link}>{contents}</Link>;
  else
    return (
      <a href={link} target="_blank" rel="noreferrer">
        {contents}
      </a>
    );
};

export const SideNav = ({ activePage }) => {
  return (
    <div className="bg-white border-gray-100 flex flex-row justify-between gap-y-10 border-r px-6 py-6 md:flex-col md:justify-start lg:items-start lg:gap-y-6 lg:pr-10 lg:pl-6">
      <SideNavItem
        icon={MagnifyingGlassIcon}
        text="Search"
        link="/"
        active={activePage === "search"}
      />
      <SideNavItem
        icon={StarIcon}
        text="Saved"
        link="/saved"
        active={activePage === "saved"}
      />
      <SideNavItem
        icon={ClockIcon}
        text="Schedules"
        link="/schedules"
        active={activePage === "schedules"}
      />
      <SideNavItem
        icon={UserCircleIcon}
        text="Instructors"
        link="/instructors"
        active={activePage === "instructors"}
      />
      <SideNavItem
        icon={BookOpenIcon}
        text="Geneds"
        link="/geneds"
        active={activePage === "geneds"}
      />
      <SideNavItem
        icon={ChatBubbleBottomCenterTextIcon}
        text="Feedback"
        link="https://forms.gle/6vPTN6Eyqd1w7pqJA"
        newTab
        active={false}
      />
    </div>
  );
};
