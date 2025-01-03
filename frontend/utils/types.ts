export enum UserRole{
    EMPLOYEE = "employee",
    STUDENT = "student"
}
export interface Employee{
    email: string;
    password: string;
    full_name: string;
    level: number;
    Employee_id: string;
}
export interface Student{
    email: string;
    password: string;
    full_name: string;
    university: string;
    major: string;
    github?: string;
    team_id: string;
}

export enum EmployeeLevel {
    LEVEL_0 = 0,
    LEVEL_1 = 1,
    LEVEL_2 = 2,
    LEVEL_3 = 3, 
}

export interface AuthResult {
    isAuthenticated: boolean;
    userRole: UserRole| null;
    userInfo?: Employee | Student | null;
}

export enum EmployeePages {
    PROJECTS = "Projects",
    TRAINING = "Training",
    SPONSORED_PROJECTS = "Sponsored Projects",
    SETTINGS = "Employee Settings"
}

export interface Project {
    project_id: string; 
    title: string;
    creator_email: string;
    approval_email: string | null; 
    sponsor_email: string | null; 
    teamID: string | null; 
    description: string;
    department: Department_Types; 
    created_date: string; 
    approved_date: string | null; 
    modified_date: string | null;
    start_date: string | null;
    github: string | null;
    status: Project_Status;
    university: Universities | null;
    application_link: string | null;
    team_max_size: number | null;
    link_active: boolean | null;
    application_deadline: string | null;
    applications_allowed: boolean | null;
    team_min_size: number | null;
}

export enum Department_Types{
    ENGINEERING, COMPUTER_SCIENCE, BIOMEDICAL, SUSTAINABILITY
}

export enum Universities{
    UofC= "University of Calgary", 
    UBC = "University of British Columbia"
}


export enum Project_Status {
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    DRAFT = "DRAFT",
    UNDER_REVIEW = "UNDER_REVIEW",
    DISPATCHED = "DISPATCHED",
    ACTIVE = "ACTIVE",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    AWARDED = "AWARDED",
}

export enum Application_Status {
    PENDING = "PENDING", 
    REJECTED = "REJECTED", 
    APPROVED = "APPROVED"
}

export interface Member {
    full_name: string;
    email: string;
    role: string;
    major: string;
    resume: string;
  }
  
  export interface Application {
    application_id: number;
    project_id: number;
    team_name: string;
    university: string ; 
    status: Application_Status;
    members: Member[]; // jsonb
    size: number;
    about_us: string | null; 
    submission_date: string;
    approval_date: string | null; // can be null because not every project will be approved
  }