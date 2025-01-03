"use client"; // Needed for `useState`
import { useState } from "react";
import Sidebar from "../Sidebar";
import Navbar from "../Navbar";
import { EmployeePages, UserRole } from "@/utils/types";
import BackButton from "./backbutton";
import { usePathname } from "next/navigation";

interface EmpLayoutProps {
  children: React.ReactNode;
  userRole: UserRole;
  employeeLevel?: number;
  firstName: string;
  lastName: string;
  signOutFunc: () => void;
}

export default function EmpLayout(layoutProps: EmpLayoutProps) {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Function to toggle the sidebar state
  function toggleSidebar() {
    setSidebarCollapsed((prev) => !prev);
  }

  const pathname = usePathname();
  console.log("pathname is ...", pathname);

  // Map the current route to EmployeePages
  const pathToPageMap = {
    "/Employee/Projects": EmployeePages.PROJECTS,
    "/Employee/Training": EmployeePages.TRAINING,
    "/Employee/SponsoredProjects": EmployeePages.SPONSORED_PROJECTS,
    "/Employee/Settings": EmployeePages.SETTINGS,
  };

  const activePage = pathToPageMap[pathname as keyof typeof pathToPageMap];

  return (
    <div className="flex flex-col h-screen">
      {/* Navbar */}
      <Navbar
        initials={
          layoutProps.firstName.charAt(0) + layoutProps.lastName.charAt(0)
        }
        name={`${layoutProps.firstName} ${layoutProps.lastName}`}
        signOutButton={layoutProps.signOutFunc}
        collapsed={isSidebarCollapsed} // Pass collapsed state
        toggleSidebar={toggleSidebar} // Pass toggle function
      />

      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar
          userRole={layoutProps.userRole}
          collapsed={isSidebarCollapsed}
          toggleSidebar={toggleSidebar}
          activePage={activePage}
          employeeLevel={layoutProps.employeeLevel}
        />

        {/* Main Content */}
        <main
          className={`bg-popover flex-1 p-4 transition-all duration-200 ease-in-out rounded-3xl ml-4 mr-4`}
        >
          {/* Back Button */}
          <div className="flex items-center gap-4 mb-4">
            {pathname !== "/Employee/Projects" &&
              pathname !== "/Employee/Training" &&
              pathname !== "/Employee/SponsoredProjects" && (
                <BackButton>← Back</BackButton>
              )}
          </div>

          {/* Page Content */}
          {layoutProps.children}
        </main>
      </div>
    </div>
  );
}
