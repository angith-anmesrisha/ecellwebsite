"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import SiteFooter from "./SiteFooter";
import GlobalBackButton from "./GlobalBackButton";

declare global {
  interface Window {
    ecellPageViews?: number;
  }
}

const isAdminPath = (pathname: string) => pathname.startsWith("/admin") || pathname.startsWith("/recruitment/admin");

// Picks the page frame: the home page brings its own navbar and footer, admin consoles
// get a plain back button, and every other page gets the shared navbar and footer.
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";

  // Counts in-app page views so the back button knows whether "back" stays on this site
  useEffect(() => {
    window.ecellPageViews = (window.ecellPageViews || 0) + 1;
  }, [pathname]);

  if (pathname === "/") return <>{children}</>;

  if (isAdminPath(pathname)) {
    return (
      <>
        <GlobalBackButton />
        {children}
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="pt-20">{children}</div>
      <SiteFooter />
    </>
  );
}
