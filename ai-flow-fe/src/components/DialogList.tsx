"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {Node , Edge} from '@xyflow/react'
import { useWorkflowStore } from "@/store/workflowStore"


type Workflow = {
  id: string
  enabled:boolean
  userId:string
  title: string
  nodes: Node[]
  connections: Edge[]
}

export function DialogList({
  buttonName,
  setNodes,
  setEdges,
  nodes,
  connections,
  userId,
  enabled = true,
}: {
  buttonName: string
  setNodes: (nodes: Node[]) => void
  setEdges: (edges: Edge[]) => void
  nodes: Node[]
  connections: Edge[]
  userId: string
  enabled?: boolean
}) {
  const [data, setData] = useState<Workflow[]>([])
  const [title, setTitle] = useState("")
  const {setWorkflowId,setWorkflow} = useWorkflowStore();
  // fetch workflows for user
  const handleFetch = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/v1/workflow/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      if (!res.ok) throw new Error("Failed to fetch workflows")

      const json = await res.json()
      setData(json.message)
    } catch (error) {
      console.error("Error fetching workflows:", error)
    }
  }

  // save workflow for user
  const handleSave = async () => {
    try {
      const body = {
        title,
        enabled,
        nodes,
        connections,
        userId,
      }

      const res = await fetch("http://localhost:5000/api/v1/workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error("Failed to save workflow")

      const json = await res.json()
      console.log("Saved workflow:", json)
      setTitle("")
      handleFetch() // refresh list after save
    } catch (error) {
      console.error("Error saving workflow:", error)
    }
  }

  const handleWorkflowClick = (workflow: Workflow) => {
    setWorkflowId(workflow.id)
    console.log("workflow to set",workflow)
    setWorkflow(workflow) 
    setNodes(workflow.nodes)
    setEdges(workflow.connections)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={handleFetch}>
          {buttonName}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Workflows</DialogTitle>
          <DialogDescription>
            Load or save your workflows
          </DialogDescription>
        </DialogHeader>

        {/* Save workflow section */}
        <div className="grid gap-3 mb-4">
          <Label htmlFor="workflow-title">Workflow Title</Label>
          <Input
            id="workflow-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter workflow name"
          />
          <Button onClick={handleSave} disabled={!title}>
            Save Workflow
          </Button>
        </div>

        {/* List workflows section */}
        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {data.length === 0 ? (
            <div className="text-gray-500">No workflows yet</div>
          ) : (
            data.map((e) => (
              <div
                key={e.id}
                className="p-2 border rounded cursor-pointer hover:bg-gray-100"
                onClick={() => handleWorkflowClick(e)}
              >
                {e.title}
              </div>
            ))
          )}
        </div>

        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="outline" type="button">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
