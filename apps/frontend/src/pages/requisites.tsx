import { useEffect, useMemo, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
} from "reactflow";
import "reactflow/dist/style.css";

import { Page } from "~/components/Page";
import { layoutDAG } from "~/layoutGraph";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

type CourseNode = {
  courseID: string;
  name: string;
  department: string;
  units: number | string | null;
};

type CourseEdge = {
  source: string;
  target: string;
  kind: "prereq";
};

interface GraphResponse {
  nodes: Record<string, CourseNode>;
  edges: CourseEdge[];
}

export default function Requisites() {
  const [rawNodes, setRawNodes] = useState<Record<string, CourseNode>>({});
  const [rawEdges, setRawEdges] = useState<CourseEdge[]>([]);
  const [search, setSearch] = useState("");

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // fetch graph once
  useEffect(() => {
    async function loadGraph() {
      const res = await fetch(`${BACKEND_URL}/courses/requisites-graph`);
      const data: GraphResponse = await res.json();
      setRawNodes(data.nodes);
      setRawEdges(data.edges);
    }
    loadGraph();
  }, []);

  // build + layout nodes/edges when raw data changes
  useEffect(() => {
    const nodeList: Node[] = Object.values(rawNodes).map((n) => ({
      id: n.courseID,
      position: { x: 0, y: 0 },
      data: {
        label: (
          <div className="text-xs">
            <strong>{n.courseID}</strong>
            <div className="truncate max-w-[180px]">{n.name}</div>
          </div>
        ),
      },
      style: {
        border: "1px solid #d4d4d8",
        padding: 6,
        borderRadius: 6,
        background: "#fff",
      },
    }));

    const edgeList: Edge[] = rawEdges.map((e, i) => ({
      id: `e-${i}`,
      source: e.source,
      target: e.target,
      type: "smoothstep",
    }));

    if (!nodeList.length) return;

    const { nodes: laidNodes, edges: laidEdges } = layoutDAG(
      nodeList,
      edgeList,
      "LR"
    );

    setNodes(laidNodes);
    setEdges(laidEdges);
  }, [rawNodes, rawEdges, setNodes, setEdges]);

  const highlightedIds = useMemo(() => {
    if (!search) return new Set<string>();
    const q = search.toLowerCase();
    return new Set(
      Object.values(rawNodes)
        .filter(
          (n) =>
            n.courseID.toLowerCase().includes(q) ||
            n.name.toLowerCase().includes(q)
        )
        .map((n) => n.courseID)
    );
  }, [search, rawNodes]);

  const displayNodes = nodes.map((n) => ({
    ...n,
    style: {
      ...n.style,
      borderColor: highlightedIds.has(n.id) ? "#2563eb" : "#d4d4d8",
      boxShadow: highlightedIds.has(n.id)
        ? "0 0 0 2px rgba(37,99,235,0.4)"
        : "none",
    },
  }));

  const content = (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b flex gap-3 items-center">
        <h1 className="text-lg font-semibold">Course Requisites Graph</h1>
        <input
          className="border px-2 py-1 rounded text-sm"
          placeholder="Search course (e.g. 15-112)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="ml-auto text-xs text-gray-500">
          Scroll to zoom, drag to pan.
        </span>
      </div>

      <div className="flex-1 h-[75vh]">
        <ReactFlow
          nodes={displayNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
        >
          <MiniMap pannable zoomable />
          <Controls />
          <Background />
        </ReactFlow>
      </div>
    </div>
  );

  return <Page activePage="requisites" content={content} />;
}
