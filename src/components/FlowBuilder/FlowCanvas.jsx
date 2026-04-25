import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { v4 as uuidv4 } from 'uuid';
import Sidebar from './Sidebar';
import TriggerNode from './nodes/TriggerNode';
import MessageNode from './nodes/MessageNode';

export default function FlowCanvas({ initialData, keyword, onChange }) {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  // We need to pass down callbacks to nodes so they can update their own data in the state
  const onNodeDataChange = useCallback((id, newText) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          node.data = {
            ...node.data,
            text: newText,
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  const nodeTypes = useMemo(() => ({
    triggerNode: TriggerNode,
    messageNode: (props) => <MessageNode {...props} data={{...props.data, onChange: (val) => onNodeDataChange(props.id, val)}} />,
  }), [onNodeDataChange]);

  // Initialize flow data
  useEffect(() => {
    if (initialData && initialData.nodes && initialData.edges) {
      setNodes(initialData.nodes);
      setEdges(initialData.edges);
    } else {
      // Default initial state
      setNodes([
        {
          id: 'trigger-1',
          type: 'triggerNode',
          position: { x: 50, y: 150 },
          data: { keyword: keyword || 'LINK' },
          deletable: false,
        },
      ]);
      setEdges([]);
    }
  }, [initialData, keyword, setNodes, setEdges]);

  // Trigger onChange when flow state updates
  useEffect(() => {
    if (reactFlowInstance) {
      // Small timeout to allow state to settle
      const timer = setTimeout(() => {
        if (onChange) {
          onChange({ nodes, edges });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [nodes, edges, reactFlowInstance, onChange]);

  // Update trigger node if keyword changes
  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === 'trigger-1') {
          n.data = { ...n.data, keyword };
        }
        return n;
      })
    );
  }, [keyword, setNodes]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#a78bfa', strokeWidth: 2 } }, eds)),
    [setEdges],
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: uuidv4(),
        type,
        position,
        data: { text: '' },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes],
  );

  return (
    <div className="flow-builder-container">
      <ReactFlowProvider>
        <Sidebar />
        <div className="reactflow-wrapper" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            proOptions={{ hideAttribution: true }}
          >
            <Controls style={{ bottom: 20, right: 20, backgroundColor: '#1f2025', border: '1px solid #333' }} />
            <Background color="#333" gap={16} />
          </ReactFlow>
        </div>
      </ReactFlowProvider>
    </div>
  );
}
