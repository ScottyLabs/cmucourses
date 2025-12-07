declare module "dagre" {
  export namespace graphlib {
    class Graph {
      constructor(options?: { directed?: boolean });
      setGraph(graph: { rankdir?: "LR" | "TB" }): void;
      setDefaultEdgeLabel(cb: () => any): void;
      setNode(id: string, cfg: { width: number; height: number }): void;
      setEdge(from: string, to: string): void;
      node(id: string): { x: number; y: number };
    }
  }
  export function layout(g: graphlib.Graph): void;
}
