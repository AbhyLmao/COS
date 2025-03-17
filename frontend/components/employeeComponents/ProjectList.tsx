"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { createClient } from "@/utils/supabase/client";
// import { DropdownFilter } from '@/components/employeeComponents/Projectfilter';
import { Department_Types } from "@/utils/types";
import { Project_Status } from "@/utils/types";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VisuallyHidden } from "radix-ui";

type Project = {
  id: string;
  date: string;
  name: string;
  department: string;
  status: string;
  sponsor: string;
  term: string;
};

export function ProjectsList({
  searchTerm,
  filter,
  dateRange,
  userLevel
}: {
  searchTerm: string;
  filter: string;
  dateRange: { startDate: Date | null; endDate: Date | null };
  userLevel: number;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<"date" | "name" | "term">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [sponsorToggle, setSponsorToggle] = useState(false);
  const [loading, setLoading] = useState(false);

  const [isOpenS, setIsOpenS] = useState(false);
  const [isOpenD, setIsOpenD] = useState(false);

  const supabase = createClient();

  const departmentOptions = Object.values(Department_Types);
  const statusOptions = Object.values(Project_Status);

  const fetchProjects = async () => {
    // console.log('Fetching projects...');
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("Projects")
        .select("project_id, created_date, title, department, status, sponsor_email, start_term");

      if (error) {
        // console.error('Error fetching projects:', error);
      } else if (data) {
        // console.log('Fetched projects:', data);
        setProjects(
          data.map((project) => ({
            id: project.project_id,
            date: project.created_date,
            name: project.title,
            department: project.department,
            status: project.status,
            sponsor: project.sponsor_email,
            term: project.start_term
          }))
        );
      }
    } catch (err) {
      // console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const projectsPerPage = 6;

  const handleSort = (column: "date" | "name" | "term") => {
    if (sortColumn === column) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  const sortedProjects = [...projects].sort((a, b) => {
    const valueA = a[sortColumn];
    const valueB = b[sortColumn];
  
    const isEmptyA = valueA === null || valueA === "";
    const isEmptyB = valueB === null || valueB === "";
  
    if (isEmptyA && isEmptyB) return 0;
    if (isEmptyA) return sortOrder === "asc" ? -1 : 1;
    if (isEmptyB) return sortOrder === "asc" ? 1 : -1;
    
    return valueA < valueB ? (sortOrder === "asc" ? -1 : 1) : (sortOrder === "asc" ? 1 : -1);
  });

  const filteredProjects = sortedProjects.filter((project) => {
    const projectDate = new Date(project.date);

    const matchesDate =
      (!dateRange.startDate || projectDate >= dateRange.startDate) &&
      (!dateRange.endDate || projectDate <= dateRange.endDate);

    const matchesDepartment =
      selectedDepartments.length === 0 ||
      selectedDepartments.includes(project.department);

    const matchesStatus =
      selectedStatus.length === 0 || selectedStatus.includes(project.status);

    const matchesSearchTerm =
      filter === "date"
        ? true
        : searchTerm === "" ? true : 
          (searchTerm.toLowerCase() === "t" || searchTerm.toLowerCase() === "tb" || searchTerm.toLowerCase() === "tbd") && filter === "term" ? !project[filter as keyof Project] :
          (project[filter as keyof Project]? 
          project[filter as keyof Project]
            ?.toString()
            ?.toLowerCase()
            ?.includes(searchTerm.toLowerCase()) : 
          project[filter as keyof Project]
            ?.toString()
            ?.includes(searchTerm.toLowerCase()));

    const matchesSponsor = sponsorToggle ? project.sponsor === null : true;

    return (
      matchesDate && matchesDepartment && matchesStatus && matchesSearchTerm && matchesSponsor
    );
  });

  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);

  const currentProjects =
    filteredProjects.length > 0
      ? filteredProjects.slice(
          (currentPage - 1) * projectsPerPage,
          currentPage * projectsPerPage
        )
      : [];

  const handleClearFilters = () => {
    setSelectedDepartments([]);
    setSelectedStatus([]);
  };

  const handleSetSponsorToggle = () => {
    setSponsorToggle(!sponsorToggle);
  }

  const departmentColors: { [key: string]: string } = {
    ENGINEERING: "#FFA767",
    COMPUTER_SCIENCE: "#63B3FF",
    BIOMEDICAL: "#E75973",
    SUSTAINABILITY: "#81C26C",
  };

  const statusColors: { [key: string]: string } = {
    NEW: "#788292",
    DRAFT: "white",
    REVIEW: "#D7B634",
    APPROVED: "#81C26C",
    REJECTED: "#E75973",
    DISPATCHED: "#000080",
    AWARDED: "#4B006E",
    ACTIVE: "#008080",
    COMPLETED: "#154406",
    CANCELLED: "black",
  };

  function handleSelectStatus(option: Project_Status) {
    setSelectedStatus((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  }

  function handleSelectDepartment(option: Department_Types) {
    setSelectedDepartments((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  }

  return (
    <div
      className="space-y-1 rounded-3xl mt-4 px-4 pb-4"
      style={{ backgroundColor: "#1d1b23" }}
    >
      {loading ? (
        <p>Loading projects...</p>
      ) : (
        <>
          <Table
            style={{ tableLayout: 'fixed', width: '100%'}}
          >
            <TableHeader>
              <TableRow style={{ backgroundColor: "#1d1b23" }}>
                <TableHead
                  onClick={() => handleSort("date")}
                  className="cursor-pointer rounded-tl-2xl rounded-bl-2xl text-white"
                  style={{ width: '11%' }}
                >
                  {sortColumn === "date"
                    ? `Date ${sortOrder === "asc" ? "▲" : "▼"}`
                    : "Date ▲▼"}
                </TableHead>
                <TableHead
                  onClick={() => handleSort("term")}
                  className="cursor-pointer rounded-tl-2xl rounded-bl-2xl text-white"
                  style={{ width: '9.5%' }}
                >
                  {sortColumn === "term"
                    ? `Term ${sortOrder === "asc" ? "▲" : "▼"}`
                    : "Term ▲▼"}
                </TableHead>
                <TableHead
                  onClick={() => handleSort("name")}
                  className="cursor-pointer text-white"
                  style={{ width: '30.5%' }}
                >
                  {sortColumn === "name"
                    ? `Project Name ${sortOrder === "asc" ? "▲" : "▼"}`
                    : "Project Name ▲▼"}
                </TableHead>
                <TableHead style={{ width: '17.5%' }}>
                  <DropdownMenu open={isOpenD} onOpenChange={setIsOpenD}>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="text-white pr-4 py-2 rounded flex items-center justify-between focus:outline-none"
                        onClick={() => setIsOpenD((prev) => !prev)}
                      >
                        <span>Department</span>
                        <span
                          className={`ml-2 ${selectedDepartments.length > 0 ? "text-[#E75973]" : "text-white"}`}
                        >
                          {isOpenD ? "▲" : "▼"}
                        </span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="max-w-50 bg-[#1D1B23] bg-opacity-100 mt-2"
                      onCloseAutoFocus={(e) => e.preventDefault()}
                    >
                      {/* <DropdownMenuSeparator /> */}
                      {departmentOptions.map((department) => (
                        <DropdownMenuCheckboxItem
                          key={department}
                          checked={selectedDepartments.includes(department)}
                          onCheckedChange={() =>
                            handleSelectDepartment(department)
                          }
                          onSelect={(e) => e.preventDefault()}
                          className="text-white"
                          colorMap={departmentColors}
                        >
                          {department}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableHead>
                <TableHead style={{ width: '12.5%' }}>
                  <DropdownMenu open={isOpenS} onOpenChange={setIsOpenS}>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="text-white pr-4 py-2 rounded flex items-center justify-between focus:outline-none"
                        onClick={() => setIsOpenS((prev) => !prev)}
                      >
                        <span>Status</span>
                        <span
                          className={`ml-2 ${selectedStatus.length > 0 ? "text-[#E75973]" : "text-white"}`}
                        >
                          {isOpenS ? "▲" : "▼"}
                        </span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="max-w-44 bg-[#1D1B23] bg-opacity-100 mt-2"
                      onCloseAutoFocus={(e) => e.preventDefault()}
                    >
                      {/* <DropdownMenuSeparator /> */}
                      {statusOptions.map((status) => (
                        <DropdownMenuCheckboxItem
                          key={status}
                          checked={selectedStatus.includes(status)}
                          onCheckedChange={() => handleSelectStatus(status)}
                          onSelect={(e) => e.preventDefault()}
                          className="text-white"
                          colorMap={statusColors}
                        >
                          {status}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableHead>
                <TableHead className="rounded-tr-2xl rounded-br-2xl"
                  style={{ width: '19%' }}
                >
                  <div className="flex justify-between">
                    <button
                      className="rounded flex items-center space-x-2"
                      onClick={handleClearFilters}
                      disabled={
                        selectedDepartments.length === 0 &&
                        selectedStatus.length === 0
                      } // Disable when no filters are selected
                    >
                      <span
                        className={`${selectedDepartments.length === 0 && selectedStatus.length === 0 ? "text-gray-400" : "text-white"}`}
                      >
                        Clear
                      </span>
                      <span
                        className={`${
                          selectedDepartments.length === 0 &&
                          selectedStatus.length === 0
                            ? "bg-gray-400 text-gray-200"
                            : "bg-[#E75973] text-white"
                        } rounded-full h-4 w-4 flex items-center justify-center text-[12px]`}
                      >
                        ×
                      </span>
                    </button>
                    {userLevel >= 3 && <div>
                      <button
                        onClick={handleSetSponsorToggle}
                        className={`${sponsorToggle === false ? "bg-[#1d1b23] hover:bg-gray-500" : "bg-gray-500 hover:bg-gray-300"} outline rounded-lg p-1 ml-2 `}
                      >
                        Unsponsored
                      </button>
                    </div>}
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentProjects.length > 0 ? (
                currentProjects.map((project) => (
                  <TableRow
                    key={project.id}
                    style={{
                      backgroundColor: "#413F46",
                      color: "white",
                    }}
                  >
                    <TableCell
                      style={{
                        borderTopLeftRadius: "0.5rem",
                        borderBottomLeftRadius: "0.5rem",
                        width: "11%",
                        padding: "10px",
                        paddingLeft: "20px"
                      }}
                    >
                      {new Date(project.date)
                        .toLocaleString("en-US", {
                          month: "2-digit",
                          day: "2-digit",
                          year: "numeric",
                        })
                        .substring(0, 10)}
                    </TableCell>
                    <TableCell
                      style={{
                        width: "9.5%",
                        padding: "10px",
                      }}
                    >
                      {project.term? project.term : "TBD"}
                    </TableCell>
                    <TableCell
                      style={{
                        width: '30.5%',
                        padding: '10px',
                        overflow: 'auto',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {project.name}
                    </TableCell>
                    <TableCell 
                      style={{
                        width: '17.5%',
                        padding: '10px'
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: departmentColors[project.department],
                          display: "inline-block",
                          color: "white",
                          padding: "0.25rem 0.75rem",
                          borderRadius: "1.0rem",
                        }}
                      >
                        {project.department}
                      </div>
                    </TableCell>
                    <TableCell
                      style={{
                        width: '12.5%',
                        padding: '10px'
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: statusColors[project.status],
                          display: "inline-block",
                          color: project.status === "DRAFT" ? "black" : "white",
                          padding: "0.25rem 0.75rem",
                          borderRadius: "1.0rem",
                        }}
                      >
                        {project.status}
                      </div>
                    </TableCell>
                    <TableCell
                      style={{
                        borderTopRightRadius: "0.5rem",
                        borderBottomRightRadius: "0.5rem",
                        width: '19%',
                        padding: '10px',
                        // paddingRight: '20px'
                      }}
                    >
                      <button className="outline rounded-lg p-0.5 px-2 bg-[#1D1B23]">
                        <Link href={`/Employee/Projects/${project.id}`}>Project Details</Link>
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-7 text-center text-gray-500 rounded-2xl"
                  >
                    No matching projects
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <Pagination className="text-white">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  className={
                    currentPage === 1 ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>
              {[...Array(totalPages)].map((_, index) => (
                <PaginationItem key={index}>
                  <PaginationLink
                    href="#"
                    onClick={() => setCurrentPage(index + 1)}
                    isActive={currentPage === index + 1}
                  >
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </>
      )}
    </div>
  );
}
