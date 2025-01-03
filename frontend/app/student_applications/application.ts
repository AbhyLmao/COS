'use client'
import { createClient } from "@/utils/supabase/client";
import { Application, Application_Status, Member, Project_Status } from "@/utils/types";
import {v4 as uuidv4 } from "uuid"
import { UserRole } from "@/utils/types";

/**
 * 
 * @param projectId The project id to fetch applications for
 * @returns An array of applications or null if there are no applications
 */
export const fetchApplications = async(projectId: string): Promise<Application[] | null> =>{
    const supabase = createClient();
    const {data, error} = await supabase.from("Applications").select("*").eq('"project_id"',projectId); 
    if (error) throw new Error(`Error fetching applications: ${error.message}`);
    return data;
};

/**
 * This function updates the status of an application.
 * If the application is been APPROVED, then, the functionw will also update the appoval_date column
 * @param applicationId The application id to update
 * @param status The new status of the application
 * @param team_name The name of the team. This is used for error messages
 */
export const updateApplicationStatus = async (applicationId: number, status: string, team_name: string | undefined) => {
    const supabase = createClient();
    let updateData: {status: string , approval_date?: string} = { status };

    if (status === Application_Status.APPROVED) {
      updateData.approval_date = new Date().toISOString(); // set approval_date to current date and time
    }

    const { error } = await supabase.from("Applications").update(updateData).eq("application_id", applicationId);
    if (error) throw new Error(`Error updating ${team_name} application status! Error was: ${error.message}`);
};

/**
 * This function is a bulk rejection
 * It will reject all applications for a project except the application id provided.
 */
export const rejectOtherApplications = async (application_id: number, project_id: number) => {
    const supabase =  createClient();
    const {error} = await supabase.from('Applications')
    .update({status: Application_Status.REJECTED})
    .eq("project_id", project_id)
    .neq('application_id', application_id);
    if (error) throw new Error(`Error rejecting other applications: ${error.message}`);
}

/**
 * 
 * @param teamMembers The members of the team to create accounts for
 * @param projectId The project id of the team
 * @param uni The university of the team
 * @returns void but the function will create student accounts for the team members. If there is an error creating an account, the function will throw an error with all the error messages
 */
export async function createStudentAccounts(teamMembers: Member[], projectId: number, uni: string){
    let errorMessages: string[] = [];
    const teamId= uuidv4();

    // intial payload
    const basePayload ={
      user_metadata: {
        project_id: projectId,
        team_id: teamId,
        user_role: UserRole.STUDENT,
        university: uni
      },
    }
    
    for (const member of teamMembers){
      try{
        // create custom payload for each memeber
        const payLoad = {
          email: member.email,
          ...basePayload,
          user_metadata: {
            ...basePayload.user_metadata,
            full_name: member.full_name,
            major: member.major,
          },
        };

        // send the API request
        const response = await fetch('/student_applications',{
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payLoad)
        });

        const result = await response.json();
        if(!response.ok){
          errorMessages.push(`Error creating user ${member.email}: ${result.error}`);
        }
      } catch(err){
        errorMessages.push(`Error creating user ${member.email}: ${(err as Error).message}`);
      }
    }
    if (errorMessages.length > 0) {
      throw new Error(errorMessages.join('\n'));
    }
}

/**
 * 
 * @param application_id The application id to delete
 */
export async function deleteApplication(application_id: number){
    // console.log("Handle delete application");
    const supabase = createClient();
    const {data, error} = await supabase.from('Applications').delete().eq("application_id",application_id).select();
    if (error || data === null) throw new Error(`Error deleting application: ${error.message}`);

}
/**
 * 
 * @param employeeLevel The level of the employee
 * @param requiredLevel The level required to perform the action
 * @returns 
 */
export function confirmEmployeeAuthorization(employeeLevel: number, requiredLevel: number): boolean{
  if (employeeLevel < requiredLevel) {
    return false;
  }
  return true;
}

export const updateProjectStatus = async(project_id: string, status: string) => {
  const supabase = createClient();
  let error;
  if(status === Project_Status.AWARDED){
    // close the project to prevent further applications
    const {data, error: err } = await supabase.from("Projects").update({status: status, applications_allowed: false}).eq('"project_id"',project_id).select();
    error = err;
  }
  else{
    const {data, error: err } = await supabase.from("Projects").update({status }).eq('"project_id"',project_id).select();
    error = err;
  }
  if (error) throw new Error(`Error updating project with project id ${project_id} application status! please contact system admin`);
}