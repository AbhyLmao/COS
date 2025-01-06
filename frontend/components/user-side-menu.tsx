import React from "react";
import Link from "next/link";

interface SideMenuProps {
  initials: string;
  onClose: () => void;
  signOutButton: () => void;
  name: string;
  isOpen: boolean; // Control visibility of the modal
}

const SideMenu: React.FC<SideMenuProps> = ({ initials, onClose, signOutButton, name, isOpen }) => {
  if (!isOpen) return null; // Don't render if the modal is closed

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose} // Close the modal when clicking the overlay
      ></div>

      {/* Modal Content */}
      <div className="relative w-80 bg-gray-900 text-white rounded-lg shadow-lg">
        <div className="flex items-center justify-between p-3 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#81c26c", color: "white" }}
            >
              {initials}
            </div>
            <span className="font-semibold">{name}</span>
          </div>
          <button className="text-xl font-bold" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="p-4 space-y-3">
          <Link href="/Employee/Settings">
            <button
              className="flex items-center gap-2 w-full text-left text-gray-300 hover:text-white"
              onClick={onClose}
            >
              User Settings
            </button>
          </Link>
          <form action={signOutButton}>
            <button
              className="flex items-center gap-2 w-full text-left text-gray-300 hover:text-white"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SideMenu;
