"use client"
import {CopyIcon} from "lucide-react";
import {cn} from "@/lib/utils";
import { toast } from "sonner"

interface CopyIconProps {
    value: string;
    className?: string;
    strokeWidth?: number;
}

export default function ClientCopyIcon(props: CopyIconProps) {
    
    return (
        <CopyIcon 
            strokeWidth={props.strokeWidth ?? 1.5}
            className={cn(props.className, "cursor-pointer")} 
            onClick={() => {
                navigator.clipboard.writeText(props.value);
                toast('Copied to clipboard');
            }}
        />
    )
}