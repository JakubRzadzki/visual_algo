import { computeLayoutD3 } from '../src/utils/treeLayout';
const root = {
  id: '1',
  value: 10,
  left: { id: '2', value: 5, left: null, right: null },
  right: { id: '3', value: 15, left: null, right: null }
};
const positions = computeLayoutD3(root as any);
console.log("Positions:", positions);
