
export interface TaskNodeData extends Record<string, unknown> {
  id: string;
  name: string;
  dragging: true;
  type: string;
  count: number;
  reqFields?:string[];
  variant: "action" | "trigger" | "ifelse";
  deleteNode: (id: string) => void;
}

export interface FormNode {
  id : string;
  variant: "trigger";
  name: string;
  dragging:true;
  count:number;
  deleteNode:(id:string)=>void;
  reqFields?: string[];
}

export type newNodeParams = {
  name: string;
  type: string;
  variant: string;
};