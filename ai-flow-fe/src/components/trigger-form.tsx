"use client";

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react";

interface TriggerFormProps extends React.ComponentProps<"div">{
  workflowId: string
}

interface Field {
  id: string,
  type: string,
  label:string
}
export function TriggerForm({
  className,
  workflowId,
  ...props
}: TriggerFormProps) {

  const [fields ,setFields] = useState<Field[]>([])

  const handleFetch = async () => {
    try {
      const res = await fetch(`http://localhost:8000/workflow/${workflowId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      if (!res.ok) throw new Error("Failed to fetch workflows")

      const json = await res.json()
    
      const node = json[0].nodes[0]

      if (node.data.fields){
        console.log("here")
        setFields(node.data.fields)
      }

      console.log("json response workflow",node.data.fields[0])
      console.log("fields",fields)
      // setData(json.message)
    } catch (error) {
      console.error("Error fetching workflows:", error)
    }
  }
  
  useEffect(()=>{
    handleFetch();
    },[])


  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome</CardTitle>
          <CardDescription>
            Fill up the form to begin the process !
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid gap-6">
              
              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Lets Begin 
                </span>
              </div>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  {fields.map((field)=>(

                  <div key={field.id} className="grid gap-3">

                  <Label htmlFor="email">{field.label}</Label>
                  <Input
                    id={field.type}
                    type={field.type}
                    placeholder={field.label}
                    required
                    />
                    </div>
 
                  ))}
               </div> 
                <Button type="submit" className="w-full">
                  Submit
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}
