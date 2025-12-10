"use client";
import { default as NextLink } from "next/link";
import React from "react";
import { useFetchCourseInfo } from "~/app/api/course";
import { GetTooltip } from "./GetTooltip";

const Link = ({
  href,
  openInNewTab = false,
  children,
  ...props
}: {
  href: string;
  openInNewTab?: boolean;
  children?: React.ReactNode;
} & React.HTMLAttributes<HTMLSpanElement>) => {
  const isCourseLink = href.startsWith("/course/");
  const courseID = isCourseLink ? href.replace("/course/", "") : undefined;
  const tooltipId = isCourseLink && courseID ? `link-${courseID}` : undefined;

  const { data: course } = isCourseLink && courseID
    ? useFetchCourseInfo(courseID)
    : ({ data: undefined } as any);

  const tooltipContent = course
    ? `${course.name} - ${course.units} units`
    : "Loading info...";

  const content = (
    <span
      className="cursor-pointer underline decoration-gray-200 hover:no-underline "
      {...(tooltipId ? { "data-tooltip-id": tooltipId } : {})}
      {...props}
    >
      {children}
    </span>
  );
  if (openInNewTab) {
    return (
      <a target="_blank" href={href} rel="noopener noreferrer">
        {content}
      </a>
    );
  } else {
    if (isCourseLink && tooltipId) {
      return (
        <>
          <NextLink href={href}>{content}</NextLink>
          <GetTooltip id={tooltipId}>{tooltipContent}</GetTooltip>
        </>
      );
    }
    return <NextLink href={href}>{content}</NextLink>;
  }
};

export default Link;
