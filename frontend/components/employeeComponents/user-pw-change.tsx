"use client"

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client"




const ChangePassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  
  const toggleVisibility = () => setIsVisible(prevState => !prevState);
  const router = useRouter();

  const handleCancel = () => {
    setNewPassword("");
    setConfirmPassword("");
    console.log("textboxes cleaned")
  };

  const handlePasswordReset = async (password: string, confirmPassword: string) => {
    const supabase = await createClient();

    if (!password || !confirmPassword) {
      alert("Please confirm your new password");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: password });

      if (error) { 
        alert("Password update failed");
        console.error("Error updating password:", error);
      } else {
        alert("Password updated successfully");
        setNewPassword("");
        setConfirmPassword("");
        router.refresh();
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="p-4 text-white flex flex-col justify-center">
      <h2 className="text-lg font-semibold underline mb-2">Change Password</h2>
      <div className="px-48 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
    
        {/* New Password */}
        <div className="relative flex flex-col">
          <label htmlFor="new-password" className="font-medium">
            New Password
          </label>
          <div className="relative">
            <input
              id="new-password"
              type={isVisible ? "text" : "password"}
              className="border border-gray-300 rounded px-4 py-2 text-black w-full pr-10"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button
              className="absolute inset-y-0 right-0 flex items-center px-3 text-black focus:outline-none"
              type="button"
              onClick={toggleVisibility}
              aria-label={isVisible ? "Hide password" : "Show password"}
            >
              {isVisible ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="relative flex flex-col">
          <label htmlFor="confirm-password" className="font-medium ">
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="confirm-password"
              type={isVisible ? "text" : "password"}
              className="border border-gray-300 rounded px-4 py-2 text-black w-full pr-10"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              className="absolute inset-y-0 right-0 flex items-center px-3 text-black focus:outline-none"
              type="button"
              onClick={toggleVisibility}
              aria-label={isVisible ? "Hide password" : "Show password"}
            >
              {isVisible ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {/* Cancel/Confirm buttons */}
      <div className="flex justify-end gap-4 mt-6 px-4 pt-4">
        <button
          className="bg-[#E75973] text-white px-8 py-2 mb-6 rounded hover:bg-red-600"
          type="button"
          onClick={() => handleCancel}
        >
          Cancel
        </button>
        <button
          className="bg-[#81C26C] text-white px-8 py-2 mb-6 rounded hover:bg-green-600"
          type="button"
          onClick={() => handlePasswordReset(newPassword, confirmPassword)}
        >
          Confirm
        </button>
      </div>
    </div>
  );
};

export default ChangePassword;
