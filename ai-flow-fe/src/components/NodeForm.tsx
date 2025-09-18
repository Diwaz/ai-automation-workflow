import { nodeConfigs } from "@/lib/nodes";

export default function NodeForm({ type,fields }: { type: string,fields?:string[] }) {
  const config = nodeConfigs[type as keyof typeof nodeConfigs];

  if (!config) return <p>Unknown node type</p>;
  return (
    <form className="flex flex-col gap-3 text-white">
      {config.formFields.map((field) => (
        <div key={field?.name} className="flex flex-col gap-2">
          {/* {field?.type === 'formNode' ? <div>Form</div>:<div>Creds</div>} */}
        <label className="text-white">{field?.name}</label>
        <input
          key={field?.name}
          type={field?.type}
          name={field?.name}
          placeholder={field?.placeholder}
          required={field?.required}
          className="border rounded p-2 text-black"
          />
          </div>
      ))}
    </form>
  );
}