declare module 'react-cytoscapejs' {
  import { ReactNode } from 'react';
  import cytoscape from 'cytoscape';

  interface CytoscapeComponentProps {
    elements: cytoscape.ElementDefinition[];
    style?: React.CSSProperties;
    stylesheet?: cytoscape.Stylesheet[];
    layout?: cytoscape.LayoutOptions;
    cy?: (cy: cytoscape.Core) => void;
    wheelSensitivity?: number;
    [key: string]: unknown;
  }

  export default function CytoscapeComponent(props: CytoscapeComponentProps): ReactNode;
}
