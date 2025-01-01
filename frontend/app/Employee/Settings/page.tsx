"use client"; // Marks the component as a client component

import Headingbar from "@/components/employeeComponents/Headingbar";
import {createClient} from '@/utils/supabase/client';
import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";


export default function SettingsPage() {
  const [email, setEmail] = useState(""); 
  const [level, setLevel] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => setIsVisible(prevState => !prevState);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      // get session stuff
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        console.error("error...", sessionError);
        return;
      }

      // from session stuff, get user id
      const userId = session.user.id; 

      // Step 2: Query the employees table for this user
      const { data, error } = await supabase
        .from("Employees")
        .select("email, level")
        .eq("employee_id", userId)  // match userid with the employee id
        .single(); // only 1 record returned

      if (error) {
        console.error("error getting user data:", error);
      } else {
        setEmail(data.email); 
        setLevel(data.level); 
      }
    };

    fetchData();
  }, []); 

  const handleCancel = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <>
      <Headingbar text="Settings" />

      {/* Start of user info */}
      <div className="p-4 text-white">
        <h3 className="text-lg font-semibold underline mb-2">Information</h3>
        <div>
          <p className="mb-1">
            <span className="font-medium">Email: </span>
            <span className="text-gray-400">{email}</span>
          </p>
          <p className="mb-1">
            <span className="font-medium">Department: </span>
            <span className="text-gray-400"> Placeholder Department</span>
            {/* db needs department */}
          </p>
          <p className="mb-1">
            <span className="font-medium">Level: </span>
            <span className="text-gray-400">{level}</span>
          </p>
        </div>
      </div>

      {/* start of change password */}
      <div className="p-4 text-white">
        <h2 className="text-lg font-semibold underline mb-2">Change Password</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
          {/* Current Password */}
          <div className="relative flex flex-col">
            <label htmlFor="current-password" className="font-medium">
              Current Password
            </label>
            <div className="relative">
              <input
                id="current-password"
                type={isVisible ? "text" : "password"}
                className="border border-gray-300 rounded px-4 py-2 text-black w-full pr-10"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <button
                className="absolute inset-y-0 right-0 flex items-center px-3 text-black focus:outline-none"
                type="button"
                onClick={toggleVisibility}
                aria-label={isVisible ? "Hide password" : "Show password"}
              >
                {isVisible ? (
                  <EyeOff size={20} aria-hidden="true" />
                ) : (
                  <Eye size={20} aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

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
                {isVisible ? (
                  <EyeOff size={20} aria-hidden="true" />
                ) : (
                  <Eye size={20} aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="relative flex flex-col">
            <label htmlFor="confirm-password" className="font-medium">
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
                {isVisible ? (
                  <EyeOff size={20} aria-hidden="true" />
                ) : (
                  <Eye size={20} aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
      

      {/* cancel/confirm button */}
      <div className="flex justify-between items-center mt-6 px-4">
        {/* Cancel Button */}
        <button
          className="bg-red-500 text-white px-8 py-2 mb-6 rounded hover:bg-red-600 "
          type="button"
          onClick={() => handleCancel()}
        >
          Cancel
        </button>

        {/* Confirm Button */}
        <button
          className="bg-green-500 text-white px-8 py-2 mb-6 rounded hover:bg-green-600 "
          type="button"
          onClick={() => handleConfirm()}
        >
          Confirm
        </button>
      </div>
    </>
  );
}
