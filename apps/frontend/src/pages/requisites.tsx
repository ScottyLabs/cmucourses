import type { NextPage } from "next";
import { useEffect, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";

import axios from "axios";
import { Page } from "~/components/Page";
import { layoutDAG } from "~/layoutGraph";

interface CourseNode {
  courseID: string;
  name: string;
  department: string;
  units: number | string | null;
}

interface CourseEdge {
  source: string;
  target: string;
  kind: "prereq";
}

interface GraphResponse {
  nodes: Record<string, CourseNode>;
  edges: CourseEdge[];
}

const RequisitesPage: NextPage = () => {
  const [rawNodes, setRawNodes] = useState<Record<string, CourseNode>>({});
  const [rawEdges, setRawEdges] = useState<CourseEdge[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [loading, setLoading] = useState(true);

  // Fetch graph data once
  useEffect(() => {
    const load = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";
        const url = `${base}/courses/requisites-graph`;
        const res = await axios.get<GraphResponse>(url);
        setRawNodes(res.data.nodes);
        setRawEdges(res.data.edges);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Failed to load requisites graph:", err);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  // Convert raw data to ReactFlow nodes + edges
  useEffect(() => {
    const nodeList: Node[] = Object.values(rawNodes).map((c) => ({
      id: c.courseID,
      position: { x: 0, y: 0 },
      data: {
        label: (
          <div className="text-xs text-center">
            <div className="font-semibold">{c.courseID}</div>
            <div className="truncate max-w-[180px]">{c.name}</div>
          </div>
        ),
      },
      style: {
        border: "1px solid #d4d4d8",
        borderRadius: 6,
        padding: 6,
        background: "#ffffff",
      },
    }));

    const edgeList: Edge[] = rawEdges.map((e, i) => ({
      id: `edge-${i}`,
      source: e.source,
      target: e.target,
      type: "smoothstep",
    }));

    if (nodeList.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const { nodes: laidOutNodes, edges: laidOutEdges } = layoutDAG(
      nodeList,
      edgeList,
      "LR"
    );

    setNodes(laidOutNodes);
    setEdges(laidOutEdges);
  }, [rawNodes, rawEdges, setNodes, setEdges]);

  const hasData = Object.keys(rawNodes).length > 0;

  return (
    <Page
      activePage="requisites"
      content={
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-lg font-semibold">Course Requisites Graph</h1>
            <p className="text-sm text-gray-600">
              Visual DAG of all CMU course prerequisites and postrequisites.
            </p>
          </div>

          <div className="flex-1 p-4">
            {loading ? (
              <div className="h-[480px] flex items-center justify-center text-sm text-gray-500 border rounded-xl bg-white">
                Loading course requisites graph…
              </div>
            ) : !hasData ? (
              <div className="h-[480px] flex items-center justify-center text-sm text-gray-500 border rounded-xl bg-white">
                No requisites data returned from the backend.
              </div>
            ) : (
              <div className="w-full h-[480px] border rounded-xl border-gray-200 bg-white overflow-hidden">
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  fitView
                >
                  <Background />
                  <MiniMap pannable zoomable />
                  <Controls />
                </ReactFlow>
              </div>
            )}
          </div>
        </div>
      }
    />
  );
};

export default RequisitesPage;
