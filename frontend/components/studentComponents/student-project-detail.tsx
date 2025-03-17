"use client";

import React from "react";
import { useState, useEffect, Suspense } from "react";
import { Project, Employee } from "@/utils/types";
import ReactMarkdown from "react-markdown";

import { ProjectStatusButton } from "../project-status-button";
import { createClient } from "@/utils/supabase/client";
import { FaGithub, FaGoogleDrive } from "react-icons/fa";
interface StudentProjectDetailProps {
  project: Project;
  sponsorInfo: Employee | null;
}

export default function StudentProjectDetail({
  project,
  sponsorInfo,
}: StudentProjectDetailProps) {
  const [isMessage, setMessage] = useState<string | null>(null);
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

  const supabase = createClient();

  const formatStartTerm = (term: string) => {
    if (!term) return "";
    const year = term.substring(0, 4);
    const month = term.substring(4, 6);
    const displayMonth =
      month === "01" ? "Jan" : month === "05" ? "May" : "Sept";
    return `${displayMonth} ${year}`;
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-3 py-2">
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl underline font-bold text-white py-2">
            {currentProjectInfo.title}
          </h1>

          <div className="flex items-center space-x-0.5">
            <h2 className="text-xl font-bold text-white py-2">
              Project Description
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-6 justify-center">
          {/* Project status button */}
          <ProjectStatusButton
            initial_status={originalProjectInfo.status}
            status={currentProjectInfo.status}
            setProjStatus={(status) =>
              onInputChange({ target: { name: "status", value: status } })
            }
            allowClick={false}
            projectSponsor={originalProjectInfo.sponsor_email}
            dispatchUniversity={originalProjectInfo.university}
          />
        </div>
      </div>

      <div>
        <div className="relative bg-white p-4 rounded-xl text-sm max-h-48 h-48 overflow-y-auto text-black cursor-default">
          <ReactMarkdown className="markdown-content">
            {currentProjectInfo.description}
          </ReactMarkdown>
        </div>
      </div>

      {/* Budget and Start Term */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 text-white my-4">
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
              readOnly={true}
              className={`p-1 pl-7 rounded-md text-black w-full outline-none cursor-default`}
            />
          </div>
        </div>

        {/* Start Term */}
        <div className=" relative flex flex-col space-y-2">
          <label className="text-base capitalize">Start Term</label>
          <div>
            <input
              className={`p-1 pl-3 rounded-md text-black w-full outline-none cursor-default`}
              value={
                currentProjectInfo.start_term
                  ? formatStartTerm(currentProjectInfo.start_term)
                  : "N/A"
              }
              readOnly={true}
            />
          </div>
        </div>
      </div>

      {/* Sponsors */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-white pt-4">Sponsor</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2">
          <div className="flex flex-col">
            <label className="text-white">Name:</label>
            <input
              type="text"
              value={sponsorInfo?.full_name ?? ""}
              readOnly
              className="p-1 pl-3 rounded-md bg-white text-black outline-none cursor-default"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-white">Email:</label>
            <input
              type="text"
              value={sponsorInfo?.email || ""}
              readOnly
              className="p-1 pl-3 rounded-md bg-white text-black outline-none cursor-default"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-white">Department:</label>
            <input
              type="text"
              value={sponsorInfo?.department ?? ""}
              readOnly
              className="p-1 pl-3 rounded-md bg-white text-black outline-none cursor-default"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-white">Title:</label>
            <input
              type="text"
              value={sponsorInfo?.title ?? ""}
              readOnly
              className="p-1 pl-3 rounded-md bg-white text-black outline-none cursor-default"
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
              value={currentProjectInfo.google_link ?? ""}
              onChange={(event) =>
                onInputChange({
                  target: {
                    name: "google_link",
                    value: event.target.value,
                  },
                })
              }
              readOnly={true}
              className={`p-1 pl-3 rounded-md text-black w-full outline-none cursor-default`}
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
              value={currentProjectInfo.github ?? ""}
              onChange={(event) =>
                onInputChange({
                  target: {
                    name: "github",
                    value: event.target.value,
                  },
                })
              }
              readOnly={true}
              className="p-1 pl-3 rounded-md bg-white text-black outline-none cursor-default"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
