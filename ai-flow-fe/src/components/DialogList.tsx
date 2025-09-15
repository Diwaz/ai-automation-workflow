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

type Workflow = {
  id: string
  title: string
  nodes: any
  connections: any
}

export function DialogList({
  buttonName,
  setNodes,
  setEdges,
}: {
  buttonName: string
  setNodes: (nodes: any) => void
  setEdges: (edges: any) => void
}) {
  const [data, setData] = useState<Workflow[]>([])

  const handleSubmit = async () => {
    const body = {
      userId: "bf62dba5-4fff-4823-a147-00ac00630169",
    }

    try {
      const res = await fetch("http://localhost:5000/api/v1/workflow/get", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        throw new Error("Failed to fetch workflows")
      }

      const data = await res.json()
      console.log("Fetched workflows:", data.message)
      setData(data.message) // assume API returns { message: Workflow[] }
    } catch (error) {
      console.error("Error fetching workflows:", error)
    }
  }

  const handleWorkflowClick = (workflow: Workflow) => {
    console.log("Selected workflow:", workflow)
    setNodes(workflow.nodes)
    setEdges(workflow.connections)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          onClick={() => {
            handleSubmit()
          }}
        >
          {buttonName}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Workflows</DialogTitle>
          <DialogDescription>
            Click a workflow to load its nodes and edges
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {data.length === 0 ? (
            <div className="text-gray-500">Nothing to show here</div>
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
