"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProjectStatusOrder } from "@/app/student_applications/project_detail_helper";
import { Project_Status, Universities } from "@/utils/types";
import { cn } from "@/lib/utils";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import { ChevronRight } from "lucide-react";

interface ProjectStatusButtonProp {
  initial_status: Project_Status;
  status: Project_Status;
  setProjStatus: (new_status: Project_Status) => void;
  allowClick: boolean;
  projectSponsor: string | null;
  dispatchUniversity: Universities | null;
}

const statusConfig: Record<Project_Status, { color: string }> = {
  NEW: { color: "bg-[#788292]" },
  DRAFT: { color: "bg-white text-black" },
  REVIEW: { color: "bg-[#D7B634]" },
  REJECTED: { color: "bg-[#E75973]" },
  APPROVED: { color: "bg-[#81C26C]" },
  DISPATCHED: { color: "bg-[#000080]" },
  AWARDED: { color: "bg-[#4B006E]" },
  ACTIVE: { color: "bg-[#008080]" },
  COMPLETED: { color: "bg-[#154406]" },
  CANCELLED: { color: "bg-black" },
};
const checkStatusSelectable = (
  initial_status: Project_Status,
  targetStatus: Project_Status,
  projectSponsor: string | null,
  dispatchUniversity: Universities | null
): boolean => {
  const initialIndex = ProjectStatusOrder.indexOf(initial_status);
  const targetIndex = ProjectStatusOrder.indexOf(targetStatus);


  // the status  in front is selectable only if the initial is not Rejected
  if (targetIndex === initialIndex + 1 && initial_status !==  Project_Status.REJECTED) return true;
  if (initialIndex === targetIndex) return true; // if the user want to set the status to original status, allow them to

  if (
    initial_status === Project_Status.REVIEW &&
    (targetStatus === Project_Status.REJECTED ||
      targetStatus === Project_Status.APPROVED)
  )
    return true;
  
  if (
    initial_status === Project_Status.APPROVED &&
    targetStatus === Project_Status.REJECTED
  ) {
    return true;
  }

  if (initial_status === Project_Status.REJECTED && targetStatus === Project_Status.REVIEW) 
    return true;

  // NEW CONDITION: Prevent moving from APPROVED → DISPATCHED if no sponsor or university
  if (
    initial_status === Project_Status.REJECTED &&
    targetStatus === Project_Status.REVIEW
  )
    return true;
  return false;
};

function getNextStatus(
  currentStatus: Project_Status,
  projectSponsor: string | null,
  dispatchUniversity: Universities | null
): Project_Status {
  const currentStatusIndex = ProjectStatusOrder.indexOf(currentStatus);
  const nextStatus =
    currentStatusIndex < ProjectStatusOrder.length - 1
      ? ProjectStatusOrder[currentStatusIndex + 1]
      : currentStatus;

  if (
    currentStatus === Project_Status.APPROVED &&
    nextStatus === Project_Status.DISPATCHED &&
    (!projectSponsor || !dispatchUniversity)
  ) {
    if (!projectSponsor && !dispatchUniversity) {
      alert("You cannot dispatch this project. It does not have a university to dispatch to and it does not have a sponsor.")
      return currentStatus;
    }
    else if (!projectSponsor) {
      alert("You cannot dispatch this project. It does not have a sponsor.")
      return currentStatus;
    }
    else if (!dispatchUniversity) {
      alert("You cannot dispatch this project. It does not have a university to dispatch to.")
      return currentStatus;
    }
  }

  return nextStatus;
}

export function ProjectStatusButton({
  initial_status,
  status,
  setProjStatus,
  allowClick,
  projectSponsor,
  dispatchUniversity,
}: ProjectStatusButtonProp) {
  const currentConfig = statusConfig[status];

  function handleStatusChange(target_status: Project_Status) {
    if (target_status !== status) {
      setProjStatus(target_status);
    }
  }

  const borderColor =
    status === Project_Status.DRAFT
      ? "border-black text-black"
      : "border-white text-white";

  const handleNextStatus = () => {
    const nextStatus = getNextStatus(status, projectSponsor, dispatchUniversity);
    if (checkStatusSelectable(initial_status, nextStatus, projectSponsor, dispatchUniversity)) {
      setProjStatus(nextStatus);
    }
  };

  return (
    <div className="flex">
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={!allowClick}>
          <button
            className={cn(
              `h-9 px-4 rounded-l-full flex items-center font-medium text-white focus:outline-none transition-all duration-200 ease-in-out ${allowClick ? "hover:bg-opacity-40" : "cursor-default"}`,
              currentConfig.color
            )}
            disabled={!allowClick}
          >
            <div className="flex items-center space-x-2">
              <div className={cn("w-2 h-2 rounded-full bg-current")} />
              <span>{status}</span>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-40 max-w-40 bg-[#413F46]/95 border-gray-400">
          {ProjectStatusOrder.map((statusKey) => {
            const isSelectable = checkStatusSelectable(
              initial_status,
              statusKey,
              projectSponsor,
              dispatchUniversity
            );
            return (
              <DropdownMenuItem
                key={statusKey}
                disabled={!isSelectable}
                onSelect={() =>
                  isSelectable && allowClick && handleStatusChange(statusKey)
                }
                className={cn(
                  "flex items-center space-x-2 text-white focus:outline-none",
                  "transition-colors duration-100 ease-in-out",
                  "rounded-sm",
                  "pl-2",
                  isSelectable
                    ? "hover:bg-gray-800"
                    : "opacity-50 cursor-not-allowed"
                )}
              >
                <div
                  className={cn(
                    "w-2 h-2 rounded-full",
                    statusConfig[statusKey].color
                  )}
                />
                <span>{statusKey}</span>
                {statusKey === status && <span className="ml-auto">✓</span>}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
      <button
        onClick={handleNextStatus}
        className={cn(
          `h-9 px-2 rounded-r-full border-l flex items-center transition-all duration-200 ease-in-out ${allowClick ? "hover:bg-opacity-40" : "cursor-default"}`,
          currentConfig.color,
          borderColor
        )}
        disabled={!allowClick}
      >
        <ChevronRight className={`h-5 w-5 ${borderColor}`} />
      </button>
    </div>
  );
}
