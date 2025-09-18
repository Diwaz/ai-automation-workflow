import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
} from "../ui/dialog";
import { Handle, NodeToolbar, Position } from "@xyflow/react";
import NodeForm from "../NodeForm";
import { Button } from "../ui/button";
import { TaskNodeData } from "@/lib/types";
import { useSheetStore } from "@/store/sheetStore";
import { RiDeleteBin5Fill } from "react-icons/ri";
import Image from "next/image";

export const TaskNode = ({ data }: { data: TaskNodeData }) => {
  const { openSheet } = useSheetStore();
  return (
    <Dialog>
      <div className="relative bg-[#1B1720] text-white p-8 rounded-2xl flex items-center">
        <NodeToolbar isVisible={true} position={Position.Top}>
          <RiDeleteBin5Fill
            className="text-white"
            onClick={() => data.deleteNode(data.id)}
          />
        </NodeToolbar>
        <NodeToolbar isVisible={true} position={Position.Right}>
          <Button
            className="p-1 h-5 w-5"
            // variant={"outline"}
            onClick={() => {
              console.log("clicked");
              openSheet();
            }}
          >
            +
          </Button>
        </NodeToolbar>

        <DialogTrigger asChild>
          <div className="flex items-center space-x-2">
            <Handle type="source" position={Position.Right} />
              <Image
                src={`/logos/${data.type}.svg`}
                alt={data.type}
                width={32} 
                height={32} 
              />

            {data.count !== 1 && (
                <Handle
                type="target"
                isConnectableStart={false}
                position={Position.Left}
                />
            )}
          </div>
        </DialogTrigger>
      </div>

      <DialogContent >
        <DialogHeader>
          <DialogTitle>Credentials</DialogTitle>
        </DialogHeader>
        <div>
          <NodeForm type={data.type} fields={data.reqFields} />
        </div>
      </DialogContent>
      <p className="text-blue-600 flex justify-center">
    {data.name}
      </p>
    </Dialog>
  );
};