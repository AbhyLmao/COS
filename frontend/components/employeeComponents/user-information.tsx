"use client"

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

interface UserInfoProps {
    userId: string
  }

export default function UserInfo ({ userId }: UserInfoProps) {
    const [email, setEmail] = useState(""); 
    const [level, setLevel] = useState(null);
    const [department, setDepartment] = useState(null);

    const supabase = createClient();

    useEffect(() => {
        // This will fetch data when the component mounts
        const fetchUserData = async () => {
            const { data: userInfo, error: userError } = await supabase
                .from("Employees")
                .select("email, level, department")
                .eq("employee_id", userId)  // match userid with the employee id
                .single(); // only 1 record returned

            if (userError) {
                console.error("error getting user data:", userError);
            } else {
                setEmail(userInfo.email);
                setLevel(userInfo.level);
                setDepartment(userInfo.department);
            }
        };

        fetchUserData(); 
      }, [userId]);

    return (
        <div>
            <div className="p-4 text-white">
                <h3 className="text-lg font-semibold underline mb-2">Information</h3>
                <div>
                    <p className="mb-1">
                        <span className="font-medium">Email: </span>
                        <span className="text-gray-400">{email}</span>
                    </p>
                    <p className="mb-1">
                        <span className="font-medium">Department: </span>
                        <span className="text-gray-400"> {department}</span>
                        {/* db needs department */}
                    </p>
                    <p className="mb-1">
                        <span className="font-medium">Level: </span>
                        <span className="text-gray-400">{level}</span>
                    </p>
                </div>
            </div>
        </div>
    );
}


