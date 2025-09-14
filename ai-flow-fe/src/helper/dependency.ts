import { Edge, Node } from "@xyflow/react";
type nodesTreeValue = {
  id: string;
//   variant: string;
  type: string;
  children: string[];
};

export const getDependencyData = (nodes: Node[], edges: Edge[]) => {
  const nodesTree: nodesTreeValue[] = nodes.map((n) => ({
    id: n.id,
    // variant: n.data.variant as string,
    type: n.data.type as string,
    children: [],
  }));

  //nodemap = {"node-1" : {id , variant , type , children}}
  //not a copy but reference of TREE
  const nodeMap = Object.fromEntries(nodesTree.map((n) => [n.id, n]));

  //search for the no deIds in edges (source and target)
  console.log("this is how edges look",edges)
  edges.forEach((edge) => {
    const parent = nodeMap[edge.source];
    if (parent) {
      parent.children.push(edge.target);
    }
  });
  const payload = nodesTree.filter((el) => el.children.length > 0);
  console.log("nodesTree ,,,,,,,,,,",nodesTree);
  return payload;
};