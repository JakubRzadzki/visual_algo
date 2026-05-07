import React from 'react';
import { motion } from 'motion/react';
import type { TreeNode, AVLNode } from '../../types/tree';

interface Props {
  node: TreeNode;
  position: { x: number; y: number };
  status: 'default' | 'visiting' | 'comparing' | 'inserting' | 'found' | 'deleted';
  color?: 'RED' | 'BLACK';
}

const STATUS_COLORS: Record<string, string> = {
  default:   '#1e293b',
  visiting:  '#3b82f6',  // blue
  comparing: '#f59e0b',  // yellow
  inserting: '#22c55e',  // green
  found:     '#a855f7',  // purple
  deleted:   '#ef4444',  // red
};

export const TreeNodeComponent: React.FC<Props> = ({ node, position, status, color }) => {
  const bgColor = color === 'RED' ? '#dc2626'
                : color === 'BLACK' ? '#0f172a'
                : STATUS_COLORS[status] || '#1e293b';

  const borderColor = color === 'RED' ? '#f87171'
                    : color === 'BLACK' ? '#334155'
                    : status !== 'default' ? '#bae6fd' : '#475569';

  const avlNode = node as AVLNode;

  return (
    <motion.g
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1, x: position.x, y: position.y }}
      transition={{ 
        scale: { type: 'spring', stiffness: 300, damping: 20 },
        opacity: { duration: 0.2 },
        x: { type: 'spring', stiffness: 120, damping: 15 },
        y: { type: 'spring', stiffness: 120, damping: 15 }
      }}
      whileHover={{ scale: 1.15 }}
      className="cursor-pointer"
    >
      {/* Outer Glow for active statuses */}
      {status !== 'default' && (
        <motion.circle
          r={32}
          fill={bgColor}
          opacity={0.4}
          className="blur-md"
        />
      )}
      
      <motion.circle
        r={24}
        fill={bgColor}
        stroke={borderColor}
        strokeWidth={3}
        animate={{ fill: bgColor, stroke: borderColor }}
        transition={{ duration: 0.3 }}
        style={{ filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.5))' }}
      />
      <text
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        fontSize={16}
        fontWeight="bold"
        className="pointer-events-none select-none font-mono tracking-tighter"
        style={{ textShadow: '0px 2px 4px rgba(0,0,0,0.8)' }}
      >
        {node.value}
      </text>
      
      {avlNode.balanceFactor !== undefined && (
        <text 
          y={-38} 
          textAnchor="middle" 
          fill="#94a3b8" 
          fontSize={11} 
          fontWeight="bold"
          className="pointer-events-none select-none font-mono"
        >
          BF: {avlNode.balanceFactor}
        </text>
      )}
    </motion.g>
  );
};
