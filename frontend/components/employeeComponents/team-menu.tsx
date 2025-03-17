import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Crown, FileText } from "lucide-react";
import { openNDA } from "@/components/studentComponents/teamComponent/teamMemberHelper";

type Members = {
  full_name: string;
  role: string;
  email: string;
  ttg: string;
};

type Team = {
  team_name: string;
  university: string;
  members: Members[];
  supervisor_name: string;
  supervisor_email: string;
  nda: string;
  team_lead: string;
};

interface TeamMenuProps {
  onClose: () => void;
  teamsData: Team | null;
  title: string;
}

const TeamMenu: React.FC<TeamMenuProps> = ({ onClose, teamsData, title }) => {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 text-white rounded-lg shadow-lg max-w-[450px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {teamsData ? (
            <>
              <div className='flex flex-col'>
                <span className="text-gray-400">Team Name: </span>
                <div className="flex flex-col bg-gray-800 p-2 rounded-md">
                  <span>{teamsData.team_name}</span>
                </div>
              </div>
              <div className='flex flex-col'>
                <span className="text-gray-400">University: </span>
                <div className="flex flex-col bg-gray-800 p-2 rounded-md">
                  <span>{teamsData.university}</span>
                </div>
              </div>
              <div className='flex flex-col'>
                <span className="text-gray-400">Supervisor: </span>
                  <div
                    className="flex flex-col bg-gray-800 p-2 rounded-md"
                  >
                    <div className='flex items-center justify-between'>
                    <div className='flex'>
                      <p>Name:&nbsp;</p>
                      <p>{teamsData.supervisor_name}</p>
                    </div>
                    </div>
                    <div className='flex'>
                      <p className='text-sm text-gray-400'>Email:&nbsp;</p>
                      <p className='text-sm'> {teamsData.supervisor_email}</p>
                    </div>
                  </div>
              </div>
              <div>
                <div>
                  <span className="text-gray-400">Members:</span>
                </div>
                <div className={`space-y-2 ${teamsData.members.length > 2 ? "max-h-48 overflow-y-scroll scrollbar" : ""}`}>
                  {teamsData.members
                    .sort((a, b) => (a.email === teamsData.team_lead ? -1 : b.email === teamsData.team_lead ? 1 : 0)) // Move team lead to the top
                    .map((member, index) => (
                      <div
                        key={index}
                        className="flex flex-col bg-gray-800 p-2 rounded-md"
                      >
                        <div className='flex items-center justify-between'>
                          <div className='flex'>
                            <p>{member.full_name}</p>
                            <p>{teamsData.team_lead === member.email && <Crown className="ml-2 text-yellow-500" size={18} />}</p>
                          </div>
                        </div>
                        <div className='flex'>
                          <p className='text-sm text-gray-400'>Email:&nbsp;</p>
                          <p className='text-sm'> {member.email}</p>
                        </div>
                        <div className='flex'>
                          <p className='text-sm text-gray-400'>TTG:&nbsp;</p>
                          <p className='text-sm'>{member.ttg ? member.ttg : "N/A"}</p>
                        </div>
                      </div>
                    ))}
                  <div></div>
                </div>
              </div>
              <div className='flex flex-col'>
                <span className="text-gray-400">NDA: </span>
                  <div
                    className="flex flex-col bg-gray-800 p-2 rounded-md"
                  >
                    <div className='flex'>
                      <div>
                        {teamsData.nda ? (
                        <div
                          className="cursor-pointer flex items-center text-blue-400 hover:text-blue-300"
                          onClick={() => {
                            if (teamsData.nda) openNDA(teamsData.nda);
                            console.log("Should open link")
                          }}
                        >
                          <FileText className="mr-2" size={18} />
                          <span>View NDA</span>
                        </div>) : (
                          <div
                          className="cursor-default flex items-center"
                        >
                          <FileText className="mr-2" size={18} />
                          <span>No NDA</span>
                        </div>
                        )}
                      </div>
                    </div>
                  </div>
              </div>
            </>
          ) : (
            <>
              <div className='flex flex-col'>
                <span className="text-gray-400">Team Name: </span>
                <span>N/A</span>
              </div>
              <div className='flex flex-col'>
                <span className="text-gray-400">University: </span>
                <span>N/A</span>
              </div>
              <div className='flex flex-col'>
                <span className="text-gray-400">Supervisor: </span>
                  <div
                    className="flex flex-col bg-gray-800 p-2 rounded-md"
                  >
                    <div className='flex items-center justify-between'>
                    <div className='flex'>
                      <p>Name:&nbsp;</p>
                      <p>N/A</p>
                    </div>
                    </div>
                    <div className='flex'>
                      <p className='text-sm text-gray-400'>Email:&nbsp;</p>
                      <p className='text-sm'>N/A</p>
                    </div>
                  </div>
              </div>
              <div>
                <div>
                  <span className="text-gray-400">Members:</span>
                </div>
                <div>
                    <div
                      className="flex flex-col bg-gray-800 p-2 rounded-md"
                    >
                      <div className='flex items-center justify-between'>
                      <div>
                        <p>No team assigned</p>
                      </div>
                      </div>
                      <div className='flex'>
                        <p className='text-sm text-gray-400'>Email:&nbsp;</p>
                        <p className='text-sm'> N/A</p>
                      </div>
                      <div className='flex'>
                        <p className='text-sm text-gray-400'>TTG:&nbsp;</p>
                        <p className='text-sm'>N/A</p>
                      </div>
                    </div>
                  <div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TeamMenu;
