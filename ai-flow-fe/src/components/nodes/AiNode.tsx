import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
} from "../ui/dialog";
import { Handle, NodeToolbar, Position } from "@xyflow/react";
import NodeForm from "../NodeForm";
import { TaskNodeData } from "@/lib/types";
import { RiDeleteBin5Fill } from "react-icons/ri";

export const AiNode = ({ data }: { data: TaskNodeData }) => {
  return (
    <Dialog>
      <div className="relative bg-transparent border border-dashed px-4 py-2 text-white p-8  flex items-center">
        <NodeToolbar isVisible={true} position={Position.Top}>
          <RiDeleteBin5Fill
            className="text-white"
            onClick={() => data.deleteNode(data.id)}
          />

        </NodeToolbar>

        <DialogTrigger asChild>
          <div className="flex w-full items-center justify-evenly">
            <Handle type="source" position={Position.Right} />
            <img
              src={`/logos/${data.type}.svg`}
              alt={data.type}
              className="w-16 h-16 justify-center-safe"
            />
            <span className="text-xl"> AI Agent</span>

            {data.count !== 1 && (
              <Handle type="target" position={Position.Left} />
            )}
          </div>
        </DialogTrigger>
      </div>

      <DialogContent className="bg-white ">
        <DialogHeader>
          <DialogTitle>Fill this form</DialogTitle>
        </DialogHeader>
        <div>
          <NodeForm type={data.type} />
        </div>
      </DialogContent>
    </Dialog>
  );
};