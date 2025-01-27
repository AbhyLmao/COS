import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"; //npx shadcn@latest add select
import { Department_Types } from "@/utils/types";
import { FormMessageWithTimeout } from "@/components/form-message-with-timeout";
import { PasswordInput } from "@/components/ui/password-input";
import './signupPage.css'; 

const departmentOptions: Department_Types[] = Object.values(Department_Types);

export default async function Signup(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  if ("message" in searchParams) {
    return (
      <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return (
    <>
      <div className="signup-page min-h-screen flex mx-auto items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <form className="flex flex-col w-full max-w-3xl mx-auto text-white border-solid border-2 rounded-sm p-6 border-white">
          <h1 className="text-xl font-bold  text-center">Tartigrade Employee Signup</h1>
          <p className="text-sm text text-foreground text-gray-400 text-center">
            Already have an account?{" "}
            <Link
              className=" font-medium underline text-gray-400"
              href="/sign-in"
            >
              Sign in
            </Link>
          </p>

          {/* <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8 [&>input::placeholder]:text-white/75"> */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input name="first_name" placeholder="First Name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input name="last_name" placeholder="Last Name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input name="email" placeholder="TTG Email Address" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                name="password"
                placeholder="Password"
                minLength={6}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Job Title</Label>
              <Input name="title" placeholder="Job Title" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Level</Label>
              <Input
                name="level"
                value="0"
                readOnly
                className="cursor-default bg-slate-950"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select name="department" required>
                <SelectTrigger className="rounded-b-md">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 [&>span]: text-white ">
                  {departmentOptions.map((department) => (
                    <SelectItem key={department} value={department}>
                      {department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="md:col-span-2 my-2">
            <SubmitButton
              className="w-full bg-white text-black hover:bg-white/40 hover:text-white hover:border-white transition-colors duration-300 ease-in-out"
              formAction={signUpAction}
              pendingText="Signing up..."
            >
              Sign up
            </SubmitButton>
          </div>
          <div className="md:col-span-2">
            <FormMessageWithTimeout message={searchParams} />
          </div>
        </form>
      </div>
      <SmtpMessage />
    </>
  );
}
