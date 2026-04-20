declare module 'react-cytoscapejs' {
  import { ReactNode } from 'react';

  interface CytoscapeComponentProps {
    elements: any[];
    style?: any;
    stylesheet?: any;
    layout?: any;
    cy?: (cy: any) => void;
    wheelSensitivity?: number;
    [key: string]: any;
  }

  export default function CytoscapeComponent(props: CytoscapeComponentProps): ReactNode;
}
