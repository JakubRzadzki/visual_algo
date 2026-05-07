import { computeLayoutD3 } from '../src/utils/treeLayout';

const initialNodes = {
  id: 'root-50',
  value: 50,
  left: { id: 'node-30', value: 30, left: null, right: null },
  right: { id: 'node-70', value: 70, left: null, right: null }
};

const positions = computeLayoutD3(initialNodes as any);
console.log("Positions:", positions);
