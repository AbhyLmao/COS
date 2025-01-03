# COS
Capstone Onboarding Project

## File structure:
```
/app
  /employee
    - page.tsx              # Employee's dashboard or home page
    /profile
      - page.tsx            # Employee profile page
    /tasks
      - page.tsx            # Tasks or project-related page for employees
  /student
    - page.tsx              # Student's dashboard or home page
    /profile
      - page.tsx            # Student profile page
    /courses
      - page.tsx            # Courses page for students
  /sign-in
    - page.tsx              # Sign-in page
  /tutorial
    /connect-supabase-steps
      - page.tsx            # Tutorial steps for connecting to Supabase
    /sign-up-user-steps
      - page.tsx            # Steps for user registration
```

## Data Types
### Project Status
- **DRAFT**: The project is being created by the creator and has not yet been submitted.
- **SUBMITTED**: The project has been submitted for review.
- **UNDER_REVIEW**: The project is currently being reviewed.
- **RETURNED**: The project was reviewed and returned to the creator for edits.
- **APPROVED**: The project has been reviewed and approved.
- **REJECTED**: The project has been reviewed and rejected.
- **DISPATCHED**: The project has been sent to sponsors or other departments for execution.
- **IN_PROGRESS**: Work on the project has started.
- **COMPLETED**: The project has been successfully completed.
- **CANCELLED**: The project was cancelled before completion.
