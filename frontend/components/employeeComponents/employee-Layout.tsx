"use client"; //cause Im using useState, i need to import use Client. Making this page React
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
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false); // true represents collapsed sidebar. false represents expanded sidebar


  function toggleSidebar() {
    setSidebarCollapsed(!isSidebarCollapsed);
  }
  const pathname = usePathname();
  // console.log("pathname is ...", pathname);
  
  // Map the current route to EmployeePages
  const pathToPageMap = {
    "/Employee/Projects": EmployeePages.PROJECTS,
    "/Employee/Training": EmployeePages.TRAINING,
    "/Employee/SponsoredProjects": EmployeePages.SPONSORED_PROJECTS,
    "/Employee/Settings": EmployeePages.SETTINGS,
    "/Employee/CreateProject": EmployeePages.CREATE_PROJECT,
  };

  const activePage = pathToPageMap[pathname as keyof typeof pathToPageMap];

  return (
    <div className="">
       <Navbar
        initials={
          layoutProps.firstName.charAt(0) + layoutProps.lastName.charAt(0)
        }
        name={layoutProps.firstName + " " + layoutProps.lastName}
        signOutButton={layoutProps.signOutFunc}
        toggleSidebar={toggleSidebar} // Pass the toggleSidebar function
        collapsed={isSidebarCollapsed} // Pass the collapsed state
      />
      <div className="flex flex-1">
        <Sidebar
          userRole={layoutProps.userRole}
          collapsed={isSidebarCollapsed}
          activePage={activePage}
          employeeLevel={layoutProps.employeeLevel}
        />

        {/**Main Content */}
        <main
          className={`bg-[#413F46] flex-1 p-4 transition-all duration-200 ease-in-out main-content rounded-3xl  ml-4 mr-4 ${isSidebarCollapsed ? "ml-0" : "ml-200px"}`}
        >
      <div className="flex items-center gap-4 m">
        {pathname !== "/Employee/Projects" && pathname !== "/Employee/Training" && pathname !== "/Employee/SponsoredProjects" && (
          <BackButton>← Back</BackButton>
        )}
        {/* Subheading */}
        
      </div>
          {layoutProps.children}
        </main>
      </div>
    </div>
  );
}
