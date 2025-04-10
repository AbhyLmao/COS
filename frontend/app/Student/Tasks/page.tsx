import Headingbar from "@/components/employeeComponents/Headingbar";
import UnauthorizedPage from "@/components/unAuthorized";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import ProgressBar from "@/components/studentComponents/ProgressBar"; // Import client component
import Link from "next/link";

export default async function taskspage() {
  const supabase = await createClient();

  // Get authenticated user
  const { data: userInfo, error: authError } = await supabase.auth.getUser();
  if (!userInfo.user || authError) {
    redirect("/sign-in");
  }

  // Fetch student info
  const { data: studentInfo, error: stuError } = await supabase
    .from("Students")
    .select(
      `
      *,
      Teams:team_id (
        *,
        Projects:project_id (*)
      )
    `
    )
    .eq("student_id", userInfo.user.id)
    .single();

  if (!studentInfo || stuError) {
    console.error("Student Info Fetch Error:", stuError);
    return <UnauthorizedPage />;
  }

  // Fetch all students in the same team
  const { data: teamMembers, error: teamError } = await supabase
    .from("Students")
    .select("*")
    .eq("team_id", studentInfo.team_id);

  if (teamError) {
    console.error("Error fetching team members:", teamError);
  }

  // Compute Task Counters
  const hasNDA = studentInfo.Teams.nda_file !== null;
  const projectHasGithub = studentInfo.Teams.Projects.github !== null;
  
  const memberCount = teamMembers ? teamMembers.length : 0;
  const membersWithGithub = teamMembers ? teamMembers.filter(member => member.github !== null).length : 0;
  const membersChangedPassword = teamMembers ? teamMembers.filter(member => member.changed_password == true).length : 0;


  const totalTasks = 1 + (projectHasGithub ? memberCount : 0) + memberCount;
  const doneTasks = (hasNDA ? 1 : 0) + (projectHasGithub ? membersWithGithub : 0) + membersChangedPassword;

  const progress = totalTasks === 0 ? 100 : (doneTasks / totalTasks) * 100;

  if (progress == 100) {
    const { error: taskError } = await supabase
    .from("Teams")
    .update({completed_onboarding: true})
    .eq("team_id", studentInfo.team_id);

    if (taskError) {
      console.error("Error updating onboarding completion status:", taskError);
    }
  }

  // Console log results
{/*  console.log("Student Info:", studentInfo);
  console.log("Team Members:", teamMembers);
  console.log("Total Team Members:", githubCount);
  console.log("Members with GitHub:", membersWithGithub);
  console.log("Total Tasks:", totalTasks);
  console.log("Done Tasks:", doneTasks);
  console.log("Progress:", progress);*/}

  return (
    <>
      <Headingbar text="Student Tasks" />
  
      <div className="flex bg-gray-300 p-6 m-8 rounded-lg">
        {/* Tasks Section */}
        <div className="bg-white p-6 rounded-lg flex flex-col items-center w-1/3 shadow-lg">
          <p className="text-lg font-semibold text-black mt-4">Tasks</p>
          <p className="text-3xl font-bold text-black">{doneTasks} / {totalTasks}</p>
          <div className="flex justify-center bg-white p-4 rounded-lg">
            <ProgressBar progress={progress} />
          </div>
        </div>
  
        {/* What's Left Section */}
        <div className="bg-gray-200 p-6 rounded-lg ml-6 w-2/3 shadow-lg">
          <h2 className="text-xl font-bold text-black">What's left?</h2>
          <p className="text-gray-600 italic text-sm mt-2">Tasks ({doneTasks}/{totalTasks})</p>
  
          <ul className="mt-2 text-black text-sm space-y-2">
            <li className={hasNDA ? "text-green-500" : "text-red-500"}>
              • NDA Task: {hasNDA ? "✅ Completed" : "❌ Not Done"}
            </li>
  
            <li className={projectHasGithub ? "text-green-500" : "text-gray-600"}>
              • Project Has GitHub: {projectHasGithub ? "✅ Yes" : "✖️ No"}
            </li>
  
            <div className="bg-white p-3 rounded-lg shadow">
              <p className="text-black">
                <span className="font-bold">Members</span>
              </p>
              <p className="text-black">
                <span className="font-semibold">Changed Password:</span> {membersChangedPassword} {"/"} {memberCount}
              </p>
              {projectHasGithub && <p className="text-black">
                <span className="font-semibold">GitHub:</span> {membersWithGithub} {"/"} {memberCount}
              </p>}
            </div>
          </ul>
  
          {/* Action Buttons */}
          <div className="mt-6 space-y-3">
            <Link href="/Student/Team" className="w-full bg-gray-300 p-3 rounded-lg text-black shadow text-center block">
              Upload NDA
            </Link>
            <Link href="/Student/Settings" className="w-full bg-gray-300 p-3 rounded-lg text-black shadow text-center block">
              Change Password
            </Link>
            <Link href="/Student/Settings" className="w-full bg-gray-300 p-3 rounded-lg text-black shadow text-center block">
              Update GitHub
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
