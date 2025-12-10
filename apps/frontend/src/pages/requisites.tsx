import type { NextPage } from "next";
import React, { useEffect, useMemo, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";

import axios from "axios";
import { Page } from "~/components/Page";

type BackendCourseNode = {
  courseID: string;
  name: string;
  department: string;
  units: number | string | null;
};

type BackendEdge = {
  source: string;
  target: string;
  kind: "prereq";
};

type GraphResponse = {
  nodes: Record<string, BackendCourseNode>;
  edges: BackendEdge[];
};

// 🔥 Bold, high-contrast colors per department
const departmentColor = (course: BackendCourseNode): string => {
  const dept =
    course.department?.toLowerCase() ??
    course.courseID.slice(0, 2).toLowerCase();

  if (dept.startsWith("15") || dept.includes("cs")) return "#0033FF"; // CS
  if (dept.startsWith("21") || dept.includes("math")) return "#00A650"; // Math
  if (dept.startsWith("17") || dept.includes("se")) return "#9B00FF"; // SE
  if (dept.startsWith("05") || dept.includes("hcii")) return "#FF6A00"; // HCII
  if (dept.startsWith("36") || dept.includes("stat")) return "#009F9F"; // Stats
  if (dept.startsWith("84") || dept.includes("poli")) return "#FF0033"; // Policy
  if (dept.startsWith("04")) return "#4D58FF"; // IS

  return "#444444"; // fallback for other departments
};

const RequisitesPage: NextPage = () => {
  const [rawNodes, setRawNodes] = useState<Record<string, BackendCourseNode>>(
    {}
  );
  const [rawEdges, setRawEdges] = useState<BackendEdge[]>([]);
  const [loading, setLoading] = useState(true);

  // ───────────────────────────── load graph from backend ─────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";
        const url = `${base}/courses/requisites-graph`;

        const res = await axios.get<GraphResponse>(url);

        setRawNodes(res.data.nodes || {});
        setRawEdges(res.data.edges || []);
      } catch (err) {
        console.error("Error fetching requisites graph:", err);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const coursesArray = useMemo(
    () => Object.values(rawNodes),
    [rawNodes]
  );

  const hasData = coursesArray.length > 0;

  // ───────────────────────────── compute layout + styling ────────────────────────
  const { nodes, edges } = useMemo(() => {
    if (!hasData) {
      return { nodes: [] as Node[], edges: [] as Edge[] };
    }

    // Only keep edges whose endpoints actually exist as nodes
    const validEdges = rawEdges.filter(
      (e) => rawNodes[e.source] && rawNodes[e.target]
    );

    // Collect all node IDs we care about
    const ids = Object.keys(rawNodes);

    // Graph structures
    const indegree = new Map<string, number>();
    const level = new Map<string, number>();
    const outgoing = new Map<string, string[]>();

    // Initialize maps for all known ids
    ids.forEach((id) => {
      indegree.set(id, 0);
      level.set(id, 0);
      outgoing.set(id, []);
    });

    // Build indegree + outgoing safely
    validEdges.forEach((e) => {
      // Ensure source exists in maps
      if (!outgoing.has(e.source)) {
        outgoing.set(e.source, []);
      }
      if (!indegree.has(e.source)) {
        indegree.set(e.source, 0);
        level.set(e.source, 0);
      }

      // Ensure target exists in maps
      if (!outgoing.has(e.target)) {
        outgoing.set(e.target, []);
      }
      if (!indegree.has(e.target)) {
        indegree.set(e.target, 0);
        level.set(e.target, 0);
      }

      // Update indegree + outgoing
      indegree.set(e.target, (indegree.get(e.target) ?? 0) + 1);
      outgoing.get(e.source)!.push(e.target);
    });

    // Kahn's algorithm to assign levels (columns)
    const queue: string[] = [];
    indegree.forEach((deg, id) => {
      if (deg === 0) queue.push(id);
    });

    while (queue.length > 0) {
      const u = queue.shift()!;
      const uLevel = level.get(u) ?? 0;

      for (const v of outgoing.get(u) ?? []) {
        const current = level.get(v) ?? 0;
        if (uLevel + 1 > current) {
          level.set(v, uLevel + 1);
        }

        const newDeg = (indegree.get(v) ?? 0) - 1;
        indegree.set(v, newDeg);
        if (newDeg === 0) queue.push(v);
      }
    }

    // Group node ids by level
    const levels: Record<number, string[]> = {};
    Array.from(level.keys()).forEach((id) => {
      if (!rawNodes[id]) return; // ignore phantom ids
      const l = level.get(id) ?? 0;
      if (!levels[l]) levels[l] = [];
      levels[l].push(id);
    });

    const sortedLevels = Object.keys(levels)
      .map((k) => parseInt(k, 10))
      .sort((a, b) => a - b);

    const xStep = 260;
    const yStep = 120;

    const nodeMap: Node[] = [];

    // Create positioned nodes
    sortedLevels.forEach((lvl) => {
      const colIds = levels[lvl];
      const count = colIds.length;

      colIds.forEach((id, index) => {
        const course = rawNodes[id];
        if (!course) return;

        const color = departmentColor(course);

        const x = lvl * xStep;
        const y = (index - (count - 1) / 2) * yStep;

        nodeMap.push({
          id: course.courseID,
          position: { x, y },
          data: {
            label: (
              <div className="text-[11px] leading-tight text-center">
                <div className="font-semibold text-slate-800">
                  {course.courseID}
                </div>
                <div className="truncate max-w-[180px] text-slate-700">
                  {course.name}
                </div>
                <div className="mt-1 text-[10px] text-slate-500">
                  {course.department}
                </div>
              </div>
            ),
          },
          style: {
            borderRadius: 8,
            padding: 6,
            border: `2.5px solid ${color}`,
            backgroundColor: "#ffffff",
          },
        });
      });
    });

    // Create edges with arrowheads
    const edgeMap: Edge[] = validEdges.map((e, idx) => ({
      id: `edge-${idx}`,
      source: e.source,
      target: e.target,
      type: "smoothstep",
      style: {
        stroke: "#475569",
        strokeWidth: 1.6,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: "#475569",
      },
    }));

    return { nodes: nodeMap, edges: edgeMap };
  }, [hasData, rawNodes, rawEdges]);

  // ───────────────────────────── render ──────────────────────────────────────────
  return (
    <Page
      activePage="requisites"
      content={
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 space-y-3 bg-slate-50">
            <h1 className="text-lg font-semibold">Course Requisites Graph</h1>
            <p className="text-sm text-slate-600">
              Visual DAG of all CMU course prerequisites and postrequisites.
              Arrows point from a prerequisite to the course that depends on it.
            </p>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 text-[11px] text-slate-600 mt-2">
              <div className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-[#0033FF]" />
                <span>CS / 15-xxx</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-[#00A650]" />
                <span>Math / 21-xxx</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-[#9B00FF]" />
                <span>SE / 17-xxx</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-[#FF6A00]" />
                <span>HCII / 05-xxx</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-[#009F9F]" />
                <span>Stats / 36-xxx</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-[#FF0033]" />
                <span>Policy / 84-xxx</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-[#4D58FF]" />
                <span>IS / 04-xxx</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-[#444444]" />
                <span>Other depts</span>
              </div>
              <div className="flex items-center gap-1">
                <svg
                  width="20"
                  height="8"
                  viewBox="0 0 20 8"
                  className="text-slate-500"
                >
                  <defs>
                    <marker
                      id="arrowhead"
                      markerWidth="6"
                      markerHeight="4"
                      refX="5"
                      refY="2"
                      orient="auto"
                    >
                      <polygon
                        points="0 0, 6 2, 0 4"
                        fill="#475569"
                      />
                    </marker>
                  </defs>
                  <line
                    x1="0"
                    y1="4"
                    x2="18"
                    y2="4"
                    stroke="#475569"
                    strokeWidth="1.6"
                    markerEnd="url(#arrowhead)"
                  />
                </svg>
                <span>prereq → dependent</span>
              </div>
            </div>
          </div>

          {/* Graph */}
          <div className="flex-1 p-4">
            {loading ? (
              <div className="h-[540px] flex items-center justify-center text-sm text-slate-500 border rounded-xl bg-white">
                Loading graph…
              </div>
            ) : !hasData ? (
              <div className="h-[540px] flex items-center justify-center text-sm text-slate-500 border rounded-xl bg-white">
                No requisites data returned.
              </div>
            ) : (
              <div className="w-full h-[540px] border rounded-xl border-slate-200 bg-white overflow-hidden">
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  fitView
                  fitViewOptions={{ padding: 0.2 }}
                  minZoom={0.1}
                  maxZoom={1.5}
                  proOptions={{ hideAttribution: true }}
                >
                  <Background gap={16} size={1} />
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
