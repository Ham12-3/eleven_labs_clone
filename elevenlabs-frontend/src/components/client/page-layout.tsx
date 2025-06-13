"use client"

import type { ServiceType } from "@/types/services";
import { useEffect, type ReactNode } from "react";
import Sidebar from "./sidebar";
import { useUIStore } from "@/stores/ui-store";

export function PageLayout({
  children,
  service,
  showSidebar,
}: {
  children: ReactNode;
  service: ServiceType;
  showSidebar: boolean;
}) {
  const {isMobileDrawerOpen, isMobileScreen, toggleMobileDrawer, setMobileScreen} = useUIStore()
  useEffect(() => {
    const checkScreenSize = () => {
      // setMobileScreen(window.innerWidth > 760)
    };
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, [setMobileScreen]);

  return (
    <div className="flex h-screen">
      <div className="hidden lg:block">
        <Sidebar />
      </div>
    </div>
  );
}
