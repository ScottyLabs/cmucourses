import type { NextPage } from "next";
import React, { useEffect, useState } from "react";
import ReactFlow, { Background, Controls, MiniMap, Node, Edge } from "reactflow";
import "reactflow/dist/style.css";

import axios from "axios";
import { Page } from "~/components/Page";

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
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch graph data once
  useEffect(() => {
    const load = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";
        const url = `${base}/courses/requisites-graph`;
        console.log("Requisites graph fetch URL:", url);

        const res = await axios.get<GraphResponse>(url);

        console.log(
          "Graph response counts:",
          Object.keys(res.data.nodes || {}).length,
          "nodes,",
          res.data.edges?.length ?? 0,
          "edges"
        );

        setRawNodes(res.data.nodes);
        setRawEdges(res.data.edges);
      } catch (err) {
        console.error("Failed to load requisites graph:", err);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  // Convert raw data to ReactFlow nodes + edges (simple grid layout)
  useEffect(() => {
    const courses = Object.values(rawNodes);

    if (courses.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const columns = 40; // how many columns in the grid
    const xStep = 220;  // horizontal spacing
    const yStep = 120;  // vertical spacing

    const nodeList: Node[] = courses.map((c, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);

      return {
        id: c.courseID,
        position: {
          x: col * xStep,
          y: row * yStep,
        },
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
      };
    });

    const edgeList: Edge[] = rawEdges
      // only keep edges whose endpoints exist
      .filter((e) => rawNodes[e.source] && rawNodes[e.target])
      .map((e, i) => ({
        id: `edge-${i}`,
        source: e.source,
        target: e.target,
        type: "smoothstep",
      }));

    console.log(
      "ReactFlow nodeList/edgeList sizes:",
      nodeList.length,
      "nodes,",
      edgeList.length,
      "edges"
    );

    setNodes(nodeList);
    setEdges(edgeList);
  }, [rawNodes, rawEdges]);

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
                <ReactFlow nodes={nodes} edges={edges} fitView>
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
