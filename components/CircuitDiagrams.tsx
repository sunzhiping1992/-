
import React from 'react';
import { CircuitType } from '../types';

interface DiagramProps {
  type: CircuitType;
  params: Record<string, number>;
}

export const CircuitDiagram: React.FC<DiagramProps> = ({ type, params }) => {
  // 样式常量
  const c = {
    wire: "#64748b",    // slate-500
    comp: "#f8fafc",    // slate-50
    label: "#94a3b8",   // slate-400
    val: "#38bdf8",     // sky-400
    in: "#f472b6",      // pink-400
    out: "#4ade80",     // green-400
    gnd: "#cbd5e1",     // slate-300
  };

  // --- 通用元件 (SVG Primitives) ---
  
  // 节点圆点
  const Node = ({ x, y }: { x: number; y: number }) => (
    <circle cx={x} cy={y} r="3" fill={c.comp} />
  );

  // 接地符号
  const Ground = ({ x, y }: { x: number; y: number }) => (
    <g transform={`translate(${x},${y})`}>
      <line x1="-12" y1="0" x2="12" y2="0" stroke={c.wire} strokeWidth="2" />
      <line x1="-7" y1="5" x2="7" y2="5" stroke={c.wire} strokeWidth="2" />
      <line x1="-2" y1="10" x2="2" y2="10" stroke={c.wire} strokeWidth="2" />
    </g>
  );

  // 电阻 (水平/垂直)
  const Resistor = ({ x, y, label, val, v = false }: { x: number, y: number, label: string, val: string, v?: boolean }) => {
    // 长度 60px。水平时中心 (x,y)，范围 x-30 到 x+30。
    const rot = v ? `rotate(90 ${x} ${y})` : "";
    return (
      <g transform={rot}>
        <line x1={x-30} y1={y} x2={x-15} y2={y} stroke={c.comp} strokeWidth="2" />
        <path d={`M${x-15},${y} l2.5,-5 l5,10 l5,-10 l5,10 l5,-10 l5,10 l2.5,-5`} fill="none" stroke={c.comp} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1={x+15} y1={y} x2={x+30} y2={y} stroke={c.comp} strokeWidth="2" />
        {/* 标签处理 (反向旋转以保持水平) */}
        <g transform={v ? `rotate(-90 ${x} ${y})` : ""}>
          <text x={v ? x + 25 : x} y={v ? y : y - 15} textAnchor="middle" fill={c.label} fontSize="11" fontWeight="500">{label}</text>
          <text x={v ? x + 25 : x} y={v ? y + 12 : y + 25} textAnchor="middle" fill={c.val} fontSize="10" fontFamily="monospace">{val}</text>
        </g>
      </g>
    );
  };

  // 电容
  const Capacitor = ({ x, y, label, val, v = false, pol = false }: { x: number, y: number, label: string, val: string, v?: boolean, pol?: boolean }) => {
    const rot = v ? `rotate(90 ${x} ${y})` : "";
    return (
      <g transform={rot}>
        <line x1={x-25} y1={y} x2={x-5} y2={y} stroke={c.comp} strokeWidth="2" />
        <line x1={x+5} y1={y} x2={x+25} y2={y} stroke={c.comp} strokeWidth="2" />
        <line x1={x-5} y1={y-10} x2={x-5} y2={y+10} stroke={c.comp} strokeWidth="2" />
        <line x1={x+5} y1={y-10} x2={x+5} y2={y+10} stroke={c.comp} strokeWidth="2" />
        {pol && <text x={x-10} y={y-5} fill={c.label} fontSize="10">+</text>}
        
        <g transform={v ? `rotate(-90 ${x} ${y})` : ""}>
          <text x={v ? x + 25 : x} y={v ? y : y - 15} textAnchor="middle" fill={c.label} fontSize="11">{label}</text>
          <text x={v ? x + 25 : x} y={v ? y + 12 : y + 25} textAnchor="middle" fill={c.val} fontSize="10" fontFamily="monospace">{val}</text>
        </g>
      </g>
    );
  };

  // 运放 (三角形)
  const OpAmp = ({ x, y, label, flip = false }: { x: number, y: number, label: string, flip?: boolean }) => {
    // 中心 (x,y)，尖端向右。输入在左侧 x-25，输出在右侧 x+35
    // 默认: (-) 在上, (+) 在下
    // Flip: (+) 在上, (-) 在下
    const topSign = flip ? "+" : "−";
    const botSign = flip ? "−" : "+";
    return (
      <g>
        <path d={`M${x-25},${y-30} L${x-25},${y+30} L${x+35},${y} Z`} fill="#1e293b" stroke={c.comp} strokeWidth="2" strokeLinejoin="round" />
        {/* 输入引脚 */}
        <line x1={x-40} y1={y-10} x2={x-25} y2={y-10} stroke={c.wire} strokeWidth="2" />
        <line x1={x-40} y1={y+10} x2={x-25} y2={y+10} stroke={c.wire} strokeWidth="2" />
        {/* 符号 */}
        <text x={x-20} y={y-4} fill={c.label} fontSize="14" fontWeight="bold">{topSign}</text>
        <text x={x-20} y={y+16} fill={c.label} fontSize="14" fontWeight="bold">{botSign}</text>
        {/* 输出引脚 stub */}
        <line x1={x+35} y1={y} x2={x+40} y2={y} stroke={c.comp} strokeWidth="2" />
        <text x={x} y={y+4} textAnchor="middle" fill={c.label} fontSize="10" opacity="0.6">{label}</text>
      </g>
    );
  };

  // 二极管
  const Diode = ({ x, y, label, v = false, led = false }: { x: number, y: number, label: string, v?: boolean, led?: boolean }) => {
    const rot = v ? `rotate(90 ${x} ${y})` : "";
    return (
      <g transform={rot}>
        <line x1={x-20} y1={y} x2={x-10} y2={y} stroke={c.comp} strokeWidth="2" />
        <line x1={x+10} y1={y} x2={x+20} y2={y} stroke={c.comp} strokeWidth="2" />
        <path d={`M${x-10},${y-10} L${x-10},${y+10} L${x+10},${y} Z`} fill={c.comp} stroke={c.comp} strokeWidth="2"/>
        <line x1={x+10} y1={y-10} x2={x+10} y2={y+10} stroke={c.comp} strokeWidth="2" />
        {led && (
          <g transform={`translate(${x},${y-15}) rotate(-15)`}>
             <line x1="-3" y1="3" x2="3" y2="-3" stroke="yellow" strokeWidth="2" />
             <path d="M0,-3 L4,-4 L3,0 Z" fill="yellow" />
             <line x1="2" y1="3" x2="8" y2="-3" stroke="yellow" strokeWidth="2" />
             <path d="M5,-3 L9,-4 L8,0 Z" fill="yellow" />
          </g>
        )}
        <g transform={v ? `rotate(-90 ${x} ${y})` : ""}>
            <text x={v ? x + 25 : x} y={v ? y : y - 18} textAnchor="middle" fill={c.label} fontSize="11">{label}</text>
        </g>
      </g>
    );
  };

  // 端口标签
  const Label = ({ x, y, text, color = c.label }: any) => (
    <text x={x} y={y} fill={color} fontSize="14" fontWeight="bold" textAnchor="middle" alignmentBaseline="middle">{text}</text>
  );

  // --- 电路图逻辑 ---

  // 1. 电压分压器
  if (type === CircuitType.VOLTAGE_DIVIDER) {
    return (
      <svg viewBox="0 0 340 240" className="w-full h-full select-none">
        {/* 输入 */}
        <Label x="60" y="60" text="Vin" color={c.in} />
        <circle cx="90" cy="60" r="3" stroke={c.in} fill="none" strokeWidth="2"/>
        <line x1="93" y1="60" x2="140" y2="60" stroke={c.wire} strokeWidth="2" />
        
        {/* R1 垂直 */}
        <line x1="140" y1="60" x2="140" y2="70" stroke={c.wire} strokeWidth="2" />
        <Resistor x={140} y={100} label="R1" val={`${params.r1}Ω`} v={true} />
        
        {/* 中间节点 */}
        <Node x={140} y={130} />
        
        {/* 输出 */}
        <line x1="140" y1="130" x2="220" y2="130" stroke={c.wire} strokeWidth="2" />
        <circle cx="223" cy="130" r="3" stroke={c.out} fill="none" strokeWidth="2"/>
        <Label x="250" y="130" text="Vout" color={c.out} />
        
        {/* R2 垂直 */}
        <line x1="140" y1="130" x2="140" y2="160" stroke={c.wire} strokeWidth="2" />
        <Resistor x={140} y={190} label="R2" val={`${params.r2}Ω`} v={true} />
        <line x1="140" y1="220" x2="140" y2="225" stroke={c.wire} strokeWidth="2" />
        <Ground x={140} y={225} />
      </svg>
    );
  }

  // 2. 反向放大器
  if (type === CircuitType.INVERTING_OPAMP) {
    return (
      <svg viewBox="0 0 340 240" className="w-full h-full select-none">
        <OpAmp x={180} y={120} label="OpAmp" /> 
        {/* Inverting Input at y=110, Non-Inv at y=130 */}

        {/* Input Path */}
        <Label x="30" y="110" text="Vin" color={c.in} />
        <circle cx="50" cy="110" r="3" stroke={c.in} fill="none" strokeWidth="2"/>
        <line x1="53" y1="110" x2="70" y2="110" stroke={c.wire} strokeWidth="2" />
        <Resistor x={100} y={110} label="Rin" val={`${params.rin}Ω`} />
        <Node x={130} y={110} />
        <line x1="130" y1="110" x2="140" y2="110" stroke={c.wire} strokeWidth="2" /> {/* Connect to OpAmp - */}

        {/* Feedback Loop */}
        <line x1="130" y1="110" x2="130" y2="60" stroke={c.wire} strokeWidth="2" />
        <line x1="130" y1="60" x2="150" y2="60" stroke={c.wire} strokeWidth="2" />
        <Resistor x={180} y={60} label="Rf" val={`${params.rf}Ω`} />
        <line x1="210" y1="60" x2="230" y2="60" stroke={c.wire} strokeWidth="2" />
        <line x1="230" y1="60" x2="230" y2="120" stroke={c.wire} strokeWidth="2" />
        
        {/* Output */}
        <line x1="220" y1="120" x2="280" y2="120" stroke={c.wire} strokeWidth="2" />
        <Node x={230} y={120} />
        <Label x="300" y="120" text="Vout" color={c.out} />

        {/* Non-Inverting Ground */}
        <line x1="140" y1="130" x2="130" y2="130" stroke={c.wire} strokeWidth="2" />
        <line x1="130" y1="130" x2="130" y2="150" stroke={c.wire} strokeWidth="2" />
        <Ground x={130} y={150} />
      </svg>
    );
  }

  // 3. 同向放大器
  if (type === CircuitType.NON_INVERTING_OPAMP) {
    return (
      <svg viewBox="0 0 340 240" className="w-full h-full select-none">
        <OpAmp x={180} y={120} label="OpAmp" />

        {/* Non-Inverting Input (+) at y=130 */}
        <Label x="30" y="130" text="Vin" color={c.in} />
        <circle cx="50" cy="130" r="3" stroke={c.in} fill="none" strokeWidth="2"/>
        <line x1="53" y1="130" x2="140" y2="130" stroke={c.wire} strokeWidth="2" />

        {/* Inverting Input (-) at y=110 */}
        <line x1="140" y1="110" x2="130" y2="110" stroke={c.wire} strokeWidth="2" />
        <Node x={130} y={110} />
        
        {/* R1 to Ground */}
        <line x1="130" y1="110" x2="130" y2="150" stroke={c.wire} strokeWidth="2" />
        <Resistor x={130} y={180} label="R1" val={`${params.r1}Ω`} v={true} />
        <line x1="130" y1="210" x2="130" y2="215" stroke={c.wire} strokeWidth="2" />
        <Ground x={130} y={215} />

        {/* Feedback R2 */}
        <line x1="130" y1="110" x2="130" y2="60" stroke={c.wire} strokeWidth="2" />
        <line x1="130" y1="60" x2="150" y2="60" stroke={c.wire} strokeWidth="2" />
        <Resistor x={180} y={60} label="R2" val={`${params.r2}Ω`} />
        <line x1="210" y1="60" x2="230" y2="60" stroke={c.wire} strokeWidth="2" />
        <line x1="230" y1="60" x2="230" y2="120" stroke={c.wire} strokeWidth="2" />

        {/* Output */}
        <line x1="220" y1="120" x2="280" y2="120" stroke={c.wire} strokeWidth="2" />
        <Node x={230} y={120} />
        <Label x="300" y="120" text="Vout" color={c.out} />
      </svg>
    );
  }

  // 4. RC 低通滤波器
  if (type === CircuitType.LOW_PASS_FILTER) {
    return (
      <svg viewBox="0 0 340 240" className="w-full h-full select-none">
        
        <Label x="50" y="100" text="Vin" color={c.in} />
        <circle cx="70" cy="100" r="3" stroke={c.in} fill="none" strokeWidth="2"/>
        <line x1="73" y1="100" x2="100" y2="100" stroke={c.wire} strokeWidth="2" />
        
        <Resistor x={130} y={100} label="R" val={`${params.r}Ω`} />
        
        <Node x={180} y={100} />
        <line x1="160" y1="100" x2="240" y2="100" stroke={c.wire} strokeWidth="2" />
        
        <Label x="260" y="100" text="Vout" color={c.out} />
        <circle cx="243" cy="100" r="3" stroke={c.out} fill="none" strokeWidth="2"/>

        <line x1="180" y1="100" x2="180" y2="130" stroke={c.wire} strokeWidth="2" />
        <Capacitor x={180} y={160} label="C" val={`${params.c}µF`} v={true} />
        <line x1="180" y1="190" x2="180" y2="195" stroke={c.wire} strokeWidth="2" />
        <Ground x={180} y={195} />
      </svg>
    );
  }

  // 5. 加法运算放大器
  if (type === CircuitType.SUMMING_AMPLIFIER) {
    return (
      <svg viewBox="0 0 340 240" className="w-full h-full select-none">
        <OpAmp x={190} y={120} label="Sum" />
        
        {/* Inputs Node */}
        <Node x={140} y={110} />
        <line x1="140" y1="110" x2="150" y2="110" stroke={c.wire} strokeWidth="2" /> {/* To OpAmp - */}

        {/* V1 Branch */}
        <Label x="30" y="80" text="V1" color={c.in} />
        <line x1="50" y1="80" x2="70" y2="80" stroke={c.wire} strokeWidth="2" />
        <Resistor x={100} y={80} label="R1" val={`${params.r1}k`} />
        <line x1="130" y1="80" x2="140" y2="80" stroke={c.wire} strokeWidth="2" />
        <line x1="140" y1="80" x2="140" y2="110" stroke={c.wire} strokeWidth="2" />

        {/* V2 Branch */}
        <Label x="30" y="140" text="V2" color="#c084fc" />
        <line x1="50" y1="140" x2="70" y2="140" stroke={c.wire} strokeWidth="2" />
        <Resistor x={100} y={140} label="R2" val={`${params.r2}k`} />
        <line x1="130" y1="140" x2="140" y2="140" stroke={c.wire} strokeWidth="2" />
        <line x1="140" y1="140" x2="140" y2="110" stroke={c.wire} strokeWidth="2" />

        {/* Feedback */}
        <line x1="140" y1="110" x2="140" y2="50" stroke={c.wire} strokeWidth="2" />
        <line x1="140" y1="50" x2="160" y2="50" stroke={c.wire} strokeWidth="2" />
        <Resistor x={190} y={50} label="Rf" val={`${params.rf}k`} />
        <line x1="220" y1="50" x2="240" y2="50" stroke={c.wire} strokeWidth="2" />
        <line x1="240" y1="50" x2="240" y2="120" stroke={c.wire} strokeWidth="2" />

        {/* Non-Inv Gnd */}
        <line x1="150" y1="130" x2="140" y2="130" stroke={c.wire} strokeWidth="2" />
        <line x1="140" y1="130" x2="140" y2="160" stroke={c.wire} strokeWidth="2" />
        <Ground x={140} y={160} />

        {/* Output */}
        <line x1="230" y1="120" x2="280" y2="120" stroke={c.wire} strokeWidth="2" />
        <Node x={240} y={120} />
        <Label x="300" y="120" text="Vout" color={c.out} />
      </svg>
    );
  }

  // 6. 减法器 (完全对称布局)
  if (type === CircuitType.DIFFERENCE_AMPLIFIER) {
    return (
       <svg viewBox="0 0 340 240" className="w-full h-full select-none">
        <OpAmp x={190} y={120} label="Diff" />

        {/* Top: V1 -> R1 -> NodeA -> OpAmp- */}
        <Label x="30" y="90" text="V1" color={c.in} />
        <line x1="50" y1="90" x2="70" y2="90" stroke={c.wire} strokeWidth="2" />
        <Resistor x={100} y={90} label="R1" val={`${params.r1}k`} />
        <line x1="130" y1="90" x2="140" y2="90" stroke={c.wire} strokeWidth="2" />
        <line x1="140" y1="90" x2="140" y2="110" stroke={c.wire} strokeWidth="2" />
        <line x1="140" y1="110" x2="150" y2="110" stroke={c.wire} strokeWidth="2" /> {/* to - */}
        <Node x={140} y={110} />

        {/* Feedback R2 (Rf) */}
        <line x1="140" y1="110" x2="140" y2="50" stroke={c.wire} strokeWidth="2" />
        <line x1="140" y1="50" x2="160" y2="50" stroke={c.wire} strokeWidth="2" />
        <Resistor x={190} y={50} label="R2" val={`${params.r2}k`} />
        <line x1="220" y1="50" x2="240" y2="50" stroke={c.wire} strokeWidth="2" />
        <line x1="240" y1="50" x2="240" y2="120" stroke={c.wire} strokeWidth="2" />

        {/* Bot: V2 -> R3 -> NodeB -> OpAmp+ */}
        <Label x="30" y="150" text="V2" color="#c084fc" />
        <line x1="50" y1="150" x2="70" y2="150" stroke={c.wire} strokeWidth="2" />
        <Resistor x={100} y={150} label="R3" val={`${params.r1}k`} />
        <line x1="130" y1="150" x2="140" y2="150" stroke={c.wire} strokeWidth="2" />
        <line x1="140" y1="150" x2="140" y2="130" stroke={c.wire} strokeWidth="2" />
        <line x1="140" y1="130" x2="150" y2="130" stroke={c.wire} strokeWidth="2" /> {/* to + */}
        <Node x={140} y={130} />

        {/* R4 to Gnd */}
        <line x1="140" y1="130" x2="140" y2="170" stroke={c.wire} strokeWidth="2" />
        <Resistor x={140} y={200} label="R4" val={`${params.r2}k`} v={true} />
        <line x1="140" y1="230" x2="140" y2="235" stroke={c.wire} strokeWidth="2" />
        <Ground x={140} y={235} />

        {/* Output */}
        <line x1="230" y1="120" x2="280" y2="120" stroke={c.wire} strokeWidth="2" />
        <Node x={240} y={120} />
        <Label x="300" y="120" text="Vout" color={c.out} />
       </svg>
    );
  }

  // 7. 光电池
  if (type === CircuitType.PHOTODIODE_SENSOR) {
    return (
      <svg viewBox="0 0 340 240" className="w-full h-full select-none">
        
        {/* Vbias */}
        <Label x="160" y="60" text="Vcc" color={c.in} />
        <line x1="160" y1="70" x2="160" y2="90" stroke={c.wire} strokeWidth="2" />
        
        {/* Diode (Reverse Bias, pointing UP) */}
        <Diode x={160} y={110} label="" v={true} led={true} />
        <line x1="160" y1="130" x2="160" y2="150" stroke={c.wire} strokeWidth="2" />
        
        <Node x={160} y={150} />
        
        {/* Output Tap */}
        <line x1="160" y1="150" x2="220" y2="150" stroke={c.wire} strokeWidth="2" />
        <circle cx="223" cy="150" r="3" stroke={c.out} fill="none" strokeWidth="2"/>
        <Label x="250" y="150" text="Vout" color={c.out} />

        {/* RL */}
        <Resistor x={160} y={180} label="RL" val={`${params.rl}k`} v={true} />
        <line x1="160" y1="210" x2="160" y2="215" stroke={c.wire} strokeWidth="2" />
        <Ground x={160} y={215} />
      </svg>
    );
  }

  // 8. TIA
  if (type === CircuitType.TRANS_IMPEDANCE_AMPLIFIER) {
    return (
      <svg viewBox="0 0 340 240" className="w-full h-full select-none">
        <OpAmp x={190} y={120} label="TIA" />

        {/* Diode Input */}
        <Node x={130} y={110} />
        <line x1="130" y1="110" x2="150" y2="110" stroke={c.wire} strokeWidth="2" /> {/* to - */}
        
        <line x1="130" y1="110" x2="130" y2="140" stroke={c.wire} strokeWidth="2" />
        {/* Diode Cathode to Input, Anode to Gnd (Points UP) */}
        <Diode x={130} y={160} label="PD" v={true} led={true} />
        <line x1="130" y1="180" x2="130" y2="190" stroke={c.wire} strokeWidth="2" />
        <Ground x={130} y={190} />

        {/* Feedback */}
        <line x1="130" y1="110" x2="130" y2="60" stroke={c.wire} strokeWidth="2" />
        <line x1="130" y1="60" x2="160" y2="60" stroke={c.wire} strokeWidth="2" />
        <Resistor x={190} y={60} label="Rf" val={`${params.rf}k`} />
        <line x1="220" y1="60" x2="240" y2="60" stroke={c.wire} strokeWidth="2" />
        <line x1="240" y1="60" x2="240" y2="120" stroke={c.wire} strokeWidth="2" />

        {/* Non Inv Gnd */}
        <line x1="150" y1="130" x2="140" y2="130" stroke={c.wire} strokeWidth="2" />
        <line x1="140" y1="130" x2="140" y2="150" stroke={c.wire} strokeWidth="2" />
        <Ground x={140} y={150} />

        {/* Output */}
        <line x1="230" y1="120" x2="280" y2="120" stroke={c.wire} strokeWidth="2" />
        <Node x={240} y={120} />
        <Label x="300" y="120" text="Vout" color={c.out} />
      </svg>
    );
  }

  // 9. 有源带通滤波器 (Standard Inverting BPF / MFB)
  if (type === CircuitType.BAND_PASS_FILTER) {
    return (
      <svg viewBox="0 0 340 240" className="w-full h-full select-none">
        
        {/* OpAmp */}
        <OpAmp x={240} y={130} label="BPF" />
        {/* OpAmp Inputs: (-) at y=120, (+) at y=140 */}

        {/* (+) Input to Ground */}
        <line x1={215} y1={140} x2={215} y2={160} stroke={c.wire} strokeWidth="2" />
        <Ground x={215} y={160} />

        {/* Input V_in */}
        <Label x={30} y={120} text="Vin" color={c.in} />
        <circle cx={50} cy={120} r="3" stroke={c.in} fill="none" strokeWidth="2"/>
        <line x1={53} y1={120} x2="70" y2="120" stroke={c.wire} strokeWidth="2" />

        {/* R1 (Input Resistor) */}
        <Resistor x={100} y={120} label="R1" val={`${params.r}k`} />
        
        {/* Node 1 (Summing Node) */}
        <Node x={140} y={120} />
        
        {/* R2 (Ground Resistor) from Node 1 */}
        <line x1={140} y1={120} x2={140} y2={150} stroke={c.wire} strokeWidth="2" />
        <Resistor x={140} y={180} label="R2" val="1k" v={true} />
        <Ground x={140} y={215} />

        {/* C1 (Series Capacitor) Node 1 -> Inv Input */}
        <line x1={140} y1={120} x2={150} y2={120} stroke={c.wire} strokeWidth="2" />
        <Capacitor x={180} y={120} label="C1" val={`${params.c}nF`} />
        <line x1={205} y1={120} x2={215} y2={120} stroke={c.wire} strokeWidth="2" /> {/* To OpAmp - */}

        {/* Feedback 1: C2 from Output to Node 1 */}
        <line x1={275} y1={130} x2={290} y2={130} stroke={c.wire} strokeWidth="2" />
        <Node x={290} y={130} />
        
        <line x1={290} y1={130} x2={290} y2={60} stroke={c.wire} strokeWidth="2" />
        <line x1={290} y1={60} x2={210} y2={60} stroke={c.wire} strokeWidth="2" />
        <Capacitor x={180} y={60} label="C2" val={`${params.c}nF`} />
        <line x1={155} y1={60} x2={140} y2={60} stroke={c.wire} strokeWidth="2" />
        <line x1={140} y1={60} x2={140} y2={120} stroke={c.wire} strokeWidth="2" />

        {/* Feedback 2: Rf from Output to Inv Input */}
        <line x1={290} y1={130} x2={290} y2={90} stroke={c.wire} strokeWidth="2" />
        <line x1={290} y1={90} x2={250} y2={90} stroke={c.wire} strokeWidth="2" />
        <Resistor x={240} y={90} label="Rf" val={`${params.r}k`} />
        <line x1={215} y1={90} x2={215} y2={120} stroke={c.wire} strokeWidth="2" />

        {/* Output Label */}
        <line x1={290} y1={130} x2={310} y2={130} stroke={c.wire} strokeWidth="2" />
        <Label x={325} y={130} text="Vout" color={c.out} />
      </svg>
    );
  }

  // 10. 文氏电桥振荡器 (Signal Generator) - 修正遮挡
  if (type === CircuitType.SIGNAL_GENERATOR) {
    const yOffset = 0; // Removed offset since title is gone
    return (
      <svg viewBox="0 0 340 240" className="w-full h-full select-none">
        
        {/* OpAmp center @ 240, 160 */}
        <OpAmp x={240} y={120 + yOffset} label="Osc" />

        {/* Output Node */}
        <line x1={275} y1={120 + yOffset} x2={300} y2={120 + yOffset} stroke={c.wire} strokeWidth="2" />
        <Node x={280} y={120 + yOffset} />
        <Label x={320} y={120 + yOffset} text="Out" color={c.out} />

        {/* Feedback Top Rail */}
        <line x1={280} y1={120 + yOffset} x2={280} y2={25 + yOffset} stroke={c.wire} strokeWidth="2" />
        <line x1={280} y1={25 + yOffset} x2={80} y2={25 + yOffset} stroke={c.wire} strokeWidth="2" />

        {/* Gain Branch (Negative Feedback) to (-) Input */}
        <line x1={160} y1={25 + yOffset} x2={160} y2={110 + yOffset} stroke={c.wire} strokeWidth="2" />
        
        {/* Rf (Gain) */}
        <Resistor x={160} y={65 + yOffset} label="Rf" val="2R" v={true} />
        
        {/* Node A: Connect to OpAmp (-) at (215, 110 + off) */}
        <Node x={160} y={110 + yOffset} />
        <line x1={160} y1={110 + yOffset} x2={215} y2={110 + yOffset} stroke={c.wire} strokeWidth="2" />

        {/* R1 (Ground) */}
        <line x1={160} y1={110 + yOffset} x2={160} y2={185 + yOffset} stroke={c.wire} strokeWidth="2" />
        <Resistor x={160} y={150 + yOffset} label="R1" val="R" v={true} />
        <Ground x={160} y={185 + yOffset} />

        {/* Wien Branch (Frequency Selective) to (+) Input */}
        <line x1={80} y1={25 + yOffset} x2={80} y2={130 + yOffset} stroke={c.wire} strokeWidth="2" />
        
        {/* Series RC */}
        <Resistor x={80} y={50 + yOffset} label="R" val={`${params.r}k`} v={true} />
        <Capacitor x={80} y={90 + yOffset} label="C" val={`${params.c}nF`} v={true} />
        
        {/* Node B: Connect to OpAmp (+) at (215, 130 + off) */}
        <Node x={80} y={130 + yOffset} />
        {/* Horizontal wire to (+) input. */}
        <line x1={80} y1={130 + yOffset} x2={215} y2={130 + yOffset} stroke={c.wire} strokeWidth="2" />

        {/* Parallel RC */}
        <line x1={80} y1={130 + yOffset} x2={80} y2={145 + yOffset} stroke={c.wire} strokeWidth="2" />
        {/* Split */}
        <line x1={55} y1={145 + yOffset} x2={105} y2={145 + yOffset} stroke={c.wire} strokeWidth="2" />
        
        {/* Left R */}
        <line x1={55} y1={145 + yOffset} x2={55} y2={205 + yOffset} stroke={c.wire} strokeWidth="2" />
        <Resistor x={55} y={175 + yOffset} label="R" val={`${params.r}k`} v={true} />
        
        {/* Right C */}
        <line x1={105} y1={145 + yOffset} x2={105} y2={205 + yOffset} stroke={c.wire} strokeWidth="2" />
        <Capacitor x={105} y={175 + yOffset} label="C" val={`${params.c}nF`} v={true} />

        {/* Rejoin Gnd */}
        <line x1={55} y1={205 + yOffset} x2={105} y2={205 + yOffset} stroke={c.wire} strokeWidth="2" />
        <line x1={80} y1={205 + yOffset} x2={80} y2={215 + yOffset} stroke={c.wire} strokeWidth="2" />
        <Ground x={80} y={215 + yOffset} />
      </svg>
    );
  }

  return <div className="text-white text-center p-10">请选择电路</div>;
};
