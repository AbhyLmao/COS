import { EmployeePages, UserRole } from "@/utils/types";
import Link from "next/link";

interface SidebarProps {
  userRole: UserRole;
  collapsed: boolean;
  toggleSidebar: () => void; // No longer used here
  activePage: EmployeePages;
  employeeLevel?: number;
}

export default function Sidebar({ userRole, collapsed, activePage, employeeLevel }: SidebarProps) {
  const links =
    userRole === UserRole.EMPLOYEE
      ? [
          { name: EmployeePages.PROJECTS, path: "/Employee/Projects" },
          { name: EmployeePages.TRAINING, path: "/Employee/Training" },
          ...(employeeLevel === 3
            ? [{ name: EmployeePages.SPONSORED_PROJECTS, path: "/Employee/SponsoredProjects" }]
            : []),
        ]
      : [{ name: "N/A", path: "/Dashboard" }];

  return (
    <div
      className={` text-white h-full overflow-hidden transition-all duration-300 ${
        collapsed ? "w-0" : "w-64"
      }`}
    >
      <div className={`flex flex-col h-full ${collapsed ? "hidden" : "block"}`}>
        <ul className="space-y-2 p-4">
          {links.map((link) => (
            <li
              key={link.path}
              className={`p-2 rounded ${
                activePage === link.name ? "bg-gray-700" : ""
              }`}
            >
              <Link href={link.path}>{link.name}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
