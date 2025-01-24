import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";
import { Button } from "./ui/button";
import React, { useState } from "react";
import UserMenu from "./user-menu";

interface NavbarProperities {
  initials: string;
  signOutButton: () => void;
  name: string;
}

export default function Navbar({ initials, signOutButton, name }: NavbarProperities) {
  const [isMenuOpen, setMenuOpen] = useState(false);

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <nav className="w-full flex justify-center border-b-foreground/10 h-16">
      <div className="w-full max-w-8xl flex justify-between items-center px-6 text-sm text-white">
        <div className="flex items-center gap-16">
          <img 
            src="/ttg-logo.png" 
            alt="Tartigrade Limited" 
            className="w-[17.5%]"
          />
          <span className="text-white text-xl tracking-[0.2em]">
            Capstone Onboarding System
          </span>
        </div>

        <div className="relative flex items-center gap-6 -ml-20">

          {/* <ThemeSwitcher/> */}

          <span className="text-white">{currentDate}</span>

          {/* <button
            className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-gray-600 relative"
            aria-label="Notifications"
            onClick={() => alert("The notification feature is being developed (maybe)")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10 2a6 6 0 00-6 6v4.586l-.707.707A1 1 0 004 15h12a1 1 0 00.707-1.707L16 12.586V8a6 6 0 00-6-6zM7.293 16a1 1 0 101.414 1.414A1.5 1.5 0 0012 17a1.5 1.5 0 00-.707-1.293 1 1 0 101.414-1.414A3.5 3.5 0 0110 18a3.5 3.5 0 01-2.707-1.293z" />
            </svg>
            
            <span className="absolute top-0.5 right-1 block w-2.5 h-2.5 rounded-full"style={{ backgroundColor: "#E75973" }}></span>
          </button> */}
          
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center shadow-md"
            style={{ backgroundColor: "#81c26c", color: "white" }}
            onClick={() => setMenuOpen(!isMenuOpen)}
          >
            {initials}
          </button>

          {isMenuOpen && (
            <div className="fixed top-0 right-0">
            <UserMenu
              initials={initials}
              onClose={() => setMenuOpen(false)}
              signOutButton={signOutButton}
              name={name}
            />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
