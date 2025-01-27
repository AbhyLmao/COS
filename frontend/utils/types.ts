export enum UserRole{
    EMPLOYEE = "employee",
    STUDENT = "student"
}
export interface Employee{
    email: string;
    password: string;
    full_name: string;
    level: number;
    employee_id: string;
    title: string;
    department: string;
}
export interface Student{
    email: string;
    password: string;
    full_name: string;
    university: string;
    major: string;
    github?: string;
    team_id: string;
    ttg_email: string;
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
    SETTINGS = "Employee Settings",
    CREATE_PROJECT = "Create Project",
}

export enum Department_Types {
    ENGINEERING = "ENGINEERING",
    COMPUTER_SCIENCE = "COMPUTER_SCIENCE",
    BIOMEDICAL = "BIOMEDICAL",
    SUSTAINABILITY = "SUSTAINABILITY",
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
    activation_date: string | null;
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

export enum Universities{
    UofC= "University of Calgary", 
    UBC = "University of British Columbia"
}


export enum Project_Status {
    NEW = "NEW", // dirty project
    DRAFT = "DRAFT", // cleaned project
    REVIEW = "REVIEW", //project is under review 
    APPROVED = "APPROVED", //Approved by lvl2+ employee
    REJECTED = "REJECTED", // Rejected by lvl2+ employee
    DISPATCHED = "DISPATCHED", //Project was downloaded to be sent to a university
    AWARDED = "AWARDED", // Awarded to team
    ACTIVE = "ACTIVE", //Team is actively working on the project
    COMPLETED = "COMPLETED",//An active project was successfully completed by the team
    CANCELLED = "CANCELLED",// An active project was cancelled 
}

export enum Application_Status {
    PENDING = "PENDING", // Application is under review by an TTG employee
    REJECTED = "REJECTED", // Application is rejected
    APPROVED = "APPROVED"// The application is accepted and the team members are created Capstone Onbaording System accounts
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