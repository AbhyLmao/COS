import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Application, Application_Status, Employee, EmployeeLevel } from "@/utils/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { useState } from "react";
import { ConfirmationDialog, ConfirmationDialogProp } from "../confirmationPopup";
import { AlertDialog } from "../ui/alert-dialog";
import { confirmEmployeeAuthorization } from "@/app/student_applications/application";

type ApplicationTableProps = {
  currentApplications: Application[] | [];
  onViewDetails: (newValue: Application | null) => void;
  onDeleteApplication: (application_id: number) => void;
  employeeInfo: Employee
};
function ApplicationTable({currentApplications,onViewDetails,onDeleteApplication, employeeInfo}: ApplicationTableProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogProps, setDialogProps] = useState<ConfirmationDialogProp | null>(null);

  /**
   * if the employee is authorized to delete the application, this function will set the selected application id to the application id
   * @param application_id The application id to delete
   * @param application_status The status of the application
   * @returns
   */
  const handleDeleteClick = (application_id : number, application_status : Application_Status) => {
      if (!confirmEmployeeAuthorization(employeeInfo.level, EmployeeLevel.LEVEL_2)) {
        alert("Deleting an application requires you to be level 2+");
        return;
      }
      if(application_status === Application_Status.APPROVED){
        alert("Can't delete an application that is already approved");
        return;
      }

      const application_team_name = currentApplications.find(application => application.application_id === application_id)?.team_name;
      // set the properties for the confirmation dialog
      setDialogProps({
        title: "Confirm Delete",
        description: (<>Are you sure you want to delete <span className="font-bold">{application_team_name}</span> application? <br />
          This action cannot be undone.</>),
        confirmationLabel: "Delete",
        onConfirm: () => {
          handleConfirmDelete(application_id)
        },
        onCancel:() => {handleCancelDelete()}
      });
      setDialogOpen(true);// setting this state to open the confirmation dialog
  }

  /**
   * This function will delete the application if the user confirms the delete
   */
  const handleConfirmDelete = (application_id: number) => {
    onDeleteApplication(application_id); // call to the parent function to delete the application
    setDialogOpen(false);
  };

  /**
   * This function will close the confirmation dialog
   */
  const handleCancelDelete = () => {
    setDialogOpen(false);
  }
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Team Name</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Submission Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>{}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentApplications.map((applicant) => (
            <TableRow key={applicant.application_id}>
              <TableCell>{applicant.team_name}</TableCell>
              <TableCell>{applicant.size}</TableCell>
              <TableCell>{applicant.submission_date}</TableCell>
              <TableCell>
                <Badge
                  className={`bg-white text-black 
                ${applicant.status === Application_Status.APPROVED ? "bg-green-400 text-white" : ""}
                ${applicant.status === Application_Status.REJECTED ? "bg-red-400 text-white" : ""}`}
                >
                  {applicant.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  onClick={() => onViewDetails(applicant)}
                >
                  View Detail
                </Button>
              </TableCell>
              <TableCell>
                {confirmEmployeeAuthorization(employeeInfo.level, EmployeeLevel.LEVEL_2) && applicant.status != Application_Status.APPROVED &&(
                <Button
                  variant="ghost"
                  onClick={() => handleDeleteClick(applicant.application_id, applicant.status)}
                >
                  <Trash />
                </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {/* Alert Dialog will display when the user clicks the delete button */}
      <AlertDialog open={dialogOpen} onOpenChange={()=> setDialogOpen(false)}>
        {dialogProps && <ConfirmationDialog {...dialogProps}/>}
      </AlertDialog>
    </>
  );
}
export default ApplicationTable;