"use client"
import * as React from "react";

import { cn } from "@/lib/utils";
import { EyeIcon, EyeOffIcon } from "lucide-react";

/**
 * Similar to input but as an icon to show or hide password
 */

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const PasswordInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    const [showPassword,setShowPassword ] = React.useState(false);

    return (
        <div className="relative">
            <input
                type={showPassword ? "text" : "password"}
                className={cn(
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    className,
                )}
                ref={ref}
                {...props}
            />
            <div className={cn("absolute inset-y-0 right-0 flex items-center pr-3 text-white",className)}>
                {showPassword ? (
                    <EyeIcon onClick={() => setShowPassword(false)} className="cursor-pointer" />
                ) : (
                    <EyeOffIcon onClick={() => setShowPassword(true)} className="cursor-pointer" />
                )}
            </div>
        </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
