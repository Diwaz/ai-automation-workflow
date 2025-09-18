
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
type Field = {
  id: string;
  label: string;
  type: string;
};
export interface FormNode {
  id : string;
  variant: "trigger";
  name: string;
  dragging:true;
  type:string;
  count:number;
  data ?: Record<string,unknown>;
  fields?: Field[];
  deleteNode:(id:string)=>void;
  reqFields?: string[];
}

export type newNodeParams = {
  name: string;
  type: string;
  variant: string;
};