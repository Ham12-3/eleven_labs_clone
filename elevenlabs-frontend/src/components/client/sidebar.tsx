"use client";

import { useState, type ReactNode } from "react";
import { IoPintOutline } from "react-icons/io5";

export default function Sidebar({ isMobile = false }: { isMobile?: boolean }) {
  const [isPinned, setIsPinned] = useState(true);

  const [isHovered, setIsHovered] = useState(false);

  const isExpanded = isMobile || isPinned || isHovered;

  return (
    <div
      className={`${isExpanded ? "w-64" : "w-16"} flex h-full flex-col border-r border-gray-200 bg-white px-3 py-4 transition-all duration-300`}
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
    >
      <div className="flex items-center justify-between">
        <h1 className={`fon-bold text-xl ${!isExpanded && "hidden"}`}>
          11Labs
        </h1>
        {!isMobile && (
          <button
            onClick={() => setIsPinned}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-all hover:bg-gray-100"
            title={isPinned ? "Unpin sidebar" : "Pin sidebar"}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center transition-all ${isPinned ? "rounded-lg bg-gray-200" : "text-gray-500"}`}
            >
              {isExpanded ? (
                <IoPintOutline className="h-5 w-5" />
              ) : (
                <div className="flex h-fit w-fit items-center justify-center rounded-lg bg-white px-3 py-2 shadow">
                  <span className="text-md font-bold text-black">11</span>
                </div>
              )}
            </div>
          </button>
        )}
      </div>


      {/* Navigation  */}


      <nav className="mt-8 flex-1 flex-col ">

      </nav>
    </div>
  );
}


function SectionHeader({children, isExpanded}: {children: ReactNode, isExpanded: boolean}) {
  return (
 <div className="mb-2 mt-4 h-6 pl-4">

    <span className={`text-sm text-gray-500 transition-opacity duration-200`}></span>

 </div>
  );

}
