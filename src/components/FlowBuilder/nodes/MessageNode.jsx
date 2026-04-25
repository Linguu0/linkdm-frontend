import { Handle, Position } from '@xyflow/react';
import { Send } from 'lucide-react';

export default function MessageNode({ data }) {
  const handleChange = (evt) => {
    if (data.onChange) {
      data.onChange(evt.target.value);
    }
  };

  return (
    <div className="flow-node message-node">
      <Handle type="target" position={Position.Left} id="in" className="flow-handle target-handle" />
      <div className="flow-node-header">
        <Send size={16} color="#34d399" />
        <span>Send Message</span>
      </div>
      <div className="flow-node-body">
        <textarea 
          className="flow-node-textarea" 
          placeholder="Type message..." 
          value={data.text || ''} 
          onChange={handleChange}
          rows={3}
        />
      </div>
      <Handle type="source" position={Position.Right} id="out" className="flow-handle source-handle" />
    </div>
  );
}
