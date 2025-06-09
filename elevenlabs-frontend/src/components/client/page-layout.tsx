import type { ServiceType } from "@/types/services";
import type { ReactNode } from "react";
import Sidebar from "./sidebar";

export function PageLayout({children, service, showSidebar}: {children: ReactNode, service: ServiceType, showSidebar: boolean}) {
    return (
      <div className="flex h-screen">
    <div className="hidden lg:block">
        <Sidebar />

    </div>
      </div>
    )
}