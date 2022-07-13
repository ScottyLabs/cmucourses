import { default as NextLink } from "next/link";

export default ({
  href,
  openInNewTab = false,
  children,
  ...props
}: {
  href: string;
  openInNewTab?: boolean;
  children?: React.ReactNode;
  [x: string]: any;
}) => {
  const content = (
    <span className="cursor-pointer underline decoration-gray-200 hover:no-underline">
      {children}
    </span>
  );
  if (openInNewTab) {
    return (
      <a target="_blank" href={href} rel="noopener noreferrer" {...props}>
        {content}
      </a>
    );
  } else {
    return <NextLink href={href}>{content}</NextLink>;
  }
};
