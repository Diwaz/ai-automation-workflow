import { nodeConfigs } from "@/lib/nodes";
import { newNodeParams } from "@/lib/types";
import { ChevronRight, CircleX } from "lucide-react";
import { useState } from "react";
import { IoSearchOutline } from "react-icons/io5";

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
    <div className=" bg-none rounded-xl ">
        <div className="searchWrapper p-4">

      <div className="flex shadow-lg items-center  mb-4 px-3 py-2 border-[2px] border-[#262626] rounded-sm ">
          <IoSearchOutline
            className="text-white mr-1.5"
            />
        <input
          type="text"
          placeholder="Search tools..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-white  rounded-xs placeholder:text-white outline-none"
          />

      </div>
          </div>

      <div className="flex flex-col gap-3">
        {filteredNodes.map(([key, config]) => (
          <div
            key={key}
            className="relative p-1 px-5 h-20  shadow-sm border-l-4 border-transparent hover:border-[#8a8a8a] rounded-xs flex items-center gap-3 cursor-pointer"
          >
            <img
              src={`/logos/${key}.svg`}
              alt={config.label}
              className="w-8 h-8"
            />
            <div className="">
              <p className="font-semibold text-white text-sm py-1">{config.label}</p>
              <p className="text-xs text-[#636161]">{config.description}</p>
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