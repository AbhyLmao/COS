"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { UserRole, EmployeeLevel } from "@/utils/types";

/**
 * Sign up a user as an employee
 * @param formData Data from the sign up form
 * @returns A redirect to the sign up page with an error message if the sign up fails, 
 * or a redirect to the sign up page with a success message if the sign up is successful.
 * Afterwards if confirmation is enabled in supabase, the user will receive an email to confirm their email.
 */
export const signUpAction = async (formData: FormData) => {
  let first_name = formData.get("first_name")?.toString();
  let last_name = formData.get("last_name")?.toString();
  let email = formData.get("email")?.toString();
  let password = formData.get("password")?.toString();
  let title = formData.get("title")?.toString();
  let department = formData.get("department")?.toString();
  console.log("user sign up data",{
    first_name,
    last_name,
    email,
    password,
    department,
  });
  const emailRegex = /^[^\s@]+@ttg\.com$/i;
  
  if (!first_name || first_name.trim().length ==0) {
    return encodedRedirect("error", "/sign-up", "First name is required");
  }
  if (!last_name || last_name.trim().length ==0) {
    return encodedRedirect("error", "/sign-up", "Last name is required");
  }
  if (!email || email.trim().length ==0 || !emailRegex.test(email)) {
    return encodedRedirect("error", "/sign-up", "Tartigrade Email is required");
  }
  if (!password) {
    return encodedRedirect("error", "/sign-up", "Password is required");
  }
  if (!title){
    return encodedRedirect("error", "/sign-up", "Title is required");
  }
  if (!department){
    return encodedRedirect("error", "/sign-up", "Department is required");
  }

  first_name = first_name.trim();
  last_name = last_name.trim();
  title = title.trim();
  const supabase = await createClient();
  
  // check if the ttg email belongs to a student
  const { data: studentData, error: studentError } = await supabase
    .from("Students")
    .select('full_name, email, ttg_email')
    .or(`email.eq.${email},ttg_email.eq.${email}`);
    // response is a array of objects studentData: [{name:"",email: "", ttg_email:  ""}, ...]


  if (studentError) {
    console.error(studentError.message);
    return encodedRedirect("error", "/sign-up", `Error checking student email: ${studentError.message}`);
  }

  if (studentData && studentData.length > 0) {
    return encodedRedirect("error", "/sign-up", "Students cannot sign up as employees");
  }

  const full_name = `${first_name.charAt(0).toUpperCase() + first_name.slice(1)} ${last_name.charAt(0).toUpperCase() + last_name.slice(1)}`;
  const origin = (await headers()).get("origin");
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/confirm`,
      data: {
        user_role: UserRole.EMPLOYEE,
        full_name,
        department: department,
        title: title,
        level: EmployeeLevel.LEVEL_0,
      }
    },
  });

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  } else {
    return encodedRedirect(
      "success",
      "/sign-up",
      "Thanks for signing up! Please check your email for a verification link.",
    );
  }
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }
  revalidatePath('/Employee', 'layout');//purge cache of the Employee folder and its children
  return redirect("/Employee/Projects");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/reset-password",
      "Password update failed",
    );
  }

  encodedRedirect("success", "/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};
