import { createStudent } from "@/app/student_applications/application";
import { Member, Student, UserRole } from "@/utils/types";
import { createClient } from "@/utils/supabase/client"; // Adjust the import path as needed

const supabase = createClient();
type ResponseMessage = { type: "error" | "warning" | "success" | "partial-success"; text: JSX.Element[] | string };

export const loadTeamData = async (teamId: string): Promise<Student[] | []> => {
  const { data: studentsData, error } = await supabase.from("Students").select("*").eq("team_id", teamId);

  if (error) {
    console.error("Failed to load team data:", error);
    return [];
  }
  const studentsInfo = studentsData as Student[];

  return studentsInfo || [];
};
export const handleCreateStudentAccounts = async (newStudents: Partial<Student>[], teamId: string, uni: string): Promise<ResponseMessage> => {
  // console.log(`Create student! Passed email: ${newStudents[0].email} student(temp) id: ${newStudents[0].student_id}`);

  const newMembers: Member[] = newStudents.map((student) => ({
    full_name: student.full_name!,
    email: student.email!,
    major: student.major!,
    role: UserRole.STUDENT,
    resume: null,
  }));

  let successStudents: Partial<Student>[] = [];
  let failedEmails: string[] = [];
  let message: JSX.Element[] = [];

  const results = await Promise.allSettled(newMembers.map((member) => createStudent(member, teamId, uni, true)));

  results.forEach((result, index) => {
    const student = newStudents[index];
    if (result.status === "fulfilled") {
      const createUser = result.value;
      // update the student Id with the created user id
      successStudents.push({ ...student, student_id: createUser.data.user.id });
    } else {
      failedEmails.push(student.email!);
      message.push(<p key={index}>{String(result.reason)}</p>);
    }
  });

  if (successStudents.length === newMembers.length) {
    message = [<p className="text-green-600  font-bold">All accounts created successfully.</p>];
    newStudents.forEach((student, index) => {
      message.push(
        <p key={index} className="text-white">
          For {student.full_name}:<br />
          Email: <u>{student.email}</u> Password: <u>teamPasswordIsLong</u>
        </p>
      );
    });
    return { type: "success", text: message };
  } else if (failedEmails.length === newMembers.length) {
    message.unshift(<p className="text-red-600 font-bold">Failed to create student account(s). Please contact the sponsor.</p>);
    return { type: "error", text: message };
  } else {
    message.unshift(
      <p className="text-orange-500  font-bold">
        <span className="text-green-600">Some accounts were created successfully</span> but there were errors.
      </p>
    );
    successStudents.forEach((student, index) => {
      message.push(
        <p key={index} className="text-white">
          For {student.full_name}:<br />
          Email: <u>{student.email}</u> Password: <u>teamPasswordIsLong</u>
        </p>
      );
    });
    return { type: "partial-success", text: message };
  }
};

/**
 * Help function to find students that were modified but not newly created or deleted

 */
export const modifiedStudents = (originalStudentsInfo: Partial<Student>[], students: Partial<Student>[], newStudents: Partial<Student>[], deleteStudents: Partial<Student>[]) => {
  const allModifiedStudent = students.filter((student) => {
    // Skip new students and students marked for deletion
    const isNewStudent = newStudents.some((s) => s.student_id === student.student_id);
    const isDeleted = deleteStudents.some((s) => s.student_id === student.student_id);

    if (isNewStudent || isDeleted) return false;

    // Find the original student to compare
    const originalStudent = originalStudentsInfo.find((s) => s.student_id === student.student_id);
    if (!originalStudent) return false;

    // Check if any fields have changed
    return student.full_name !== originalStudent.full_name || student.major !== originalStudent.major || student.ttg_email !== originalStudent.ttg_email;
  });
  return allModifiedStudent;
};

/**
 *
 * @param students
 * @returns
 */

export const updateStudentInformation = async (students: Partial<Student>[]) => {
  const results = await Promise.allSettled(
    students.map(async (student) => {
      // Only update if we have a student_id
      if (!student.student_id) return { status: "rejected", reason: "No student ID provided" };

      // Update the student information in the database
      const { data, error } = await supabase
        .from("Students")
        .update({
          full_name: student.full_name,
          major: student.major,
          ttg_email: student.ttg_email,
        })
        .eq("student_id", student.student_id);

      if (error) throw error;
      return { status: "fulfilled", value: data };
    })
  );

  return results;
};

export const handleUpdateStudentInformation = async (students: Partial<Student>[]): Promise<ResponseMessage> => {
  let success_count = 0;
  let message: JSX.Element[] = [];

  const results = await updateStudentInformation(students);

  results.forEach((result) => {
    if (result.status === "fulfilled") {
      success_count++;
    }
  });

  if (success_count === students.length) {
    message = [<p className="text-green-600 font-bold">All student information updated successfully.</p>];
    return { type: "success", text: message };
  } else if (success_count === 0) {
    message.unshift(<p className="text-red-600 font-bold">Failed to update student information. Please contact the sponsor.</p>);
    return { type: "error", text: message };
  } else {
    message.unshift(
      <p className="text-orange-500 font-bold">
        <span className="text-green-600">Some information was updated successfully</span> but there were errors.
      </p>
    );
    return { type: "partial-success", text: message };
  }
};

export const handleUpdateLead = async (new_lead: string, team_id: string): Promise<ResponseMessage> => {
  let message: JSX.Element[] = [];
  const { error } = await supabase
    .from("Teams")
    .update({
      team_lead_email: new_lead
    })
    .eq("team_id", team_id);

    if (error) {
      console.log("Failed to assign new team lead", error.message);
      message.push(
        <p key="error" className="text-red-600">
          Failed to assign new team lead, <span className="font-bold">{new_lead}</span>. Please contact the project sponsor.
        </p>
      );
      return { type: "error", text: message };
    }
    message.push(
      <p key="success" className="text-green-600">
        New team lead assigned successfully.
      </p>
    );
    
    return { type: "success", text: message };
};

/**
 * Update or set the team nda file name
 * upload nda
 * @param ndaFile
 * @param ndaFileName
 * @param team_id
 */
export const handleNdaUpload = async (oldNdaFileName: string | undefined | null, ndaFile: File, ndaFileName: string | undefined, team_id: string | undefined): Promise<ResponseMessage> => {
  let message: JSX.Element[] = [];
  if (!ndaFileName || !ndaFile || !team_id) {
    return { type: "error", text: "Missing required information for upload" };
  }
  if (oldNdaFileName) {
    //delete the current nda file
    const { error: delete_error } = await supabase.storage.from("ndas").remove([oldNdaFileName]);
    if (delete_error) {
      console.log("Failed to delete old nda", delete_error.message);
      message.push(
        <p key="delete_error" className="text-red-600">
          Failed to delete the old NDA file, <span className="font-bold">{oldNdaFileName}</span>. Please contact the project sponsor.
        </p>
      );
    }
  }

  const { error: upload_error } = await supabase.storage.from("ndas").upload(ndaFileName, ndaFile);
  if (upload_error) {
    console.log("Failed to upload nda", upload_error.message);

    message.push(
      <p key="delete_error" className="text-red-600">
        Failed to upload the NDA. Please try again or contact the project sponsor
      </p>
    );
    return { type: "error", text: message };
  }
  // update the filename if upload is successful
  const { error: update_error } = await supabase.from("Teams").update({ nda_file: ndaFileName }).eq("team_id", team_id);
  if (update_error) {
    console.log("Failed to update filename", update_error.message);

    message.push(
      <p key="delete_error" className="text-red-600">
        Failed to upload the NDA filename, <span className="font-bold">{oldNdaFileName}</span>. Please contact project sponsor
      </p>
    );
    return { type: "error", text: message };
  }
  message.push(
    <p key="success" className="text-green-600">
      NDA file uploaded and updated successfully.
    </p>
  );

  return { type: "success", text: message };
};

/**
 * Create a signed url for the nda file and open it in a new tab
 * @param resume_filepath The path to the nda file
 */
export async function openNDA(filepath: string) {
  const { data, error } = await supabase.storage.from("ndas").createSignedUrl(filepath, 600); // this link is valid for 10mins
  if (data?.signedUrl) {
    window.open(data.signedUrl, "_blank");
  } else {
    alert("Unable to fetch the nda. Please try again.");
  }
}
