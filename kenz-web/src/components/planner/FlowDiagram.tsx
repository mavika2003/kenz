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
  icon?: string;
}

// Custom node types - using inline components to avoid TypeScript issues
const DestinationNode = ({ data }: { data: NodeData }) => (
  <div className="px-4 py-3 rounded-lg bg-[#ff6a00] border-2 border-[#141210] shadow-[2px_2px_0_#141210]">
    <Handle type="target" position={Position.Top} className="!bg-[#141210]" />
    <span className="text-lg mr-2">{data.icon}</span>
    <span className="text-sm font-bold text-white">{data.label}</span>
    <Handle type="source" position={Position.Bottom} className="!bg-[#141210]" />
  </div>
);

const ActivityNode = ({ data }: { data: NodeData }) => (
  <div className="px-3 py-2 rounded-lg bg-white border-2 border-[#141210]/20 shadow-[1px_1px_0_#141210]">
    <Handle type="target" position={Position.Top} className="!bg-[#141210]/50" />
    <span className="text-xs text-[#141210] font-bold">{data.label}</span>
    <Handle type="source" position={Position.Bottom} className="!bg-[#141210]/50" />
  </div>
);

const StayNode = ({ data }: { data: NodeData }) => (
  <div className="px-4 py-3 rounded-lg bg-[#fbf3e4] border-2 border-[#141210] shadow-[2px_2px_0_#141210]">
    <Handle type="target" position={Position.Left} className="!bg-[#141210]" />
    <span className="text-lg mr-2">{data.icon}</span>
    <span className="text-sm font-bold text-[#141210]">{data.label}</span>
    <Handle type="source" position={Position.Right} className="!bg-[#141210]" />
  </div>
);

const TransportNode = ({ data }: { data: NodeData }) => (
  <div className="px-3 py-2 rounded-full bg-[#10b981] border-2 border-[#141210] shadow-[2px_2px_0_#141210]">
    <Handle type="target" position={Position.Left} className="!bg-[#141210]" />
    <span className="text-sm text-white font-bold">{data.label}</span>
    <Handle type="source" position={Position.Right} className="!bg-[#141210]" />
  </div>
);

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
      data: { label: "DXB Airport", icon: "✈️" },
    },
    {
      id: "dest",
      type: "destination",
      position: { x: 250, y: 100 },
      data: { label: destData.name, icon: destData.icon },
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
            data: { label: accData.name, icon: planState.accommodation === "hotel" ? "🏨" : planState.accommodation === "resort" ? "🏖️" : planState.accommodation === "hostel" ? "🛏️" : "🏠" },
          },
        ]
      : []),
    ...(planState.transport
      ? [
          {
            id: "transport",
            type: "transport" as const,
            position: { x: 250, y: 300 },
            data: { label: planState.transport === "metro" ? "🚇 Metro + NOL Card" : planState.transport === "taxi" ? "🚕 Careem/Uber" : planState.transport === "rental" ? "🚗 Rental Car" : "🔄 Mixed" },
          },
        ]
      : []),
  ];

  const initialEdges: Edge[] = [
    { id: "e1", source: "arrival", target: "dest", animated: true, style: { stroke: "#ff6a00", strokeWidth: 3 } },
    ...destData.highlights.slice(0, 4).map((_, i) => ({
      id: `e-activity-${i}`,
      source: "dest",
      target: `activity-${i}`,
      style: { stroke: "#141210", strokeWidth: 2, strokeOpacity: 0.3 },
    })),
    ...(accData
      ? [
          {
            id: "e-stay",
            source: "dest",
            target: "stay",
            style: { stroke: "#ff6a00", strokeWidth: 3 },
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
            style: { stroke: "#10b981", strokeWidth: 3 },
          },
          {
            id: "e-transport-2",
            source: "stay",
            target: "transport",
            style: { stroke: "#10b981", strokeWidth: 3 },
          },
        ]
      : []),
  ];

  const [nodes, , onNodesChange] = useNodesState<Node<NodeData>>(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="h-[300px] rounded-lg overflow-hidden bg-[#fbf3e4]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        attributionPosition="bottom-left"
        className="!bg-transparent"
        proOptions={{ hideAttribution: true }}
      >
        <Background color="rgba(20,18,16,0.1)" gap={20} size={1} />
        <Controls className="!bg-white !border-[#141210] [&>button]:!bg-white [&>button]:!border-[#141210] [&>button]:!text-[#141210]" />
      </ReactFlow>
    </div>
  );
}
