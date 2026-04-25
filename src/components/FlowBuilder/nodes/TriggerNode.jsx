import { Handle, Position } from '@xyflow/react';
import { MessageSquareText } from 'lucide-react';

export default function TriggerNode({ data }) {
  return (
    <div className="flow-node trigger-node">
      <div className="flow-node-header">
        <MessageSquareText size={16} color="#a78bfa" />
        <span>Trigger</span>
      </div>
      <div className="flow-node-body">
        <p className="flow-node-label">User comments:</p>
        <div className="flow-node-keyword">{data.keyword || 'LINK'}</div>
      </div>
      <Handle type="source" position={Position.Right} id="a" className="flow-handle source-handle" />
    </div>
  );
}
