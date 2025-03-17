"use client";

import React, { useCallback } from "react";
import { useState, useEffect, Suspense } from "react";
import { Project, Project_Status, Employee, Universities } from "@/utils/types";
import { Info, Pencil, ArrowUpRight, ChevronRight } from "lucide-react";
import DatePicker from "react-datepicker"; // npm install react-datepicker documentation: https://reactdatepicker.com/#example-locale-without-global-variables
import "react-datepicker/dist/react-datepicker.css"; // Import the CSS for the date picker
import "./customDatePickerWidth.css";
import ReactMarkdown from "react-markdown";
import { Button } from "../ui/button";
import Link from "next/link";
import { Dialog } from "@/components/ui/dialog";
import {
  getChangedData,
  onUpdateProject,
  canUserEditProject,
} from "@/app/student_applications/project_detail_helper";
import { ProjectStatusButton } from "../project-status-button";
import { createClient } from "@/utils/supabase/client";
import { FaGithub, FaGoogleDrive } from "react-icons/fa";
import TeamMenu from "@/components/employeeComponents/team-menu";
import "./project-details.css";
import CreatePdf from "@/app/student_applications/createPdf";
import dynamic from "next/dynamic";
import SaveCancelButtons from "../save_cancel_btns";
import { cn } from "@/utils/cn";
interface ProjectDetailProps {
  employeeInfo: Employee;
  project: Project;
  initialSponsorInfo: Employee | null;
}
// lazy laod employee, therefore, it could imported when needed
const ProjectLogInfo = dynamic(
  () => import("@/components/employeeComponents/project-info-dialog"),
  {}
);

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

export default function ProjectDetail({
  employeeInfo,
  project,
  initialSponsorInfo,
}: ProjectDetailProps) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [sponsorData, setSponsorData] = useState<Employee | null>(
    initialSponsorInfo
  );
  const [originalSponsorData, setOriginalSponsorData] =
    useState<Employee | null>(initialSponsorInfo);
  const [isMessage, setMessage] = useState<string | null>(null);
  const [awardedTeam, setTeam] = useState<Team | null>(null);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const timeoutLength = 1000;

  useEffect(() => {
    if (isMessage) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, timeoutLength);
      return () => clearTimeout(timer);
    }
  }, [isMessage]);

  // need to store the original data so that we can revert back
  const [originalProjectInfo, setOriginalProjectInfo] =
    useState<Project>(project);

  // anything that is/ could be null or undefined is replaced
  const [currentProjectInfo, setCurrentProjectInfo] =
    useState<Project>(project);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) =>
    (currentYear + i).toString()
  );

  // modifies the current project object
  const onInputChange = (event: { target: { name: any; value: any } }) => {
    const { name, value } = event.target;
    setCurrentProjectInfo({
      ...currentProjectInfo,
      [name]: value,
    });
    console.log(`${name} was updated to ${value}`);
  };

  async function handleSaveProject() {
    setIsSaving(true);

    // set timeout is async
    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
    }, timeoutLength);
    // save logic
    try {
      const updatedData: Partial<Project> = getChangedData(
        originalProjectInfo,
        currentProjectInfo,
        employeeInfo.email,
        employeeInfo.level
      );
      if (Object.keys(updatedData).length === 0) {
        setMessage("Cannot save without any changes");
        setCurrentProjectInfo(originalProjectInfo);
        return;
      }
      if (currentProjectInfo.status === Project_Status.DISPATCHED) {
        if (currentProjectInfo.sponsor_email === null && currentProjectInfo.university === null) {
          setMessage("Cannot dispatch project without sponsor or university");
          setCurrentProjectInfo(originalProjectInfo);
          return;
        }
        if (currentProjectInfo.sponsor_email === null) {
          setMessage("Cannot dispatch project without sponsor");
          setCurrentProjectInfo(originalProjectInfo);
          return;
        }
        if (currentProjectInfo.university === null) {
          setMessage("Cannot dispatch project without university");
          setCurrentProjectInfo(originalProjectInfo);
          return;
        }
      }
      // update last modified by to the time and the current user
      const dateNow = new Date().toISOString();
      updatedData.last_modified_date = dateNow; // include the date the data was last modified
      updatedData.last_modified_user = employeeInfo.email;

      // if the current status is APPROVED, set approve detail
      if (originalProjectInfo.status !== currentProjectInfo.status) {
        if (currentProjectInfo.status === Project_Status.APPROVED) {
          updatedData.approval_email = employeeInfo.email;
          updatedData.approved_date = dateNow;
        }
        if (currentProjectInfo.status === Project_Status.DISPATCHED) {
          updatedData.dispatcher_email = employeeInfo.email;
          updatedData.dispatched_date = dateNow;
        }
      }

      await onUpdateProject(updatedData, project.project_id).then(
        (updatedProjectedFromDB) => {
          console.log(`updated from db is... ${updatedProjectedFromDB.status}`);
          if (updatedProjectedFromDB) {
            setCurrentProjectInfo(updatedProjectedFromDB);
            setOriginalProjectInfo(updatedProjectedFromDB);
          }
        }
      );
    } catch (error) {
      alert(`${error}`);
      setCurrentProjectInfo(originalProjectInfo);
    } finally {
    }
  }
  function handleCancelEdit() {
    setCurrentProjectInfo(originalProjectInfo);
    setSponsorData(originalSponsorData);
    setIsEditing(false);
  }
  const handleProjectEdit = () => {
    // check if the user can  edit
    if (
      canUserEditProject(
        employeeInfo.email,
        employeeInfo.level,
        project.creator_email
      )
    ) {
      setIsEditing(true);
      setOriginalSponsorData(sponsorData);
    } else {
      alert(
        "You're are not authorized to edit this project! \nOnly the user that created the project, or employees lvl 2+ can edit this project"
      );
    }
  };

  const supabase = createClient();

  const handleClearSponsor = async () => {
    if (employeeInfo.level < 2) {
      alert("You do not have permission to remove the sponsor.");
      return;
    } else {
      setSponsorData(null);
      onInputChange({
        target: { name: "sponsor_email", value: null },
      });
    }
  };

  const handleAutofill = async () => {
    if (employeeInfo.level == 3) {
      setSponsorData(employeeInfo);
      onInputChange({
        target: {
          name: "sponsor_email",
          value: employeeInfo.email,
        },
      });
      return;
    } else {
      alert("You do not have permission to sponsor a project.");
      return;
    }
  };

  const onViewDetails = async () => {
    if (!currentProjectInfo.awarded_team_id) return;

    // Fetch the awarded application from Supabase
    const { data, error } = await supabase
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
          .eq("team_id", currentProjectInfo.awarded_team_id)
          .single();

    console.log("TEST: ", data)

    if (!data) {
      console.warn("No approved team found for this project.");
      setTeam(null);
      return;
    } else if (error) {
      console.error("Error fetching teams: ", error);
      setTeam(null);
      return;
    } else if (data) {
      console.log("Teams data: ", data)
      const members = data.Students || [];
      const memberDetails = members.map((member: any) => ({
        full_name: member.full_name,
        role: member.role,
        email: member.email,
        ttg: member.ttg_email,
  }));
      setTeam({
        team_name: data.team_name,
        university: (data.Projects as unknown as { university: string } | null)?.university ?? 'N/A',
        members: memberDetails,
        supervisor_name: data.supervisor_name ?? "N/A",
        supervisor_email: data.supervisor_email ?? "N/A",
        nda: data.nda_file,
        team_lead: data.team_lead_email
      });
    }

    if (error) {
      console.error("Error fetching team details:", error);
      return;
    }

    setMenuOpen(true);
  };

  const formatStartTerm = (term: string) => {
    if (!term) return "";
    const year = term.substring(0, 4);
    const month = term.substring(4, 6);
    const displayMonth =
      month === "01" ? "Jan" : month === "05" ? "May" : "Sept";
    return `${displayMonth} ${year}`;
  };

  const handleApplicationStatus = useCallback(() => {
    const todayDate = new Date();
    const deadline = originalProjectInfo.application_deadline
      ? new Date(originalProjectInfo.application_deadline)
      : null;

    if (
      deadline &&
      todayDate > deadline &&
      originalProjectInfo.awarded_application_id === null
    ) {
      return {
        status: "CLOSED",
        message:
          "Applications Closed - Deadline passed on " +
          deadline.toLocaleDateString(),
      };
    } else if (originalProjectInfo.awarded_application_id !== null) {
      return {
        status: "CLOSED",
        message: "Applications Closed - Project has been awarded",
      };
    } else if (deadline && todayDate <= deadline) {
      return {
        status: "OPEN",
        message: "Applications open until " + deadline.toLocaleDateString(),
      };
    } else if (deadline === null) {
      return {
        status: "CLOSED",
        message: "Applications Closed - Deadline has not been set",
      };
    } else {
      return {
        status: "UNKNOWN",
        message: "Application status is unknown",
      };
    }
  }, [originalProjectInfo.application_deadline]);
  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-3 py-2">
        <div className="flex flex-col space-y-2">
          {isEditing ? (
            <div>
              <input
                name="title"
                value={currentProjectInfo.title}
                onChange={onInputChange}
                className="w-full max-h-14 text-2xl font-bold p-2 rounded-md text-black focus:outline-none bg-gray-300 "
                placeholder="Enter project title"
                readOnly={!isEditing}
                style={{
                  width: `${currentProjectInfo.title.length + 1}ch`,
                }}
              />
            </div>
          ) : (
            <h1 className="text-2xl underline font-bold text-white py-2">
              {currentProjectInfo.title}
            </h1>
          )}

          <div className="flex items-center space-x-0.5">
            <h2 className="text-xl font-bold text-white py-2">
              Project Description
            </h2>
            <button
              onClick={() => setIsPopupOpen(true)}
              className="flex text-sm text-gray-300 hover:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none px-1"
              aria-label="More Information"
            >
              <Info className="w-5 h-5" />
            </button>
          </div>
        </div>
        {/* Project edit button */}
        {isMessage && (
          <div className="text-red-400 text-center ">{isMessage}</div>
        )}

        <div className="flex items-center gap-6 justify-center">
          {isEditing && (
            <SaveCancelButtons
              isSaving={isSaving}
              onCancel={handleCancelEdit}
              onSave={handleSaveProject}
            />
          )}
          <Button
            variant="outline"
            className={`flex flex-row rounded-full w-24 gap-3 font-medium h-9 focus:outline-none 
          hover:bg-opacity-10 hover:bg-white transition-colors duration-100 ease-in-out
          ${isEditing ? "hidden" : ""}`}
            onClick={handleProjectEdit}
          >
            <span>Edit</span>
            <Pencil size={18} />
          </Button>

          {/* Project status button */}
          <ProjectStatusButton
            initial_status={originalProjectInfo.status}
            status={currentProjectInfo.status}
            setProjStatus={(status) =>
              onInputChange({ target: { name: "status", value: status } })
            }
            allowClick={isEditing}
            projectSponsor={currentProjectInfo.sponsor_email}
            dispatchUniversity={currentProjectInfo.university}
          />
        </div>
      </div>
      {isPopupOpen && (
        <Suspense
          fallback={<p className="text-white text-center">Loading...</p>}
        >
          <Dialog
            open={isPopupOpen === true}
            onOpenChange={() => setIsPopupOpen(false)}
          >
            <ProjectLogInfo currentProject={originalProjectInfo} />
          </Dialog>
        </Suspense>
      )}

      <div>
        {isEditing ? (
          <div>
            <textarea
              name="description"
              value={currentProjectInfo.description}
              onChange={onInputChange}
              className="w-full h-48  text-sm max-h-48 p-4 rounded-xl text-black focus:outline-none bg-gray-300 "
              placeholder="Enter project description"
              readOnly={!isEditing}
            />
          </div>
        ) : (
          <div className="relative bg-gray-300 p-4 rounded-xl text-sm max-h-48 h-48 overflow-y-auto text-black">
            <ReactMarkdown className="markdown-content">
              {currentProjectInfo.description}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {/* Budget, Deadline and Start Term */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-white my-4">
        {/* Budget */}
        <div className="space-y-2 w-full">
          <label htmlFor="budget">Budget</label>
          <div className="relative">
            <span className="absolute left-3 top-1 text-black">$</span>
            <input
              type="number"
              min="0"
              placeholder="Enter budget"
              name="project_budget"
              value={currentProjectInfo.project_budget}
              onChange={(event) =>
                onInputChange({
                  target: {
                    name: event.target.name,
                    value: event.target.value.replace(/[^0-9]/g, ""),
                  },
                })
              }
              readOnly={!isEditing}
              className={`p-1 pl-7 rounded-md text-black w-full outline-none ${!isEditing ? "cursor-default" : ""}`}
            />
          </div>
        </div>

        {/* Application Deadline */}
        {/* <div className="relative flex flex-col items-center space-y-2"> */}
        <div className="space-y-2 w-full">
          <label className="text-base">Application deadline</label>
          <div className="w-full">
            <DatePicker
              name="application_deadline"
              selected={
                currentProjectInfo.application_deadline
                  ? new Date(currentProjectInfo.application_deadline)
                  : null
              }
              onChange={(date) => {
                if (date) {
                  date.setUTCHours(23 + 7, 59, 0, 0); // saves 11:59pm MST in UTC
                  onInputChange({
                    target: {
                      name: "application_deadline",
                      value: date ? date.toISOString() : "",
                    },
                  });
                }
              }}
              dateFormat="MMM d, yyyy"
              timeFormat="p"
              placeholderText="Select a date"
              className={`bg-white text-black py-1 rounded-md outline-none w-full ${!isEditing ? "cursor-default" : ""}`}
              minDate={new Date()}
              toggleCalendarOnIconClick
              showIcon
              locale="mst-us"
              readOnly={!isEditing}
            />
          </div>
        </div>

        {/* Start Term */}
        <div className=" relative flex flex-col space-y-2">
          <label className="text-base capitalize">Start Term</label>
          <select
            value={currentProjectInfo.start_term ?? ""}
            onChange={(e) => {
              const newStartTerm = e.target.value;
              onInputChange({
                target: {
                  name: "start_term",
                  value: newStartTerm ? newStartTerm.toString() : "",
                },
              });
            }}
            disabled={!isEditing}
            className="p-2 rounded-md bg-white text-black outline-none"
          >
            <option value="" disabled>
              Select Start Term
            </option>

            {/* Always include the existing start_term if it exists */}
            {currentProjectInfo.start_term && (
              <option value={currentProjectInfo.start_term}>
                {formatStartTerm(currentProjectInfo.start_term)}
              </option>
            )}

            {years.flatMap((year) =>
              ["01", "05", "09"]
                .map((month) => {
                  const displayMonth =
                    month === "01" ? "Jan" : month === "05" ? "May" : "Sept";
                  const value = `${year}/${month}`;

                  const now = new Date();
                  const currentYear = now.getFullYear();
                  const currentMonth = now.getMonth() + 1;

                  if (
                    parseInt(year) < currentYear ||
                    (parseInt(year) == currentYear &&
                      parseInt(month) < currentMonth)
                  ) {
                    return null;
                  }

                  return (
                    <option key={value} value={value}>
                      {displayMonth} {year}
                    </option>
                  );
                })
                .filter(Boolean)
            )}
          </select>
        </div>
      </div>

      {/* Sponsors */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-white pt-4">Sponsor</h2>
          {isEditing && (
            <Button
              className={`px-3 py-1 rounded-full ${sponsorData ? "bg-[#F72E53] hover:bg-[#e8516d]" : "bg-[#81C26C] hover:bg-[#7cb36a]"} text-black`}
              onClick={sponsorData ? handleClearSponsor : handleAutofill}
            >
              {sponsorData ? "Remove" : "Sponsor Project"}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2">
          <div className="flex flex-col">
            <label className="text-white">Name:</label>
            <input
              type="text"
              value={sponsorData?.full_name ?? ""}
              readOnly
              className="p-1 rounded-md bg-white text-black outline-none"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-white">Email:</label>
            <input
              type="text"
              value={sponsorData?.email || ""}
              readOnly
              className="p-1 rounded-md bg-white text-black outline-none"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-white">Department:</label>
            <input
              type="text"
              value={sponsorData?.department ?? ""}
              readOnly
              className="p-1 rounded-md bg-white text-black outline-none"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-white">Title:</label>
            <input
              type="text"
              value={sponsorData?.title ?? ""}
              readOnly
              className="p-1 rounded-md bg-white text-black outline-none"
            />
          </div>
        </div>
      </div>

      {/* Dispatch Information */}
      <div>
        <div className="flex justify-between items-center mb-2 ">
          <h2 className="text-xl font-bold text-white pt-4">
            Dispatch Information{" "}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2">
          <div className="flex flex-col">
            <label className="text-white flex items-center gap-2">
              {" "}
              <FaGoogleDrive />
              Google Drive Link:
            </label>
            <input
              type="text"
              placeholder="Enter Google Drive Link"
              value={currentProjectInfo.google_link ?? ""}
              onChange={(event) =>
                onInputChange({
                  target: {
                    name: "google_link",
                    value: event.target.value,
                  },
                })
              }
              readOnly={!isEditing}
              className={`p-1 rounded-md text-black w-full outline-none ${!isEditing ? "cursor-default" : ""}`}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-white flex items-center gap-2">
              {" "}
              <FaGithub />
              GitHub Link:
            </label>
            <input
              type="text"
              placeholder="Enter GitHub Link"
              value={currentProjectInfo.github ?? ""}
              onChange={(event) =>
                onInputChange({
                  target: {
                    name: "github",
                    value: event.target.value,
                  },
                })
              }
              readOnly={!isEditing}
              className="p-1 rounded-md bg-white text-black outline-none"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-white">University:</label>
            <select
              value={currentProjectInfo.university ?? ""}
              onChange={(event) =>
                onInputChange({
                  target: {
                    name: "university",
                    value: Object.values(Universities).includes(
                      event.target.value as Universities
                    )
                      ? (event.target.value as Universities)
                      : null,
                  },
                })
              }
              disabled={!isEditing}
              className="p-2 rounded-md bg-white text-black outline-none"
            >
              <option value="" disabled>
                Select a university
              </option>
              <option value="null">None</option>
              {Object.values(Universities).map((uni) => (
                <option value={uni} key={uni}>
                  {uni}
                </option>
              ))}
            </select>
          </div>
          {![
            Project_Status.NEW,
            Project_Status.DRAFT,
            Project_Status.REVIEW,
            Project_Status.REJECTED,
          ].includes(originalProjectInfo.status) && (
            <div className="flex flex-col">
              <label className="text-white">Download for Dispatch</label>
              <div className="flex justify-center items-center space-x-2">
                <CreatePdf project={originalProjectInfo} />
              </div>
              {/* <Button onClick={handleDownloadPdf}> Download as PDF </Button> */}
            </div>
          )}
        </div>
      </div>

      {/* Applications, Team Awarded and Link Status, Applications Allowed*/}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-2">
        {/* applications */}
        <div>
          <h2 className="text-xl font-bold text-white py-2">Applications</h2>
          <div className="space-x-2">
            <Button
              asChild
              variant="outline"
              className={`text-sm space-x-1 ${originalProjectInfo.application_link === null || ["NEW", "DRAFT", "APPROVED", "REJECTED", "REVIEW"].includes(originalProjectInfo.status) ? "text-gray-500 border border-gray-400 cursor-default" : ""}`}
            >
              {originalProjectInfo.application_link && !["NEW", "DRAFT", "APPROVED", "REJECTED", "REVIEW"].includes(originalProjectInfo.status) ? (
                <Link
                  href={`/ApplicationForm/${originalProjectInfo.application_link}/`}
                >
                  <span>Application Link</span>
                  <ArrowUpRight />
                </Link>
              ) : (
                <span>Application Link</span>
              )}
            </Button>
            <Button 
              asChild
              variant="outline"
              className={`text-sm space-x-1 ${originalProjectInfo.application_link === null || ["NEW", "DRAFT", "APPROVED", "REJECTED", "REVIEW"].includes(originalProjectInfo.status) ? "text-gray-500 border border-gray-400 cursor-default" : ""}`}
            >
              {originalProjectInfo.application_link && !["NEW", "DRAFT", "APPROVED", "REJECTED", "REVIEW"].includes(originalProjectInfo.status) ? (
                <Link
                  href={`/Employee/Projects/${project.project_id}/Applicants`}
                >
                  <span>View Applicants</span>
                  <ArrowUpRight />
                </Link>
              ) : (
                <span>View Applicants</span>
              )}
              {/* <Link
                href={`/Employee/Projects/${project.project_id}/Applicants`}
              >
                <span>View Applicants</span>
                <ChevronRight />
              </Link> */}
            </Button>
          </div>
        </div>

        {/* Team Awarded */}
        {currentProjectInfo.awarded_application_id && (
          <div>
            <h2 className="text-xl font-bold text-white py-2">Team Awarded</h2>
            <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={onViewDetails}>
              View Team Details
              <ChevronRight />
            </Button>

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
                teamsData={awardedTeam ?? null} // Pass null if teams is null
                title={currentProjectInfo.title ?? 'Unknown Title'}
              />
              </div>
              </>
            )}
          </div>
          </div>
        )}
        {/* Application Link */}
        {currentProjectInfo.application_link && (
          <div className="">
            <h2
              className="text-xl font-bold text-white py-2"
              hidden={!project.application_link}
            >
              Application Status:
            </h2>
            <div
              hidden={!project.application_link}
              className="space-x-2 flex items-center"
            >
              {(() => {
                const { status, message } = handleApplicationStatus();
                const statusColor =
                  status === "OPEN" ? "bg-green-500" : "bg-red-500";
                return (
                  <>
                    <div
                      className={cn(
                        `w-3 h-3 rounded-full shrink-0 ${statusColor}`
                      )}
                    />
                    <span className="">{message}</span>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>

      {/* error message */}
      {isMessage && <div className="text-red-400 text-center">{isMessage}</div>}
      {isEditing && (
        <SaveCancelButtons
          isSaving={isSaving}
          onCancel={handleCancelEdit}
          onSave={handleSaveProject}
        />
      )}
    </div>
  );
}