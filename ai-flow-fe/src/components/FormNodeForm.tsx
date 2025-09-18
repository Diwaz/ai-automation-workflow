"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useFormStore } from "@/store/useFormStore";
import { Trash2 } from "lucide-react";
import {FormNode} from '@/lib/types'
type Field = {
  id: string;
  label: string;
  type: string;
};

export default function FormNodeForm({  node }: { node:FormNode }) {
  const { saveForm, getForm } = useFormStore();
  const [fields, setFields] = useState<Field[]>(node.fields ?? []);
  const [newLabel, setNewLabel] = useState("");
  const [newType, setNewType] = useState("text");

  // Load saved fields for this nodeId on mount
  useEffect(() => {

        if (!node.fields) {
            node.fields = [];
            }

    const existing = getForm(node.id);
    if (existing)
        {
            node.fields = existing;
            setFields(existing);
        } 
  }, [node.id, getForm,node]);

  function addField() {
    if (!newLabel.trim()) return ;
 const newField = { id: crypto.randomUUID(), label: newLabel, type: newType };
    const updated = [...fields, newField];
    setFields(updated);
    node.fields = updated; // keep node in sync
  }

function deleteField(id: string) {
    const updated = fields.filter((f) => f.id !== id);
    setFields(updated);
    node.fields = updated;
  }

  function handleSave() {
    saveForm(node.id, fields); // persist globally
    node.fields = fields; // sync to node
  }
  return (
    <div className="flex flex-col gap-4">
      {/* Form Fields Preview */}
      <form className="flex flex-col gap-3">
        {fields.length === 0 && (
          <p className="text-muted-foreground text-sm">No fields yet.</p>
        )}

        {fields.map((field) => (
          <div
            key={field.id}
            className="flex items-end justify-between gap-2  rounded p-2"
          >
            <div className="flex flex-col flex-1  gap-1">
              <label className="text-sm font-medium ml-2">{field.label}</label>
              <Input
                type={field.type}
                name={field.label}
                placeholder={field.label}
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteField(field.id)}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        ))}
      </form>

      {/* Add New Field */}
      <Card>
        <CardContent className="flex flex-col gap-3 p-4">
          <Input
            placeholder="Field label"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            
          />

          <Select value={newType} onValueChange={setNewType}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="password">Password</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={addField}>Add Field</Button>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button variant="default" onClick={handleSave}>
        Save Form
      </Button>
    </div>
  );
}
