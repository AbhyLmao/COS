"use client";
import { createClient } from "@/utils/supabase/client";
import { Project, Project_Status } from "@/utils/types";
import { v4 as uuidv4 } from "uuid";

const supabase = createClient();
export const ProjectStatusOrder: Project_Status[] = [
  Project_Status.DRAFT,
  Project_Status.REVIEW,
  Project_Status.REJECTED,
  Project_Status.APPROVED,
  Project_Status.DISPATCHED,
  Project_Status.AWARDED,
  Project_Status.ACTIVE,
  Project_Status.COMPLETED,
  Project_Status.CANCELLED,
];

/**
 * Compare the original Project info to the current and stores
 * @param originalProjectInfo Original Project Info that was retrieved from the database or the data after save button was pressed
 * @param currentProjectInfo  The modified Project info
 * @returns A partial Project object
 */
export const getChangedData = (
  originalProjectInfo: Project,
  currentProjectInfo: Project,
  user_email: string,
  user_level: number
): Partial<Project> => {
  const statusChangeResult = handleProjectStatusChange(
    originalProjectInfo,
    currentProjectInfo,
    user_email,
    user_level
  );

  if (statusChangeResult === false) {
    return {};
  }
  const changedData: Partial<Project> = {};
  Object.keys(originalProjectInfo).forEach((key) => {
    if (
      originalProjectInfo[key as keyof Project] !==
      currentProjectInfo[key as keyof Project]
    ) {
      const value = currentProjectInfo[key as keyof Project];
      (changedData as any)[key as keyof Project] = value;
      console.log(`Key: ${key} was modified to value: ${value}`);
    }
  });

  return changedData;
};

export const onUpdateProject = async (
  updatedProject: Partial<Project>,
  project_id: number
) => {
  console.log(
    `updataData modified user is ... ${updatedProject.last_modified_user}`
  );
  const { data, error } = await supabase
    .from("Projects")
    .update({ ...updatedProject })
    .eq("project_id", project_id)
    .select();
  if (error) {
    throw new Error(`Error updating project info: ${error?.message}`);
  }
  return data[0] as Project;
};
const handleProjectStatusChange = (
  originalProjectInfo: Project,
  currentProjectInfo: Project,
  user_email: string,
  user_level: number
) => {
  if (
    // currentProjectInfo.status === Project_Status.DISPATCHED
    currentProjectInfo.status === Project_Status.APPROVED &&
    (originalProjectInfo.status === Project_Status.REVIEW ||
      originalProjectInfo.status === Project_Status.REJECTED)
  ) {
    if (
      !checkApproverInfo(
        originalProjectInfo.creator_email,
        user_email,
        user_level
      )
    ) {
      return false;
    }
    if (
      originalProjectInfo.rejector_email ||
      originalProjectInfo.rejector_date
    ) {
      console.log("set rejector details to null");
      currentProjectInfo.rejector_date = null;
      currentProjectInfo.rejector_email = null;
    }
    currentProjectInfo.application_link = uuidv4();
    console.log(
      `application_link was created -value: ${currentProjectInfo.application_link}`
    );
  } else if (
    originalProjectInfo.status === Project_Status.REVIEW &&
    currentProjectInfo.status === Project_Status.REJECTED
  ) {
    console.log(
      `original status: ${originalProjectInfo.status} to current status: ${currentProjectInfo.status}`
    );
    currentProjectInfo.rejector_date = new Date().toISOString();
    currentProjectInfo.rejector_email = user_email;
  } else if (
    (originalProjectInfo.status === Project_Status.REJECTED ||
      originalProjectInfo.status === Project_Status.APPROVED) &&
    currentProjectInfo.status === Project_Status.REVIEW
  ) {
    console.log("project status from rejected or approved to review");
    if (
      originalProjectInfo.rejector_email ||
      originalProjectInfo.rejector_date
    ) {
      currentProjectInfo.rejector_date = null;
      currentProjectInfo.rejector_email = null;
    }
    if (
      originalProjectInfo.approval_email ||
      originalProjectInfo.approved_date ||
      originalProjectInfo.application_link
    ) {
      currentProjectInfo.approval_email = null;
      currentProjectInfo.approved_date = null;
      currentProjectInfo.application_link = null;
    }
  } else if (
    originalProjectInfo.status === Project_Status.APPROVED &&
    currentProjectInfo.status === Project_Status.REJECTED
  ) {
    console.log("status went from approved to rejected");
    currentProjectInfo.approval_email = null;
    currentProjectInfo.approved_date = null;
    currentProjectInfo.application_link = null;

    currentProjectInfo.rejector_date = new Date().toISOString();
    currentProjectInfo.rejector_email = user_email;
  }
};

/**
 *
 * Only people that can edit the project is the creator, and users level 2+
 */
export const canUserEditProject = (
  user_email: string,
  user_level: number,
  creator_email: string
): boolean => {
  if (user_email === creator_email) return true;
  if (user_level >= 2) return true;
  return false;
};

/**
 *
 * the user level is too low to approve, or the the level is not a problem but the user is try to approve their own project
 */
const checkApproverInfo = (
  creator_email: string,
  user_email: string,
  user_level: number
) => {
  if (user_level < 2) {
    alert(
      "You're are not authorized to approve this project! \n Only employees lvl 2+ can"
    );
    return false;
  }
  if (user_email === creator_email) {
    alert("You're are not authorized to approve a project you created");
    return false;
  }
  return true;
};
