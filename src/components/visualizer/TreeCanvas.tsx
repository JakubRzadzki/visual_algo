import React, { useMemo, useEffect, useState } from "react";
import { useTreeStore } from "../../store/treeStore";
import { computeLayoutD3, flattenTree } from "../../utils/treeLayout";
import { TreeEdge } from "./TreeEdge";
import { TreeNodeComponent } from "./TreeNodeComponent";
import { globalEventBus } from "../../core/EventBus";
import type { RBNode } from "../../types/tree";

export const TreeCanvas: React.FC = () => {
  const { steps, currentStepIndex, root } = useTreeStore();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [activeSandboxStep, setActiveSandboxStep] = useState<any>(null);

  // Subscribe to Sandbox events for real-time visualization
  useEffect(() => {
    const unsubscribe = globalEventBus.subscribe((e) => {
      if (e.type === "TRACE_LOADED" || e.type === "SYSTEM_PLAYBACK_STATE") {
        if (e.type === "TRACE_LOADED") setActiveSandboxStep(null);
        return;
      }

      if (e.type === "VISIT" || e.type === "COMPARE" || e.type === "INSERT") {
        setActiveSandboxStep(e);
      }
    });
    return () => unsubscribe();
  }, []);

  const currentStep = activeSandboxStep || steps[currentStepIndex];
  const currentTree = currentStep?.treeSnapshot || root;

  // Use ResizeObserver to get actual container dimensions
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setDimensions({
          width: entries[0].contentRect.width,
          height: entries[0].contentRect.height,
        });
      }
    });

    const container = document.getElementById("tree-canvas-container");
    if (container) observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const positions = useMemo(() => {
    return currentTree ? computeLayoutD3(currentTree) : new Map();
  }, [currentTree]);

  const { nodes, edges } = useMemo(() => {
    return flattenTree(currentTree);
  }, [currentTree]);

  const getNodeStatus = (nodeId: string, step: any) => {
    if (!step) return "default";
    if (step.nodeIds && step.nodeIds.includes(nodeId)) {
      if (step.type === "VISIT") return "visiting";
      if (step.type === "COMPARE") return "comparing";
      if (step.type === "INSERT") return "inserting";
    }
    return "default";
  };

  // Center horizontally based on container width, margin top 150px
  const centerX = Math.max(dimensions.width / 2, 200);

  return (
    <div id="tree-canvas-container" className="w-full h-full relative">
      <svg width="100%" height="100%" className="overflow-visible min-h-full">
        <g transform={`translate(${centerX}, 150)`}>
          {edges.map(({ fromId, toId }) => {
            const from = positions.get(fromId);
            const to = positions.get(toId);
            if (!from || !to) return null;
            return (
              <TreeEdge
                key={`${fromId}-${toId}`}
                from={from}
                to={to}
                isHighlighted={
                  currentStep?.edgeIds?.includes(`${fromId}-${toId}`) ?? false
                }
              />
            );
          })}

          {nodes.map((node) => {
            const pos = positions.get(node.id);
            if (!pos) return null;
            const status = getNodeStatus(node.id, currentStep);

            return (
              <TreeNodeComponent
                key={node.id}
                node={node}
                position={pos}
                status={status as any}
                color={(node as RBNode).color}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
};
