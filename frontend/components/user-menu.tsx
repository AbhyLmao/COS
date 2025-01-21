import React from "react";
import Link from "next/link";

interface UserMenuProps {
  initials: string;
  onClose: () => void;
  signOutButton: () => void;
  name: string;
}

const UserMenu: React.FC<UserMenuProps> = ({ initials, onClose, signOutButton, name }) => {
  return (
    <>
      {/* Backdrop Overlay */}
      <div 
        className="fixed inset-0 bg-black opacity-50 z-40" 
        onClick={onClose} 
      />
      
      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex justify-center items-center">
        <div className="w-60 bg-gray-900 text-white rounded-lg shadow-lg">
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
              <button className="flex items-center gap-2 w-full text-left text-gray-300 hover:text-white">
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserMenu;
