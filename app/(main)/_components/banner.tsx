"use client";

import { ConfirmModal } from "@/components/modals/confirm-modal";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useEdgeStore } from "@/lib/edgestore";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface BannerProps{
    documentId: Id<"documents">;
}

export const Banner = ({documentId}:BannerProps) => {
    const router = useRouter();
    const remove = useMutation(api.documents.remove);
    const restore = useMutation(api.documents.restore);
    const document = useQuery(api.documents.getById, {
        documentId: documentId
    });
    const {edgestore} = useEdgeStore();

    const onRemove = async () =>{
        const promise = remove({id: documentId});
        const url = document?.coverImage;
        if(url){
            await edgestore.publicFiles.delete({
                url: url
              });
        }

        toast.promise(promise, {
            success: "Note Deleted",
            loading:"Deleting Note...",
            error:"Failed to delete note"
        })
        router.push('/documents');
    }

    const onRestore = () =>{
        const promise = restore({id: documentId});
        toast.promise(promise, {
            success: "Note restored",
            loading:"Restoring Note...",
            error:"Failed to restore note"
        })
    }

    return (
        <div className="w-full bg-rose-500 text-center text-sm p-2 text-white flex items-center gap-x-2 justify-center">
            <p>
                This page is in the trash
            </p>   
            <Button
                size="sm"
                onClick={onRestore}
                variant="outline"
                className="border-white bg-transparent hover:bg-primary/5 text-white hover:text-white p-1 px-2 h-auto font-normal"
            >
                Restore Page
                </Button>   
            <ConfirmModal onConfirm={onRemove}>
                <Button
                    size="sm"
                    variant="outline"
                    className="border-white bg-transparent hover:bg-primary/5 text-white hover:text-white p-1 px-2 h-auto font-normal"
                >
                    Delete forever
                    </Button>       
            </ConfirmModal>  
        </div>
    )

}