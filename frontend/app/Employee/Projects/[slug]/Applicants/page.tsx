import ApplicationList from "@/components/employeeComponents/application-list";
import { createClient } from "@/utils/supabase/server";
import { redirect } from 'next/navigation';
import { Employee } from "@/utils/types";

export default async function ApplicantsPage({params,} : {params : Promise<{slug : string}>}) {
  const projectId = (await params).slug;
  const supabase = await createClient();
  const {data, error} = await supabase.auth.getUser();
  if(error){
    redirect("/sign-in");
  }
  const {data: empInfo, error: empError} = await supabase.from("Employees").select("*").eq('employee_id',data.user?.id).single();
  if(empError){
    redirect("/sign-in");
  }
  const employeeInfo = empInfo as Employee;
  return (
    <div className="p-6">
      <ApplicationList projectId={projectId} employeeInfo={employeeInfo}/>
    </div>
  )
}

