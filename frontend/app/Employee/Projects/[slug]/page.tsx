import ProjectDetail from "@/components/employeeComponents/project-detail";
import Headingbar from "@/components/employeeComponents/Headingbar";
import {createClient} from '@/utils/supabase/server';
import { Project } from "@/utils/types";

export default async function ProjectPage({params,} : {params : Promise<{slug : string}>}) {
    const projectId = (await params).slug;
    const project  = await getProjectById(projectId);
    if (project === null){
        return <div>
            Error retrieving project with project id, {projectId}! Please contact system admin
        </div>
    }
    return (
        <div className="text-purple-300">
            project id is {projectId};
            <Headingbar
                text={project.title}
            />
            <ProjectDetail project={project}/>
        </div>
    );
}
async function getProjectById(projectId: string) : Promise<Project | null> {
    const supabase = await createClient();
    const {data: projectInfo , error} = await supabase.from("Projects").select("*").eq('"project_id"',projectId).single();
    console.log("Project info is: ", projectInfo)
    return error ? null : projectInfo as Project;
}