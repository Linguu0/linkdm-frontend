import { MessageSquareText, Send } from 'lucide-react';

export default function Sidebar() {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="flow-sidebar">
      <div className="flow-sidebar-header">
        <h3>Nodes</h3>
        <p>Drag elements to the canvas</p>
      </div>
      <div className="flow-sidebar-nodes">
        <div className="flow-sidebar-node" onDragStart={(event) => onDragStart(event, 'messageNode')} draggable>
          <Send size={16} color="#34d399" />
          <span>Send Message</span>
        </div>
        {/* We can add more nodes like Conditions, Delays later */}
      </div>
    </aside>
  );
}
