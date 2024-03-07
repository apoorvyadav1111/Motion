"use client";

import { Id } from "@/convex/_generated/dataModel";
import { ChevronDown, ChevronRight, LucideIcon, MoreHorizontal, Plus, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useUser } from "@clerk/clerk-react";

interface ItemProps {
    id?: Id<"documents">;
    documentIcon?: string;
    active?: boolean;
    expanded?: boolean;
    isSearch?: boolean;
    level?:number;
    onExpand?: ()=>void;
    label: string;
    onClick?: ()=>void;
    icon: LucideIcon
};

export const Item = ({
    id,
    label,
    onClick,
    icon: Icon,
    documentIcon,
    active,
    expanded,
    isSearch,
    level = 0,
    onExpand
}:ItemProps) => {
    const {user} = useUser();
    const create = useMutation(api.documents.create);
    const archive = useMutation(api.documents.archive);


    const router = useRouter();

    const handleExpand = (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) => {
        event.stopPropagation();
        onExpand?.();
    }
    const ChevronIcon = expanded ? ChevronDown : ChevronRight;

    const onCreate = (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) => {
        event.stopPropagation();
        if (!id) return;
        const promise = create({title:"Untitled", parentDocument: id})
            .then((documentId) => {
                if(!expanded){
                    onExpand?.();
                }
                // router.push(`/documents/${documentId}`);
            })
        toast.promise(promise, {
            success:'New note created',
            loading:'creating a new note...',
            error:'failed to create a new note'
        })
    }

    const onArchive = (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) => {
        event.stopPropagation();
        if(!id) return;
        const promise = archive({id});

        toast.promise(promise, {
            success:"Note moved to trash",
            loading:"Trashing the note...",
            error:"Cannot move note to trash"
        })
    }
    return (
        <div
            onClick={onClick}
            role="button"
            style={{
                paddingLeft:level?`${(level*12)+12}px`:"12px"
            }}
            className={cn(
                "group min-h-[27px] text-sm py-1 px-3 w-full hover:bg-primary/5 flex items-center text-muted-foreground font-medium",
                active && "bg-primary/5 text-primary"
                )}
            >
                {!!id && (
                    <div
                        role="button" 
                        className="h-full rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 mr-1"
                        onClick={(ev)=>handleExpand(ev)}
                    >
                        <ChevronIcon className="h-4 w-4 shrink-0 text-muted-foreground/50"/>
                    </div>
                )}
                {documentIcon ? (
                    <div className="shrink-0 text=[18px] mr-2">
                        {documentIcon}
                    </div>
                ):
                <Icon className="shrink-0 h-[18px] mr-2 text-muted-foreground"/>
                }
                <span className="truncate">{label}</span>
            {
                isSearch && (
                    <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opactiy-100">
                        <span className="text-xs">
                            ⌘K
                        </span>
                    </kbd>
                )
            }
            {
                !!id && (
                    <div className="ml-auto flex items-center gap-x-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger onClick={(ev)=>ev.stopPropagation()} asChild>
                                <div
                                    role="button"
                                    className="opacity-0 group-hover:opacity-100 h-full ml-auto rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600">
                                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-60"
                                align="start"
                                side="right"
                                forceMount
                                >
                                <DropdownMenuItem  onClick={onArchive}>
                                    <Trash className="h-4 w-4 mr-2" />
                                    Delete
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <div className="text-xs text-muted-foreground p-2">
                                    Last edited by: {user?.fullName}
                                </div>
                            </DropdownMenuContent>

                        </DropdownMenu>
                        <div
                            role="button"
                            onClick={onCreate}
                            className="opacity-0 group-hover:opacity-100 h-full ml-auto rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600">
                            <Plus className="h-4 w-4 text-muted-foreground" />
                        </div>
                    </div>
                )
            }
        </div>
    )
}

Item.Skeleton = function ItemSkeleton({level}:{level?:number}){
    return (
        <div
         style={{paddingLeft: level?`${(level*12)+25}px`:"12px"}}
         className="flex get-x-2 by-[3px]"
         >
            <Skeleton className="h-4 w-4"/>
            <Skeleton className="h-4 w-[30%]"/>
         </div>
    )
}