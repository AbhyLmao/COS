import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "./ui/button";

export type ConfirmationDialogProp = {
  title: string;
  description: React.ReactNode;
  confirmationLabel: string;
  onConfirm: () => void; 
  onCancel: () => void;
};
export const ConfirmationDialog = ({title, description, confirmationLabel, onConfirm, onCancel}:ConfirmationDialogProp) => {
  
  return (
    <>
        <AlertDialogContent className="bg-black bg-opacity-70">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white text-center">{title}</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-200 text-base">{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild><Button variant="outline" className="hover:bg-red-500/40 text-red-400" onClick={() => onCancel()}>Cancel</Button></AlertDialogCancel>
            <AlertDialogAction asChild>
                <Button
                variant="outline"
                className="bg-gray-200 hover:bg-white/40 text-black"
                children={confirmationLabel}
                onClick={() => onConfirm()}
            />
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
        </>
  );
};
