"use client";

import { useMutation, useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import { Spinner } from "@/components/spinner";
import { Search, Trash, Undo } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { Id } from "@/convex/_generated/dataModel";
import { useEdgeStore } from "@/lib/edgestore";
import { PartialBlock } from "@blocknote/core";

export const TrashBox = () => {
    const router = useRouter();
    const params = useParams();
    const documents = useQuery(api.documents.getTrash);
    const restore = useMutation(api.documents.restore);
    const remove = useMutation(api.documents.remove);
    const {edgestore} = useEdgeStore();

    const [search, setSearch] = useState("");

    const filteredDocument = documents?.filter((document)=>{
        return document.title.toLowerCase().includes(search.toLowerCase())
    });


    const onClick = (documentId: string) => {
        router.push(`/documents/${documentId}`);
    };

    const onRestore = (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>,
        documentId: Id<"documents">
    ) => {
        event.stopPropagation();
        const promise = restore({id: documentId});
        toast.promise(promise,{
            success:'Note restored',
            loading:'Restoring note...',
            error:'Failed to restore note'
        })
    }

    const onRemove = async (
        documentId: Id<"documents">,
        url?: string,
        content?:string
    ) => {
        const promise = remove({id: documentId});

        if(url){
            await edgestore.publicFiles.delete({url:url});
        }

        const contentJson: PartialBlock[] = JSON.parse(content || "") as PartialBlock[];

        contentJson.map(async (block: PartialBlock)=>{
            if(block.type === "image" && block.props!==undefined && block.props.url !== undefined){
                await edgestore.publicFiles.delete({url:block.props.url});
            }
        })

        toast.promise(promise,{
            success:'Note deleted',
            loading:'Deleting note...',
            error:'Failed to delete note'
        })

        if (params.documentId === documentId){
            router.push(`/documents`)
        }
    }

    if (documents === undefined){
        return (
            <div className="h-full flex items-center justify-center p-4">
                <Spinner size='lg'/>
            </div>
        )
    }

    return (
        <div className="text-sm">
            <div className="flex items-center gap-x-1 p-2">
                <Search className="h-4 w-4" />
                <Input 
                    value={search}
                    onChange={(e)=>setSearch(e.target.value)}
                    className="h-7 px-2 focus-visible:ring-transparent bg-secondary"
                    placeholder="Filter by page title.."
                />
            </div>
            <div
                className="mt-2 px-1 pb-1">
                <p className="hidden last:block text-xs text-center text-muted-foreground pb-2">
                        No documents found.
                </p>
                {
                    filteredDocument?.map((document)=>(
                        <div
                            key={document._id}
                            role="button"
                            onClick={()=>onClick(document._id)}
                            className="text-sm rounded-sm w-full hover:bg-primary/5 flex items-center text-primary justify-between"
                            >
                                <span className="truncate pl-2">
                                    {document.title}
                                </span>
                                <div className="flex items-center">
                                    <div
                                        role="button"
                                        onClick={(e)=>onRestore(e, document._id)}
                                        className="rounded-sm p-2 hover:bg-neutral-200 dark:hover:bg-neutral-600"
                                    >   
                                        <Undo className="h-4 w-4" />
                                    </div>
                                    <ConfirmModal onConfirm={()=> onRemove(document._id, document.coverImage, document.content)} >
                                    <div
                                        role="button"
                                        className="rounded-sm p-2 hover:bg-neutral-200  dark:hover:bg-neutral-600"
                                        >
                                        <Trash className="h-4 w-4"/>
                                    </div>
                                    </ConfirmModal>   
                                </div>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}