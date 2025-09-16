"use client";
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { AiNode } from "@/components/nodes/AiNode";
import { PlaceholderNode } from "@/components/PlaceholderNode";
import { TaskNode } from "@/components/nodes/TaskNode";
import { newNodeParams, TaskNodeData } from "@/lib/types";
import { useSheetStore } from "@/store/sheetStore";
import {
  Background,
  Controls,
  Edge,
  addEdge,
  NodeTypes,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  Node,
  Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback } from "react";
import { NodeSheet } from "@/components/SheetComponent";
import { DialogInput } from "@/components/Dialog";
import { DialogList } from "@/components/DialogList";


export default function Page() {
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const { isOpen, openSheet, closeSheet } = useSheetStore();
  const nodeTypes: NodeTypes = {
    taskNode: TaskNode,
    aiNode: AiNode,
  };

  const handleAddNode = ({ name, type, variant }: newNodeParams) => {
    const newNodeId = crypto.randomUUID();
    const newNode: Node = {
      id: newNodeId,
      type: variant,
      position: { x: 500 + nodes.length * 50, y: 200 },
      data: {
        name: name || `Node ${nodes.length + 1}`,
        id: newNodeId,
        type: type,
        deleteNode: handleDeleteNode,
        count: nodes.length + 1,
        // variant: variant,
      } as TaskNodeData,
      draggable: true,
    };

    setNodes((nds) => [...nds, newNode]);
  };
  const handleDeleteNode = (id: string) => {
    setNodes((n) => n.filter((node) => node.id !== id));
  };
  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );


  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Building Your Application
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
 <div className=" h-screen">
        {/* <div className="flex justify-around">
            <button className="bg-red-400 px-2">Save Data</button>
            <DialogList buttonName="List Workflows" setNodes={setNodes} setEdges={setEdges} nodes={nodes} connections={edges} userId="bf62dba5-4fff-4823-a147-00ac00630169" />
            <DialogInput 
            buttonName={'Load Creds'}
            />
        </div> */}
     <ReactFlowProvider>
        <ReactFlow
          style={{ height: "90%" }}
          minZoom={0.8}
          fitView={false}
          deleteKeyCode={null}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodes={nodes}
          edges={edges}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        >
          <Controls className="text-black" position="top-left" />
          <Background gap={20} size={1} bgColor="#2d2e2e" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer">
            {nodes.length === 0 && <PlaceholderNode />}
          </div>

          <NodeSheet
            closeSheet={closeSheet}
            isOpen={isOpen}
            openSheet={openSheet}
            addNewNode={handleAddNode}
          />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
          <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
