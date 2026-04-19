import {
  Link,
  type LinkProps,
  useNavigate,
  type NavigateOptions,
} from "@tanstack/react-router";
import React from "react";

/**
 * AppLink is a wrapper around the standard Link component that defaults
 * the 'from' prop to '/' (root). This ensures that all navigations resolve
 * from the absolute root and prevents 'Could not find match for from' warnings
 * during route transitions.
 */
export function AppLink(
  props: LinkProps & React.AnchorHTMLAttributes<HTMLAnchorElement>,
) {
  return <Link from="/" {...props} />;
}

/**
 * useAppNavigate is a custom hook that wraps useNavigate and ensures
 * that all navigations default to 'from: "/"'.
 */
export function useAppNavigate() {
  const navigate = useNavigate();

  return (options: NavigateOptions) => {
    return navigate({ from: "/", ...options });
  };
}
