import React from 'react';
import { motion } from 'motion/react';
import * as d3 from 'd3';

interface EdgeProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  isHighlighted: boolean;
}

export const TreeEdge: React.FC<EdgeProps> = ({ from, to, isHighlighted }) => {
  const linkGenerator = d3.linkVertical()
    .x((d: any) => d.x)
    .y((d: any) => d.y);

  const pathData = linkGenerator({ source: from, target: to } as any) || '';

  return (
    <motion.path
      d={pathData}
      fill="none"
      stroke={isHighlighted ? '#0ea5e9' : '#334155'}
      strokeWidth={isHighlighted ? 4 : 2}
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ 
        pathLength: 1, 
        opacity: 1,
        d: pathData,
        stroke: isHighlighted ? '#0ea5e9' : '#334155',
        strokeWidth: isHighlighted ? 4 : 2
      }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{ filter: isHighlighted ? 'drop-shadow(0px 0px 8px rgba(14,165,233,0.6))' : 'none' }}
    />
  );
};
