import { create } from "zustand";

type Field = {
  id: string;
  label: string;
  type: string;
};

type FormStore = {
  forms: Record<string, Field[]>; // nodeId -> fields
  saveForm: (nodeId: string, fields: Field[]) => void;
  getForm: (nodeId: string) => Field[] | undefined;
};

export const useFormStore = create<FormStore>((set, get) => ({
  forms: {},

  saveForm: (nodeId, fields) =>
    set((state) => ({
      forms: { ...state.forms, [nodeId]: fields },
    })),

  getForm: (nodeId) => get().forms[nodeId],
}));
