"use client";

import { IoSettings } from "react-icons/io5";

interface MobileSettingsButtonProps {
  toggleMobileMenu: () => void;
}

export function MobileSettingsButton({ toggleMobileMenu }: MobileSettingsButtonProps) {
  return (
    <button
      onClick={toggleMobileMenu}
      className="fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-black text-white shadow-lg transition-all hover:bg-gray-800 active:scale-95 lg:hidden"
      aria-label="Open settings"
    >
      <IoSettings className="h-5 w-5" />
    </button>
  );
} 