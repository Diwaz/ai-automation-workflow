import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { newNodeParams } from "@/lib/types";
import { NodeLibrary } from "./NodesLibrary";

export const NodeSheet = ({
  isOpen,
  openSheet,
  addNewNode,
  closeSheet,
}: {
  isOpen: boolean;
  openSheet: () => void;
  addNewNode: (data: newNodeParams) => void;
  closeSheet: () => void;
}) => {
  return (
    <Sheet
      open={isOpen}
      onOpenChange={(value) => (value ? openSheet() : closeSheet())}
    >
      <SheetContent className="bg-[#414244] ease-in-out ">
        <SheetHeader>
          <SheetTitle className="text-amber-500 text-lg">
            ALL TOOLS
          </SheetTitle>
          <SheetDescription className="text-white">
            
          </SheetDescription>
          <div>
            <NodeLibrary addNode={addNewNode} />
          </div>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};