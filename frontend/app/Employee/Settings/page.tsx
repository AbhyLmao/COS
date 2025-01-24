import Headingbar from "@/components/employeeComponents/Headingbar";
import UserInfo from "@/components/employeeComponents/user-information";
import ChangePassword from "@/components/employeeComponents/user-pw-change";
import {createClient} from '@/utils/supabase/server';
import { redirect } from "next/navigation";


export default async function SettingsPage() {
  const supabase = await createClient();
  
  // get session stuff
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if ( userError || !user) {
    redirect("/sign-in")
  }

  // from session stuff, get user id
  const userId = user.id; 

  return (
    <>
      <Headingbar text="Settings" />
      <UserInfo userId={userId}/>
      <ChangePassword/>
    </>
  );
}

