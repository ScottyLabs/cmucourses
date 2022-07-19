import { default as NextLink } from "next/link";
import React from "react";

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
  const content = (
    <span
      className="cursor-pointer underline decoration-gray-200 hover:no-underline"
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
    return <NextLink href={href}>{content}</NextLink>;
  }
};

export default Link;
