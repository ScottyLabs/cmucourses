import dagre from "dagre";
import type { Node, Edge } from "reactflow";

const nodeWidth = 180;
const nodeHeight = 60;

export function layoutDAG(
  nodes: Node[],
  edges: Edge[],
  direction: "LR" | "TB" = "LR"
) {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction });

  nodes.forEach((n) => {
    g.setNode(n.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((e) => {
    g.setEdge(e.source, e.target);
  });

  dagre.layout(g);

  const laidOutNodes = nodes.map((n) => {
    const pos = g.node(n.id);
    return {
      ...n,
      position: { x: pos.x - nodeWidth / 2, y: pos.y - nodeHeight / 2 },
    };
  });

  return { nodes: laidOutNodes, edges };
}
