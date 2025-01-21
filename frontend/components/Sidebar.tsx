import Link from "next/link";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EmployeePages, UserRole } from "@/utils/types";

interface SidebarProps {
  userRole: UserRole;
  collapsed: boolean;
  // toggleSidebar: () => void;
  activePage: EmployeePages;
  employeeLevel?: number;
}

export default function Sidebar(sideBarProp: SidebarProps) {
  // Define sidebar links based on user role and employee level
  const links =
    sideBarProp.userRole === UserRole.EMPLOYEE
      ? [
          {
            name: EmployeePages.PROJECTS,
            path: "/Employee/Projects",
            svg: (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7"
                viewBox="0 0 24 24"
                fill="currentColor"
                stroke="currentColor"
              >
                <path
                  fill="none"
                  strokeWidth="2"
                  d="M9,15 L9,23 L1,23 L1,15 L9,15 Z M23,15 L23,23 L15,23 L15,15 L23,15 Z M9,1 L9,9 L1,9 L1,1 L9,1 Z M23,1 L23,9 L15,9 L15,1 L23,1 Z"
                />
              </svg>
            ),
          },
          {
            name: EmployeePages.TRAINING,
            path: "/Employee/Training",
            svg: (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7"
                viewBox="0 0 448 512"
                fill="currentColor"
              >
                <path d="M319.4 320.6L224 416l-95.4-95.4C57.1 323.7 0 382.2 0 454.4v9.6c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-9.6c0-72.2-57.1-130.7-128.6-133.8zM13.6 79.8l6.4 1.5v58.4c-7 4.2-12 11.5-12 20.3 0 8.4 4.6 15.4 11.1 19.7L3.5 242c-1.7 6.9 2.1 14 7.6 14h41.8c5.5 0 9.3-7.1 7.6-14l-15.6-62.3C51.4 175.4 56 168.4 56 160c0-8.8-5-16.1-12-20.3V87.1l66 15.9c-8.6 17.2-14 36.4-14 57 0 70.7 57.3 128 128 128s128-57.3 128-128c0-20.6-5.3-39.8-14-57l96.3-23.2c18.2-4.4 18.2-27.1 0-31.5l-190.4-46c-13-3.1-26.7-3.1-39.7 0L13.6 48.2c-18.1 4.4-18.1 27.2 0 31.6z" />
              </svg>
            ),
          },
          ...(sideBarProp.employeeLevel === 3
            ? [
                {
                  name: EmployeePages.SPONSORED_PROJECTS,
                  path: "/Employee/SponsoredProjects",
                  svg: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-7 w-7"
                      viewBox="0 0 384 512"
                      fill="currentColor"
                    >
                      <path d="M336 0H48C21.49 0 0 21.49 0 48v464l192-112 192 112V48c0-26.51-21.49-48-48-48zm0 428.43l-144-84-144 84V54a6 6 0 0 1 6-6h276c3.314 0 6 2.683 6 5.996V428.43z" />
                    </svg>
                  ),
                },
              ]
            : []),
        ]
      : [
          {
            name: "N/A",
            path: "/Dashboard",
            svg: null,
          },
        ];

  return (
    <div
      className={`bg-[#1d1b23] text-white h-full ${
        sideBarProp.collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Sidebar Links */}
      <ul className="space-y-2 pt-4 pr-4 pb-4">
        {links.map((link) => (
          <Link key={link.path} href={link.path}>
            <li
              className={`p-4 pl-4 rounded-br-3xl rounded-tr-3xl ${
                sideBarProp.activePage === link.name ? "bg-[#81c26c]" : ""
              }`}
            >
              <div className="flex items-center space-x-4">
                <span>{link.svg}</span>
                <span
                  className={`${sideBarProp.collapsed ? "hidden" : ""}`}
                >
                  {link.name}
                </span>
              </div>
            </li>
          </Link>
        ))}
      </ul>

      {/* Sidebar Toggle Button */}
      {/* <Button
        size="icon"
        onClick={sideBarProp.toggleSidebar}
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
      >
        {sideBarProp.collapsed ? <ChevronRight /> : <ChevronLeft />}
      </Button> */}
    </div>
  );
}
