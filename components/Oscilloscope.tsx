import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { SimulationDataPoint } from '../types';

interface OscilloscopeProps {
  data: SimulationDataPoint[];
  showInput2?: boolean;
}

export const Oscilloscope: React.FC<OscilloscopeProps> = ({ data, showInput2 = false }) => {
  return (
    <div className="w-full h-64 bg-slate-900 rounded-lg border border-slate-700 p-2 shadow-inner">
      <div className="text-xs text-slate-400 mb-2 flex gap-4">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-pink-400 rounded-full"></div> 输入信号 (Vin)
        </div>
        {showInput2 && (
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-purple-400 rounded-full"></div> 输入信号 2
          </div>
        )}
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-400 rounded-full"></div> 输出信号 (Vout)
        </div>
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis 
            dataKey="time" 
            hide={true} 
            type="number" 
            domain={['auto', 'auto']}
          />
          <YAxis 
            stroke="#94a3b8" 
            fontSize={10} 
            domain={[-12, 12]} 
            allowDataOverflow={false}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
            itemStyle={{ fontSize: '12px' }}
            labelStyle={{ display: 'none' }}
            formatter={(value: number) => value.toFixed(2) + ' V'}
          />
          <ReferenceLine y={0} stroke="#475569" />
          <Line 
            type="monotone" 
            dataKey="input" 
            stroke="#f472b6" 
            strokeWidth={2} 
            dot={false} 
            isAnimationActive={false} 
          />
          {showInput2 && (
             <Line 
             type="monotone" 
             dataKey="input2" 
             stroke="#c084fc" 
             strokeWidth={2} 
             dot={false} 
             isAnimationActive={false} 
           />
          )}
          <Line 
            type="monotone" 
            dataKey="output" 
            stroke="#4ade80" 
            strokeWidth={3} 
            dot={false} 
            isAnimationActive={false} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};