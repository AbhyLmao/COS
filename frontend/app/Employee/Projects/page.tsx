import { ProjectsList } from "@/components/employeeComponents/ProjectList";
import Headingbar from "@/components/employeeComponents/Headingbar";
import {createClient} from '@/utils/supabase/server';
import { Project } from "@/utils/types";

async function getProject():Promise<Project[] | null> {
  const supabase = await createClient();
  const {data: projectInfo , error} = await supabase.from("Projects").select("*"); 
  return error ? null : projectInfo as Project[];
}

export default async function projectpage(){
  const allProjects:  Project[] | null = await getProject();
  
    return (
      <>
      <Headingbar
        text='Projects'
      />
      <ProjectsList initialProjects={allProjects}/>
      </>
    );
}