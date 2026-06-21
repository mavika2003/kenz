"use client";

import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { PlanState } from "@/lib/planner/types";
import { DESTINATION_DATA, ACCOMMODATION_DATA } from "@/lib/planner/data";

interface FlowDiagramProps {
  planState: PlanState;
}

interface NodeData extends Record<string, unknown> {
  label: string;
  badge?: string;
}

const nodeShell =
  "rounded-xl bg-white px-3 py-2.5 shadow-[0_8px_24px_rgba(20,18,16,0.08)] ring-1 ring-black/[0.08]";

const DestinationNode = ({ data }: { data: NodeData }) => (
  <div className={`${nodeShell} bg-orange ring-orange/30`}>
    <Handle type="target" position={Position.Top} className="!bg-ink/40 !w-2 !h-2" />
    <div className="flex items-center gap-2">
      {data.badge && (
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold text-white">
          {data.badge}
        </span>
      )}
      <span className="text-xs font-semibold text-white">{data.label}</span>
    </div>
    <Handle type="source" position={Position.Bottom} className="!bg-ink/40 !w-2 !h-2" />
  </div>
);

const ActivityNode = ({ data }: { data: NodeData }) => (
  <div className={nodeShell}>
    <Handle type="target" position={Position.Top} className="!bg-ink/30 !w-2 !h-2" />
    <span className="text-[11px] font-medium text-ink/75">{data.label}</span>
    <Handle type="source" position={Position.Bottom} className="!bg-ink/30 !w-2 !h-2" />
  </div>
);

const StayNode = ({ data }: { data: NodeData }) => (
  <div className={`${nodeShell} bg-surface`}>
    <Handle type="target" position={Position.Left} className="!bg-ink/40 !w-2 !h-2" />
    <div className="flex items-center gap-2">
      {data.badge && (
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange/15 text-[10px] font-bold text-orange">
          {data.badge}
        </span>
      )}
      <span className="text-xs font-semibold text-ink">{data.label}</span>
    </div>
    <Handle type="source" position={Position.Right} className="!bg-ink/40 !w-2 !h-2" />
  </div>
);

const TransportNode = ({ data }: { data: NodeData }) => (
  <div className={`${nodeShell} rounded-full bg-emerald-600 ring-emerald-600/20`}>
    <Handle type="target" position={Position.Left} className="!bg-white/60 !w-2 !h-2" />
    <span className="text-xs font-semibold text-white">{data.label}</span>
    <Handle type="source" position={Position.Right} className="!bg-white/60 !w-2 !h-2" />
  </div>
);

const accommodationBadge: Record<string, string> = {
  hotel: "HTL",
  airbnb: "AIR",
  hostel: "HST",
  resort: "RST",
};

const transportLabel: Record<string, string> = {
  metro: "Metro + NOL",
  taxi: "Careem / Uber",
  rental: "Rental car",
  mixed: "Mixed transport",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nodeTypes: any = {
  destination: DestinationNode,
  activity: ActivityNode,
  stay: StayNode,
  transport: TransportNode,
};

export default function FlowDiagram({ planState }: FlowDiagramProps) {
  const destination = planState.destination || "dubai";
  const destData = DESTINATION_DATA[destination];
  const accData = planState.accommodation ? ACCOMMODATION_DATA[planState.accommodation] : null;

  const initialNodes: Node<NodeData>[] = [
    {
      id: "arrival",
      type: "destination",
      position: { x: 250, y: 0 },
      data: { label: "DXB Airport", badge: "DXB" },
    },
    {
      id: "dest",
      type: "destination",
      position: { x: 250, y: 100 },
      data: { label: destData.name, badge: destData.icon },
    },
    ...destData.highlights.slice(0, 4).map((highlight, i) => ({
      id: `activity-${i}`,
      type: "activity" as const,
      position: { x: 100 + i * 100, y: 200 },
      data: { label: highlight },
    })),
    ...(accData
      ? [
          {
            id: "stay",
            type: "stay" as const,
            position: { x: 400, y: 200 },
            data: {
              label: accData.name,
              badge: planState.accommodation
                ? accommodationBadge[planState.accommodation]
                : "STY",
            },
          },
        ]
      : []),
    ...(planState.transport
      ? [
          {
            id: "transport",
            type: "transport" as const,
            position: { x: 250, y: 300 },
            data: { label: transportLabel[planState.transport] || planState.transport },
          },
        ]
      : []),
  ];

  const initialEdges: Edge[] = [
    {
      id: "e1",
      source: "arrival",
      target: "dest",
      animated: true,
      style: { stroke: "#ff6a00", strokeWidth: 2 },
    },
    ...destData.highlights.slice(0, 4).map((_, i) => ({
      id: `e-activity-${i}`,
      source: "dest",
      target: `activity-${i}`,
      style: { stroke: "#141210", strokeWidth: 1.5, strokeOpacity: 0.2 },
    })),
    ...(accData
      ? [
          {
            id: "e-stay",
            source: "dest",
            target: "stay",
            style: { stroke: "#ff6a00", strokeWidth: 2 },
          },
        ]
      : []),
    ...(planState.transport
      ? [
          {
            id: "e-transport",
            source: "activity-0",
            target: "transport",
            animated: true,
            style: { stroke: "#059669", strokeWidth: 2 },
          },
          {
            id: "e-transport-2",
            source: "stay",
            target: "transport",
            style: { stroke: "#059669", strokeWidth: 2 },
          },
        ]
      : []),
  ];

  const [nodes, , onNodesChange] = useNodesState<Node<NodeData>>(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="h-full min-h-[260px] overflow-hidden rounded-xl bg-canvas ring-1 ring-black/[0.06]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        attributionPosition="bottom-left"
        className="!bg-transparent"
        proOptions={{ hideAttribution: true }}
      >
        <Background color="rgba(20,18,16,0.06)" gap={24} size={1} />
        <Controls className="!rounded-lg !border-0 !bg-white !shadow-[0_4px_16px_rgba(20,18,16,0.08)] [&>button]:!border-black/10 [&>button]:!bg-white [&>button]:!text-ink" />
      </ReactFlow>
    </div>
  );
}
