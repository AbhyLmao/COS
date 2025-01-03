"use client"
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Application, Application_Status } from "@/utils/types";
import { createClient } from "@/utils/supabase/client";
import { ConfirmationDialog, ConfirmationDialogProp } from "../confirmationPopup";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface TeamDetailsDialogProps {
  team: Application | null;
  onClose: () => void;
  onApprove?: ( application_id: number, projectId: number, university: string) => void;
  onReject?: (application_id: number) => void;
  onPending?: (application_id: number) => void;
}

/**
 * Create a signed url for the resume file and open it in a new tab
 * @param resume_filepath The path to the resume file
 */
async function openResume(resume_filepath: string) {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from("applicants_resumes")
    .createSignedUrl(resume_filepath, 600); // this link is valid for 10mins
  if (data?.signedUrl) {
    window.open(data.signedUrl, "_blank");
  } else {
    console.error("Error fetching resume:", error?.message);
    alert("Unable to fetch the resume. Please try again.");
  }
}

export function TeamDetailsDialog({team,onClose,onApprove,onReject, onPending}: TeamDetailsDialogProps) {
  if (!team ) return null;
  const displayRejectBtn = team.status === Application_Status.PENDING || team.status === Application_Status.APPROVED; // if the btn current status is pending or pending, then display rejected button
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogProps, setDialogProps] = useState<ConfirmationDialogProp | null>(null);

  /**
   * Will activate the confirmation popup
   * @param application_id the application to approve
   * @param project_id the project that the application is for
   * @param university the university the application is for
   */
  const handleApproveClick = (application_id: number, project_id: number, university: string) => {
    setDialogProps({
      title: "Confirm Approval",
      description: (
        <>
          Are you sure you want to approve{" "}
          <span className="font-bold">{team.team_name}</span> application?
          This action cannot be undone
        </>
      ),
      confirmationLabel: "Approve",
      onConfirm: () => {
        handleConfirmApprove(application_id, project_id, university);
      },
      onCancel: () => {handleCancelConfirm()},
    });
    setDialogOpen(true);
  };
  const handleConfirmApprove = (application_id: number, project_id: number, university: string) => {
    onApprove?.(application_id, project_id, university);
    setDialogOpen(false)
    onClose();// close the view team detail popup
  }
  function handleCancelConfirm () {
    setDialogOpen(false); 
    onClose();
  }
  return (
    <>
      <DialogContent className="bg-gray-900 text-white max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">{team.team_name}</DialogTitle>
          </div>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-gray-400 mb-2">Team detail:</p>
            <p>{team.about_us}</p>
          </div>
          <div>
            <p className="text-gray-400 mb-2">Team members:</p>
            <div className="space-y-2">
              {team.members.map((member, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-800 p-2 rounded-md"
                >
                  <div>
                    <p>{member.full_name}</p>
                    <p className="text-sm text-gray-400">{member.role}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openResume(member.resume)}
                  >
                    View Resume
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <DialogClose asChild>
              {displayRejectBtn ? (
                <Button
                  variant="outline"
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400"
                  onClick={() => onReject?.(team.application_id)}
                  disabled={!onReject}
                >
                  Reject
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400"
                  onClick={() => onPending?.(team.application_id)}
                  disabled={!onPending}
                >
                  Pending
                </Button>
              )}
            </DialogClose>
            <Button
              variant="outline"
              className="bg-green-500/10 hover:bg-green-500/20 text-green-400"
              onClick={() =>
                onApprove &&
                handleApproveClick(
                  team.application_id,
                  team.project_id,
                  team?.university
                )
              }
              disabled={!onApprove}
            >
              Approve
            </Button>
          </div>
        </div>
        {/* Alert Dialog will display when the user clicks the approve button */}
        <AlertDialog open={dialogOpen} onOpenChange={() => setDialogOpen(false)}>
          {dialogProps && <ConfirmationDialog {...dialogProps} />}
        </AlertDialog>
      </DialogContent>
    </>
  );
}
