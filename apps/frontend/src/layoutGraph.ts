import * as dagre from "dagre";
import type { Node, Edge } from "reactflow";

const NODE_WIDTH = 180;
const NODE_HEIGHT = 60;

export function layoutDAG(
  nodes: Node[],
  edges: Edge[],
  direction: "LR" | "TB" = "LR"
) {
  const g = new dagre.graphlib.Graph({ directed: true });

  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction });

  nodes.forEach((n) => {
    g.setNode(n.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((e) => g.setEdge(e.source, e.target));

  dagre.layout(g);

  return {
    nodes: nodes.map((n) => {
      const pos = g.node(n.id);
      return {
        ...n,
        position: {
          x: pos.x - NODE_WIDTH / 2,
          y: pos.y - NODE_HEIGHT / 2,
        },
      };
    }),
    edges,
  };
}
