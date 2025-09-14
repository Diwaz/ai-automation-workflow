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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function DialogButton({ buttonName }: { buttonName: string }) {
  const [title, setTitle] = useState("")
  const [provider, setProvider] = useState("")
  const [apiKey, setApiKey] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const body = {
      title,
      provider,
      apiKey,
      userId: "bf62dba5-4fff-4823-a147-00ac00630169"
    }

    try {
      const res = await fetch("http://localhost:5000/api/v1/credential", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        throw new Error("Failed to save workflow")
      }

      const data = await res.json()
      console.log("Saved:", data)
      // optionally reset form
      setTitle("")
      setProvider("")
      setApiKey("")
    } catch (error) {
      console.error("Error saving workflow:", error)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">{buttonName}</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Save Credentials</DialogTitle>
            <DialogDescription>
              Save your app credentials to load them when executing the workflow.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            {/* Title input */}
            <div className="grid gap-3">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter workflow title"
              />
            </div>

            {/* Provider select */}
            <div className="grid gap-3">
              <Label htmlFor="provider">Provider</Label>
              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Provider</SelectLabel>
                    <SelectItem value="telegram">Telegram</SelectItem>
                    <SelectItem value="whatsapp">Whatsapp</SelectItem>
                    <SelectItem value="gmail">Gmail</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* API key input */}
            <div className="grid gap-3">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter API Key"
              />
            </div>
          </div>

          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
