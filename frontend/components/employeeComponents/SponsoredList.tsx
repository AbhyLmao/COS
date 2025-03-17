'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

import { createClient } from '@/utils/supabase/client'
// import { DropdownFilter } from '@/components/employeeComponents/Projectfilter';
import { Project_Status } from '@/utils/types';
import { Universities } from '@/utils/types';
import TeamMenu from '@/components/employeeComponents/team-menu';

import { FaGoogleDrive, FaGithub } from "react-icons/fa";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Project = {
  id: string;
  name: string;
  team: string;
  status: string;
  drive: string;
  git: string;
  members: Members[];
  university: string;
};

type Members = {
  full_name: string;
  role: string;
  email: string;
  ttg: string;
};

type Team = {
  team_name: string;
  university: string;
  members: Members[];
  supervisor_name: string;
  supervisor_email: string;
  nda: string;
  team_lead: string;
}

export function SponsoredList({ searchTerm, filter }: { searchTerm: string; filter: string;}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<'team' | 'name'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [projects, setProjects] = useState<Project[]>([]);
  const [teams, setTeams] = useState<Team | null>(null);
  const [title, setTitle] = useState<string>();
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedUniversity, setSelectedUniversity] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);

  const supabase = createClient();

  const statusOptions = Object.values(Project_Status);
  const universityOptions = [...Object.values(Universities), "Not Dispatched"];

  const fetchProjects = async () => {
    console.log('Fetching projects...');
    setLoading(true);
    try {
        const {
            data: { session },
            error: sessionError,
        } = await supabase.auth.getSession();
    
        if (sessionError || !session) {
            console.error("Error getting session:", sessionError);
            return;
        }
    
        const userId = session.user.id;
        const { data: userData, error: userError } = await supabase
        .from("Employees")
        .select("email")
        .eq("employee_id", userId)
        .single();
    
        if (userError || !userData) {
        console.error("Error getting user data:", userError);
        return;
        }
    
        const userEmail = userData.email;
        console.log('Got user email: ', userEmail);

        const { data, error } = await supabase
        .from('Projects')
        .select(`
          project_id, 
          title, 
          status, 
          github, 
          google_link, 
          university, 
          Teams!Projects_awarded_team_id_fkey(
            team_name, 
            Students(team_id, full_name, role, email, ttg:ttg_email)
          )
        `)
        .eq('sponsor_email', userEmail);

        if (error) {
            console.error('Error fetching projects:', error);
        } else if (data) {
            console.log('Fetched projects:', data);
            setProjects(
              data.map((project) => ({
                id: project.project_id,
                name: project.title,
                team: (project.Teams as unknown as { team_name: string } | null)?.team_name ?? '**Project Not Awarded**',
                status: project.status,
                drive: project.google_link,
                git: project.github,
                members: (project.Teams as unknown as { Students: Members[]} | null)?.Students?.map((student: { full_name: any; role: any; email: any; ttg: any }) => ({
                  full_name: student.full_name,
                  role: student.role,
                  email: student.email,
                  ttg: student.ttg,
                })) ?? [],                
                university: project.university,
              }))
            ); 
            console.log("PROJECTS: ", projects)       
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchTitle = async ( projectId: string ) => {
    console.log('Fetching title...');
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        console.error("Error getting session: ", sessionError);
        return;
      }

      const { data: titleData, error: titleError } = await supabase
        .from('Projects')
        .select(`title`)
        .eq('project_id', projectId)
        .single()

      if (titleError) {
        console.error('Error fetching title:', titleError);
      } else if (titleData) {
        console.log('Fetched title:', titleData);

        setTitle(titleData.title);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };

  const fetchTeams = async ( projectId: string ) => {
    console.log('Fetching teams...');
    try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session) {
          console.error("Error getting session: ", sessionError);
          return;
        }

        const { data: teamsData, error: teamsError } = await supabase
          .from('Teams')
          .select(`
            team_name,
            supervisor_name,
            supervisor_email,
            Students(full_name, role, email, ttg_email),
            Projects!Teams_project_id_fkey(university),
            nda_file,
            team_lead_email
          `)
          .eq('project_id', projectId)
          .single();
            
        if (!teamsData) {
          console.warn("No approved team found for this project.");
          setTeams(null);
          return;
        } else if (teamsError) {
          console.error("Error fetching teams: ", teamsError);
          setTeams(null);
          return;
        } else if (teamsData) {
          console.log("Teams data: ", teamsData)
          const members = teamsData.Students || [];
          const memberDetails = members.map((member: any) => ({
            full_name: member.full_name,
            role: member.role,
            email: member.email,
            ttg: member.ttg_email,
      }));
          setTeams({
            team_name: teamsData.team_name,
            university: (teamsData.Projects as unknown as { university: string } | null)?.university ?? 'N/A',
            members: memberDetails,
            supervisor_name: teamsData.supervisor_name ?? "N/A",
            supervisor_email: teamsData.supervisor_email ?? "N/A",
            nda: teamsData.nda_file,
            team_lead: teamsData.team_lead_email
          });
        }
    } catch (err) {
      console.error('Unexpected error: ', err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const projectsPerPage = 6;

  const handleSort = (column: 'team' | 'name') => {
    if (sortColumn === column) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortOrder('asc');
    }
  };

  const sortedProjects = [...projects].sort((a, b) => {
    const valueA = a[sortColumn];
    const valueB = b[sortColumn];

    if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredProjects = sortedProjects.filter((project) => {
    // console.log("test: ", project)
    const matchesNullUni = selectedUniversity.includes("Not Dispatched") && !project.university;
    const matchesUni = selectedUniversity.length === 0 || selectedUniversity.includes(project.university) || matchesNullUni;
    const matchesStatus = selectedStatus.length === 0 || selectedStatus.includes(project.status);
    const matchesFilter = matchesStatus && matchesUni;

  
    const searchTermLower = searchTerm.toLowerCase().trim();
  
    const matchesSearchTerm = (() => {
      if (!searchTermLower) {
        return true;
      }
  
      if (filter === "member") {
        return (
          project.members?.some((member) =>
            member.full_name.toLowerCase().includes(searchTermLower)
          ) ?? false
        );
      }

      if (filter === "email") {
        return (
          project.members?.some((member) =>
            member.email.toLowerCase().includes(searchTermLower)
          ) ?? false
        );
      }

      if (filter === "ttg") {
        return (
          project.members?.some((member) =>
            member.ttg? member.ttg.toLowerCase().includes(searchTermLower) : false
          ) ?? false
        );
      }
  
      return project[filter as keyof Project]
        ?.toString()
        ?.toLowerCase()
        ?.includes(searchTermLower);
    })();
  
    return matchesFilter && matchesSearchTerm;
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
    setSelectedStatus([]);
    setSelectedUniversity([]);
  };

  const statusColors: { [key: string]: string } = {
    NEW: '#788292',
    DRAFT: 'white',
    REVIEW: '#D7B634',
    APPROVED: '#81C26C',
    REJECTED: '#E75973',
    DISPATCHED: '#000080',
    AWARDED: '#4B006E',
    ACTIVE: '#008080',
    COMPLETED: '#154406',
    CANCELLED: 'black',
  };

  const uniColors: { [key: string]: string } = {
    // alternate colors include UofC (#ffcd00), SAIT (#6d2077)
    "University of Calgary": "#d6001c" ,
    "University of British Columbia": "#002145",
    "University of Toronto": "#1e3765",
    "York University": "#e31837",
    "Ontario Tech University": "#e75d2a",
    "University of Alberta": "#007c41",
    "Southern Alberta Institute of Technology": "#da291c",
    null: "#99a1af"
  };

  const uniShort: { [key: string]: string } = {
    "University of Calgary": "UofC" ,
    "University of British Columbia": "UBC",
    "University of Toronto": "UofT",
    "York University": "York",
    "Ontario Tech University": "ON Tech",
    "University of Alberta": "UofA",
    "Southern Alberta Institute of Technology": "SAIT",
  };
  
  const handleTeamDetails = async (projectId: string) => {
    await fetchTitle(projectId);
    await fetchTeams(projectId);
    setMenuOpen(true); // Open the menu
    // console.log('fetched team: ', teams);
  };

  function handleSelectStatus(option: Project_Status){
    setSelectedStatus((prev) => prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]
  );}

  function handleSelectUniversity(option: string) {
    if (!Object.values(Universities).includes(option as Universities)) {
      console.warn("Warning: Selected university is not in the predefined enum.");
    }
  
    setSelectedUniversity((prev) =>
      prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]
    );
  }
      
  return (
    <div className="space-y-1 rounded-3xl mt-4 px-4 pb-4" style={{ backgroundColor: '#1d1b23' }}>
      {loading ? (
        <p>Loading projects...</p>
      ) : (
        <>
          <Table
            style={{ tableLayout: 'fixed', width: '100%'}}
          >
            <TableHeader>
              <TableRow style={{ backgroundColor: '#1d1b23' }}>
                <TableHead onClick={() => handleSort('name')} className="cursor-pointer rounded-tl-2xl rounded-bl-2xl text-white"
                  style={{ width: '30%' }}
                >
                  {sortColumn === 'name'
                    ? `Project Name ${sortOrder === 'asc' ? '▲' : '▼'}`
                    : 'Project Name ▲▼'}
                </TableHead>
                <TableHead onClick={() => handleSort('team')} className="cursor-pointer text-white"
                  style={{ width: '22.5%' }}
                >
                  {sortColumn === 'team'
                    ? `Team Name ${sortOrder === 'asc' ? '▲' : '▼'}`
                    : 'Team Name ▲▼'}
                </TableHead>
                <TableHead style={{ width: '12.5%' }}>
                  <DropdownMenu open={isOpen2} onOpenChange={setIsOpen2}>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="text-white pr-4 py-2 rounded flex items-center justify-between focus:outline-none"
                        onClick={() => setIsOpen2((prev) => !prev)}
                      >
                        <span>University</span>
                        <span
                          className={`ml-2 ${
                            selectedUniversity.length > 0 ? 'text-[#E75973]' : 'text-white'
                          }`}
                        >
                          {isOpen2 ? '▲' : '▼'}
                        </span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="max-w-44 bg-[#1D1B23] bg-opacity-100 mt-2" onCloseAutoFocus={(e) => e.preventDefault()}>
                      {/* <DropdownMenuSeparator /> */}
                      {universityOptions.map((university) => (
                        <DropdownMenuCheckboxItem
                          key={university}
                          checked={selectedUniversity.includes(university)}
                          onCheckedChange={() => handleSelectUniversity(university)}
                          onSelect={(e) => e.preventDefault()}
                          className="text-white"
                          colorMap={uniColors}
                        >
                          {university}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableHead>
                <TableHead style={{ width: '12.5%' }}>
                  <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="text-white pr-4 py-2 rounded flex items-center justify-between focus:outline-none"
                        onClick={() => setIsOpen((prev) => !prev)}
                      >
                        <span>Status</span>
                        <span
                          className={`ml-2 ${
                            selectedStatus.length > 0 ? 'text-[#E75973]' : 'text-white'
                          }`}
                        >
                          {isOpen ? '▲' : '▼'}
                        </span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="max-w-44 bg-[#1D1B23] bg-opacity-100 mt-2" onCloseAutoFocus={(e) => e.preventDefault()}>
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
                  style={{ width: '22.5%' }}
                >
                  <button
                    className="px-4 py-2 rounded flex items-center space-x-2"
                    onClick={handleClearFilters}
                    disabled={ selectedStatus.length === 0 && selectedUniversity.length === 0} // Disable when no filters are selected
                  >
                    <span
                      className={`${
                        selectedStatus.length === 0 && selectedUniversity.length === 0
                          ? 'text-gray-400'
                          : 'text-white'
                      }`}
                    >
                      Clear
                    </span>
                    <span
                      className={`${
                        selectedStatus.length === 0 && selectedUniversity.length === 0
                          ? 'bg-gray-400 text-gray-200'
                          : 'bg-[#E75973] text-white'
                      } rounded-full h-4 w-4 flex items-center justify-center text-[12px]`}
                    >
                      ×
                    </span>
                  </button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentProjects.length > 0 ? (
                currentProjects.map((project) => (
                  <TableRow
                    key={project.id}
                    style={{
                      backgroundColor: '#413F46',
                      color: 'white',
                    }}
                  >
                    <TableCell 
                      style={{ 
                        borderTopLeftRadius: '0.5rem', 
                        borderBottomLeftRadius: '0.5rem',
                        padding: '10px',
                        paddingLeft: '20px',
                        width: '30%',
                        overflow: 'auto', // Hide overflowing text
                        whiteSpace: 'nowrap', // Prevents text from wrapping to new lines
                      }}
                    >
                      {project.name}
                    </TableCell>
                    <TableCell
                      style={{ 
                        padding: '10px',
                        width: '22.5%',
                        overflow: 'auto', // Hide overflowing text
                        whiteSpace: 'nowrap', // Prevents text from wrapping to new lines
                      }}
                    >
                      {project.team}
                    </TableCell>
                    <TableCell
                      style={{ 
                        padding: '10px',
                        width: '12.5%'
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: uniColors[project.university],
                          display: 'inline-block',
                          // color: project.university === null ? 'black' : 'white',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '1.0rem',
                        }}
                      >
                        {uniShort[project.university] || "**TBD**"}
                      </div>
                    </TableCell>
                    <TableCell
                      style={{ 
                        padding: '10px',
                        width: '12.5%'
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: statusColors[project.status],
                          display: 'inline-block',
                          color: project.status === 'DRAFT' ? 'black' : 'white',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '1.0rem',
                        }}
                      >
                        {project.status}
                      </div>
                    </TableCell>
                    <TableCell
                      style={{ 
                        borderTopRightRadius: '0.5rem',
                        borderBottomRightRadius: '0.5rem',
                        padding: '10px',
                        paddingRight: '20px',
                        width: '22.5%'
                      }}
                    >
                      <div className="flex justify-between">
                        <button className="outline rounded-lg p-0.5 px-2 bg-[#1D1B23]">
                          <Link href={`/Employee/Projects/${project.id}`}>Project</Link>
                        </button>
                        <button
                          className="outline rounded-lg p-0.5 px-2 bg-[#1D1B23]"
                          onClick={() => handleTeamDetails(project.id)}
                        >
                          Team
                        </button>
                        {isMenuOpen && (
                            <>
                            {/* Backdrop */}
                            <div
                                className="fixed inset-0 bg-black opacity-10 z-40"
                                onClick={() => setMenuOpen(false)} // Close modal when clicking backdrop
                            />
                            <div className="fixed top-0 right-0 z-50">
                            <TeamMenu
                              onClose={() => setMenuOpen(false)}
                              teamsData={teams ?? null} // Pass null if teams is null
                              title={title ?? 'Unknown Title'}
                            />
                            </div>
                            </>
                        )}
                        <button
                          onClick={() => window.open(project.drive)}
                          disabled={!project.drive}
                          className={`flex items-center px-2 py-2 rounded-full ${
                            project.drive ? "bg-blue-500 hover:bg-blue-400 text-white" : "bg-gray-400 text-gray-200 cursor-not-allowed"
                          }`}
                        >
                          <FaGoogleDrive/>
                        </button>
                        <button
                          onClick={() => window.open(project.git, "_blank")}
                          disabled={!project.git}
                          className={`flex items-center px-2 py-2 rounded-full shadow-md ${
                            project.git ? "bg-gray-800 hover:bg-gray-700 text-white" : "bg-gray-400 text-gray-200 cursor-not-allowed"
                          }`}
                        >
                          <FaGithub/>
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="py-7 text-center text-gray-500 rounded-2xl">
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
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
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
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </>
      )}
    </div>
  );
}
