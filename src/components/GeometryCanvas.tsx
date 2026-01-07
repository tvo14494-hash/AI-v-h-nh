import React, { useState, useRef, useEffect } from 'react';
import { GeometryData, Point } from '../types';

interface Props {
  data: GeometryData;
  onUpdate: (newData: GeometryData) => void;
}

const GeometryCanvas: React.FC<Props> = ({ data, onUpdate }) => {
  const [draggedPoint, setDraggedPoint] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const handleMouseDown = (id: string) => setDraggedPoint(id);
  const handleMouseUp = () => setDraggedPoint(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedPoint || !svgRef.current) return;
    const CTM = svgRef.current.getScreenCTM();
    if (!CTM) return;
    
    const x = (e.clientX - CTM.e) / CTM.a;
    const y = (e.clientY - CTM.f) / CTM.d;

    const newPoints = data.points.map(p => 
      p.id === draggedPoint ? { ...p, x, y } : p
    );
    onUpdate({ ...data, points: newPoints });
  };

  return (
    <svg 
      ref={svgRef}
      viewBox="0 0 800 600" 
      className="w-full h-full geometry-canvas touch-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Vẽ đường tròn */}
      {data.circles.map((c, i) => {
        const center = data.points.find(p => p.id === c.center);
        const radiusPt = data.points.find(p => p.id === c.radiusPt);
        if (!center || !radiusPt) return null;
        const r = Math.hypot(center.x - radiusPt.x, center.y - radiusPt.y);
        return <circle key={i} cx={center.x} cy={center.y} r={r} fill="none" stroke="#9b72f3" strokeWidth="2" />;
      })}

      {/* Vẽ đoạn thẳng */}
      {data.lines.map((l, i) => {
        const p1 = data.points.find(p => p.id === l.from);
        const p2 = data.points.find(p => p.id === l.to);
        if (!p1 || !p2) return null;
        return (
          <line 
            key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} 
            stroke={l.isPerp ? "#ef4444" : "#1e293b"} 
            strokeWidth="2" 
            strokeDasharray={l.dashed ? "5,5" : "0"}
          />
        );
      })}

      {/* Vẽ điểm và nhãn */}
      {data.points.map(p => (
        <g key={p.id} onMouseDown={() => handleMouseDown(p.id)} className="cursor-move">
          <circle cx={p.x} cy={p.y} r={6} fill="#4285f4" />
          <text x={p.x + 10} y={p.y - 10} className="font-bold text-sm select-none">{p.label}</text>
        </g>
      ))}
    </svg>
  );
};

export default GeometryCanvas;
