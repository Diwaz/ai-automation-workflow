import {create} from 'zustand';
import {Workflow} from "../lib/types"


type workFlowState = {
    workflowId : string;
    workFlow:Workflow 
    setWorkflowId: (id:string)=>void;
    getWorkflowId: ()=> string;
    setWorkflow:(workflow:Workflow)=>void;
    getWorkflow:()=>Workflow | undefined;
    
}

export const useWorkflowStore = create<workFlowState>((set,get)=>({
    workflowId:'',

    workFlow:{
        id:'',
        userId:'',
        nodes:[],
        connections:[],
        enabled:false,
        title:''
    },

    setWorkflowId:(id)=>set({
        workflowId: id
    }),

    getWorkflowId:()=>get().workflowId,

    setWorkflow:(newWorkflow)=>set({
        workFlow:newWorkflow
    }),

    getWorkflow:()=>get().workFlow,


}))