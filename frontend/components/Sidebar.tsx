import { EmployeePages, UserRole } from "@/utils/types";
import Link from "next/link";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SidebarProps {
  userRole: UserRole;
  collapsed: boolean;
  toggleSidebar: () => void;
  activePage: EmployeePages;
  employeeLevel?: number;
}

export default function Sidebar(sideBarProp: SidebarProps) {
  let links = sideBarProp.userRole === UserRole.EMPLOYEE
      ? [
          { name: EmployeePages.PROJECTS, path: "/Dashboard" },
          { name: EmployeePages.TRAINING, path: "/Training" },
          ...(sideBarProp.employeeLevel === 3
            ? 
            [{ name: EmployeePages.SPONSORED_PROJECTS, path: "/SponsoredProjects" }]
            : 
            []),
        ]
      : // else the user is an student
        [{ name: "N/A", path: "/Dashboard" }];

  return (
    <div
      className={`bg-gray-800 text-white h-full ${sideBarProp.collapsed ? "w-1/12" : "w-64"}`}
    >
      <ul className="space-y-2 p-4">
        {links.map((link) => (
          <li
            key={link.path}
            className={`p-2 rounded ${sideBarProp.activePage === link.name ? "bg-gray-700" : ""}`}
          >
            <Link href={link.path}>{link.name}</Link>
          </li>
        ))}
      </ul>
      <Button
        size={"icon"}
        onClick={() => {
          sideBarProp.toggleSidebar();
        }}
      >
        {!sideBarProp.collapsed ? <ChevronLeft /> : <ChevronRight />}
      </Button>
    </div>
  );
}
