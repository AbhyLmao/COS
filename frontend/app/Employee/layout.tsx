import { EmployeeLevel, UserRole, AuthResult, Employee } from "@/utils/types";
import EmpLayout from "@/components/employeeComponents/employee-Layout";
import { signOutAction } from "../actions";
import { redirect } from 'next/navigation';
import {createClient} from '@/utils/supabase/server';
import UnauthorizedPage from "@/components/unAuthorized";

export default async function RootLayout({children,}: {children: React.ReactNode;}) {
    const supabase = await createClient();
    const {data: userInfo, error: authError} = await supabase.auth.getUser();
    let metadata = userInfo.user?.user_metadata;
    // console.log("metadata is ...", metadata)
    // console.log("user info is...", userInfo)

    if (!userInfo.user || authError) {
        // console.log("can't access user is ", userInfo)
        redirect("/sign-in");
    }
    
    const {data: employeeInfo , error: empError} = await supabase.from("Employees").select("*").eq('employee_id',userInfo.user.id).single();
  
    if(!employeeInfo || empError){
      return <UnauthorizedPage />;
    }
    const [firstName, lastName] = employeeInfo.full_name ? employeeInfo.full_name.split(" ") : ["N/A", "N/A"];

    return (
        <div>
        <EmpLayout
          userRole={UserRole.EMPLOYEE}
          employeeLevel={employeeInfo.level}
          firstName={firstName}
          lastName={lastName}
          signOutFunc={signOutAction}
          >
          {children}
        </EmpLayout>
      </div>
    );
};