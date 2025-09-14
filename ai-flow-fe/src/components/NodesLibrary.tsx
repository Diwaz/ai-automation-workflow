import { nodeConfigs } from "@/lib/nodes";
import { newNodeParams } from "@/lib/types";
import { ChevronRight, CircleX } from "lucide-react";
import { useState } from "react";
import { RiDeleteBin5Fill } from "react-icons/ri";

export const NodeLibrary = ({
  addNode,
}: {
  addNode: (data: newNodeParams) => void;
}) => {
  const [search, setSearch] = useState("");

  const filteredNodes = Object.entries(nodeConfigs).filter(([key, config]) =>
    config.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 bg-none rounded-xl ">
      <div className="flex shadow-lg items-center bg-[#fffefb] mb-4 px-3 py-2 ">
        <input
          type="text"
          placeholder="Search tools..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-white    placeholder:text-white outline-none"
        />
          <RiDeleteBin5Fill
            className="text-white"
          />

      </div>

      <div className="flex flex-col gap-3">
        {filteredNodes.map(([key, config]) => (
          <div
            key={key}
            className="relative p-3 shadow-sm bg-[#fffefb] rounded-xs flex items-center gap-3  cursor-pointer"
          >
            <img
              src={`/logos/${key}.svg`}
              alt={config.label}
              className="w-8 h-8"
            />
            <div>
              <p className="font-semibold text-black">{config.label}</p>
              <p className="text-sm text-black">{config.description}</p>
            </div>
            <div
              onClick={() =>
                addNode({
                  name: config.label,
                  type: key,
                  variant: config.variant,
                })
              }
              className="absolute inset-0 flex items-center justify-end rounded-md 
                text-white font-bold text-sm opacity-0  transition-opacity"
            >
              <span className="text-white">Add this node</span>
              <ChevronRight />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

//