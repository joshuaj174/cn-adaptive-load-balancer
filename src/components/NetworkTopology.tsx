"use client";

import {
  Background,
  Controls,
  MarkerType,
  ReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

interface NetworkTopologyProps {
  selectedServerId?: number;
  requestStatus?: string;
}

export default function NetworkTopology({
  selectedServerId,
  requestStatus,
}: NetworkTopologyProps) {
  const serverIds = [1, 2, 3, 4, 5];

  const nodes: Node[] = [
    {
      id: "client",
      position: {
        x: 350,
        y: 0,
      },
      data: {
        label: "Client",
      },
      style: {
        background: "#1e293b",
        color: "#f8fafc",
        border: "1px solid #475569",
        borderRadius: "10px",
        padding: "12px",
        width: 140,
        textAlign: "center",
        fontWeight: 600,
      },
    },

    {
      id: "load-balancer",
      position: {
        x: 330,
        y: 120,
      },
      data: {
        label: "Load Balancer",
      },
      style: {
        background: "#312e81",
        color: "#ffffff",
        border: "2px solid #6366f1",
        borderRadius: "10px",
        padding: "14px",
        width: 180,
        textAlign: "center",
        fontWeight: 700,
      },
    },

    ...serverIds.map(
      (serverId, index): Node => {
        const selected =
          selectedServerId === serverId;

        return {
          id: `server-${serverId}`,

          position: {
            x: index * 180,
            y: 300,
          },

          data: {
            label: selected
              ? `Server ${serverId} ✓`
              : `Server ${serverId}`,
          },

          style: {
            background: selected
              ? "#14532d"
              : "#1e293b",

            color: "#f8fafc",

            border: selected
              ? "2px solid #22c55e"
              : "1px solid #475569",

            borderRadius: "10px",

            padding: "12px",

            width: 140,

            textAlign: "center",

            fontWeight: selected
              ? 700
              : 500,
          },
        };
      }
    ),
  ];

  const edges: Edge[] = [
    {
      id: "client-load-balancer",

      source: "client",

      target: "load-balancer",

      animated:
        requestStatus === "processing",

      markerEnd: {
        type: MarkerType.ArrowClosed,
      },

      style: {
        stroke: "#94a3b8",
        strokeWidth: 2,
      },
    },

    ...serverIds.map(
      (serverId): Edge => {
        const selected =
          selectedServerId === serverId;

        return {
          id: `load-balancer-server-${serverId}`,

          source: "load-balancer",

          target: `server-${serverId}`,

          animated:
            selected &&
            requestStatus === "processing",

          markerEnd: {
            type: MarkerType.ArrowClosed,
          },

          style: {
            stroke: selected
              ? "#22c55e"
              : "#475569",

            strokeWidth: selected
              ? 3
              : 1.5,
          },
        };
      }
    ),
  ];

  return (
    <section className="mt-6 rounded-xl bg-slate-900 p-6">
      <div className="mb-5">
        <h2 className="text-xl font-semibold">
          Network Topology
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Live request path from the client
          through the load balancer to the
          selected server.
        </p>
      </div>

      <div className="h-[460px] overflow-hidden rounded-lg border border-slate-700 bg-slate-950">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag
          zoomOnScroll
          minZoom={0.6}
          maxZoom={1.5}
        >
          <Background />

          <Controls
            showInteractive={false}
          />
        </ReactFlow>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="h-3 w-3 rounded-full bg-slate-600" />

          Available path
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <span className="h-3 w-3 rounded-full bg-green-500" />

          Selected server
        </div>
      </div>
    </section>
  );
}