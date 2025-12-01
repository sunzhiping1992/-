
import React, { useState, useEffect } from 'react';
import { CircuitType, SimulationDataPoint } from './types';
import { ControlKnob } from './components/ControlKnob';
import { Oscilloscope } from './components/Oscilloscope';
import { CircuitDiagram } from './components/CircuitDiagrams';
import { explainCircuit } from './services/geminiService';
import { Activity, Cpu, Zap, Info, Loader2 } from 'lucide-react';
import clsx from 'clsx';

// --- Circuit Definitions & Calculation Logic ---

const CIRCUITS = {
  [CircuitType.VOLTAGE_DIVIDER]: {
    defaultParams: { vin: 5, r1: 1000, r2: 1000 },
    controls: [
      { id: 'vin', label: '输入电压 (Vin)', min: -10, max: 10, step: 0.1, unit: 'V' },
      { id: 'r1', label: '电阻 R1', min: 100, max: 10000, step: 100, unit: 'Ω' },
      { id: 'r2', label: '电阻 R2', min: 100, max: 10000, step: 100, unit: 'Ω' },
    ]
  },
  [CircuitType.INVERTING_OPAMP]: {
    defaultParams: { vin: 1, freq: 1, rin: 1000, rf: 2000 },
    controls: [
      { id: 'vin', label: '输入幅值', min: 0.1, max: 5, step: 0.1, unit: 'V' },
      { id: 'freq', label: '频率', min: 1, max: 20, step: 1, unit: 'Hz' },
      { id: 'rin', label: '输入电阻 (Rin)', min: 100, max: 5000, step: 100, unit: 'Ω' },
      { id: 'rf', label: '反馈电阻 (Rf)', min: 100, max: 10000, step: 100, unit: 'Ω' },
    ]
  },
  [CircuitType.NON_INVERTING_OPAMP]: {
    defaultParams: { vin: 1, freq: 1, r1: 1000, r2: 2000 },
    controls: [
      { id: 'vin', label: '输入幅值', min: 0.1, max: 5, step: 0.1, unit: 'V' },
      { id: 'freq', label: '频率', min: 1, max: 20, step: 1, unit: 'Hz' },
      { id: 'r1', label: '接地电阻 (R1)', min: 100, max: 5000, step: 100, unit: 'Ω' },
      { id: 'r2', label: '反馈电阻 (R2)', min: 100, max: 10000, step: 100, unit: 'Ω' },
    ]
  },
  [CircuitType.LOW_PASS_FILTER]: {
    defaultParams: { vin: 2, freq: 50, r: 1000, c: 10 }, // C in uF
    controls: [
      { id: 'vin', label: '输入幅值', min: 0.1, max: 5, step: 0.1, unit: 'V' },
      { id: 'freq', label: '频率', min: 10, max: 200, step: 10, unit: 'Hz' },
      { id: 'r', label: '电阻 (R)', min: 100, max: 5000, step: 100, unit: 'Ω' },
      { id: 'c', label: '电容 (C)', min: 1, max: 100, step: 1, unit: 'µF' },
    ]
  },
  [CircuitType.SUMMING_AMPLIFIER]: {
    defaultParams: { v1: 1, v2: -0.5, freq: 2, r1: 1, r2: 1, rf: 2 }, // Resistors in kOhm
    controls: [
      { id: 'v1', label: '输入 V1 (正弦波)', min: -5, max: 5, step: 0.1, unit: 'V' },
      { id: 'v2', label: '输入 V2 (直流偏置)', min: -5, max: 5, step: 0.1, unit: 'V' },
      { id: 'r1', label: '电阻 R1', min: 0.5, max: 10, step: 0.5, unit: 'kΩ' },
      { id: 'r2', label: '电阻 R2', min: 0.5, max: 10, step: 0.5, unit: 'kΩ' },
      { id: 'rf', label: '反馈电阻 Rf', min: 0.5, max: 10, step: 0.5, unit: 'kΩ' },
    ]
  },
  [CircuitType.DIFFERENCE_AMPLIFIER]: {
    defaultParams: { v1: 2, v2: 2.5, freq: 2, r1: 10, r2: 10 }, // R in kOhm, balanced
    controls: [
      { id: 'v1', label: '输入 V1 (反相端)', min: 0, max: 5, step: 0.1, unit: 'V' },
      { id: 'v2', label: '输入 V2 (同相端)', min: 0, max: 5, step: 0.1, unit: 'V' },
      { id: 'r1', label: '输入电阻 (R1)', min: 1, max: 50, step: 1, unit: 'kΩ' },
      { id: 'r2', label: '反馈电阻 (R2)', min: 1, max: 50, step: 1, unit: 'kΩ' },
    ]
  },
  [CircuitType.PHOTODIODE_SENSOR]: {
    defaultParams: { lux: 500, rl: 10, vbias: 5 }, // RL in kOhm
    controls: [
      { id: 'lux', label: '光照强度 (Lux)', min: 0, max: 2000, step: 10, unit: 'lx' },
      { id: 'rl', label: '负载电阻 (RL)', min: 1, max: 100, step: 1, unit: 'kΩ' },
      { id: 'vbias', label: '偏置电压 (Vcc)', min: 1, max: 12, step: 0.5, unit: 'V' },
    ]
  },
  [CircuitType.TRANS_IMPEDANCE_AMPLIFIER]: {
    defaultParams: { lux: 200, rf: 100 }, // Rf in kOhm
    controls: [
      { id: 'lux', label: '光照强度 (Lux)', min: 0, max: 1000, step: 10, unit: 'lx' },
      { id: 'rf', label: '反馈电阻 (Rf)', min: 10, max: 1000, step: 10, unit: 'kΩ' },
    ]
  },
  [CircuitType.BAND_PASS_FILTER]: {
    defaultParams: { vin: 2, freq: 1000, r: 1, c: 100 }, // c in nF, freq in Hz
    controls: [
      { id: 'vin', label: '输入幅值', min: 0.1, max: 5, step: 0.1, unit: 'V' },
      { id: 'freq', label: '输入频率', min: 100, max: 5000, step: 100, unit: 'Hz' },
      { id: 'r', label: '电阻 (R)', min: 0.5, max: 20, step: 0.5, unit: 'kΩ' },
      { id: 'c', label: '电容 (C)', min: 10, max: 470, step: 10, unit: 'nF' },
    ]
  },
  [CircuitType.SIGNAL_GENERATOR]: {
    defaultParams: { r: 10, c: 100 }, // R in kOhm, C in nF
    controls: [
      { id: 'r', label: '电阻 (R)', min: 1, max: 50, step: 1, unit: 'kΩ' },
      { id: 'c', label: '电容 (C)', min: 10, max: 470, step: 10, unit: 'nF' },
    ]
  },
};

const App: React.FC = () => {
  const [activeCircuit, setActiveCircuit] = useState<CircuitType>(CircuitType.INVERTING_OPAMP);
  const [params, setParams] = useState<Record<string, number>>(CIRCUITS[CircuitType.INVERTING_OPAMP].defaultParams);
  const [data, setData] = useState<SimulationDataPoint[]>([]);
  
  // AI State
  const [aiExplanation, setAiExplanation] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);

  // --- Simulation Loop ---
  useEffect(() => {
    const generateData = () => {
      const points: SimulationDataPoint[] = [];
      const steps = 150;
      
      switch (activeCircuit) {
        case CircuitType.VOLTAGE_DIVIDER:
          for (let i = 0; i < steps; i++) {
            const vout = params.vin * (params.r2 / (params.r1 + params.r2));
            points.push({ time: i, input: params.vin, output: vout });
          }
          break;

        case CircuitType.INVERTING_OPAMP:
          // Vout = -Vin * (Rf/Rin)
          const gainInv = -(params.rf / params.rin);
          for (let i = 0; i < steps; i++) {
            const t = i / steps; 
            const theta = 2 * Math.PI * params.freq * t;
            const vin = params.vin * Math.sin(theta);
            let vout = vin * gainInv;
            if (vout > 12) vout = 12;
            if (vout < -12) vout = -12;
            points.push({ time: i, input: vin, output: vout });
          }
          break;
        
        case CircuitType.NON_INVERTING_OPAMP:
          // Vout = Vin * (1 + R2/R1)
          const gainNonInv = 1 + (params.r2 / params.r1);
          for (let i = 0; i < steps; i++) {
            const t = i / steps;
            const theta = 2 * Math.PI * params.freq * t;
            const vin = params.vin * Math.sin(theta);
            let vout = vin * gainNonInv;
            if (vout > 12) vout = 12;
            if (vout < -12) vout = -12;
            points.push({ time: i, input: vin, output: vout });
          }
          break;

        case CircuitType.LOW_PASS_FILTER:
           // Vout = Vin / sqrt(1 + (wRC)^2)
           const R_LP = params.r;
           const C_LP = params.c * 1e-6;
           const f_LP = params.freq;
           const w_LP = 2 * Math.PI * f_LP;
           const Z_LP = Math.sqrt(1 + Math.pow(w_LP * R_LP * C_LP, 2));
           const gainLPF = 1 / Z_LP;
           const phaseLag = -Math.atan(w_LP * R_LP * C_LP);

           for (let i = 0; i < steps; i++) {
             const t = i / steps * (3/10); 
             const theta = 2 * Math.PI * f_LP * t; 
             const vin = params.vin * Math.sin(theta);
             const vout = params.vin * gainLPF * Math.sin(theta + phaseLag);
             points.push({ time: i, input: vin, output: vout });
           }
           break;
        
        case CircuitType.SUMMING_AMPLIFIER:
           // Vout = -Rf * (V1/R1 + V2/R2)
           for (let i = 0; i < steps; i++) {
              const t = i / steps;
              const theta = 2 * Math.PI * (params.freq || 1) * t;
              const v1 = params.v1 * Math.sin(theta);
              const v2 = params.v2; 
              
              let vout = -params.rf * ((v1 / params.r1) + (v2 / params.r2));
              if (vout > 12) vout = 12;
              if (vout < -12) vout = -12;
              
              points.push({ time: i, input: v1, input2: v2, output: vout });
           }
           break;

        case CircuitType.DIFFERENCE_AMPLIFIER:
            // Vout = (R2/R1) * (V2 - V1) for balanced resistors R1=R3, R2=R4
            // Let's assume user adjusts R1 (input resistors) and R2 (feedback/ground resistors) pairs.
            const gainDiff = params.r2 / params.r1;
            for (let i = 0; i < steps; i++) {
              const t = i / steps;
              const theta = 2 * Math.PI * (params.freq || 2) * t;
              const v1 = params.v1 * Math.sin(theta); // Sine wave
              const v2 = params.v2; // DC or slowly varying? Let's keep it DC or Phase shifted
              
              let vout = gainDiff * (v2 - v1);
              if (vout > 12) vout = 12;
              if (vout < -12) vout = -12;
              
              points.push({ time: i, input: v1, input2: v2, output: vout });
            }
            break;

        case CircuitType.PHOTODIODE_SENSOR:
            // Vout = I_photo * RL
            // I_photo approx 0.5uA per Lux (random assumption for sim)
            const sensitivity = 0.5; // uA per Lux
            for (let i = 0; i < steps; i++) {
               const t = i / steps;
               // Simulate changing light intensity
               const fluctuatingLux = params.lux + (params.lux * 0.2 * Math.sin(2 * Math.PI * 2 * t));
               const i_photo_uA = fluctuatingLux * sensitivity;
               // Vout = I * R. (uA * kOhm = mV -> /1000 = V)
               // uA = 1e-6, kOhm = 1e3. product is 1e-3 (mV).
               let vout = (i_photo_uA * params.rl) / 1000;
               
               // In a voltage divider configuration with reverse bias, Vout is across Resistor
               if (vout > params.vbias) vout = params.vbias; // Clamped by bias

               // Input trace shows Lux (normalized for display)
               const displayInput = fluctuatingLux / 200; 

               points.push({ time: i, input: displayInput, output: vout });
            }
            break;

        case CircuitType.TRANS_IMPEDANCE_AMPLIFIER:
            // Vout = - I_photo * Rf
            const sensitivityTIA = 0.5; // uA per Lux
            for (let i = 0; i < steps; i++) {
              const t = i / steps;
              const fluctuatingLux = params.lux + (params.lux * 0.2 * Math.sin(2 * Math.PI * 2 * t));
              const i_photo_uA = fluctuatingLux * sensitivityTIA;
              // Vout is negative for standard TIA
              let vout = -(i_photo_uA * params.rf) / 1000; 
              
              if (vout < -12) vout = -12;

              const displayInput = fluctuatingLux / 100;
              points.push({ time: i, input: displayInput, output: vout });
            }
            break;
            
        case CircuitType.BAND_PASS_FILTER:
            // Simple Multiple Feedback Bandpass Filter Approximation
            // Center freq f0 = 1 / (2pi C sqrt(R1*R2)) ... simplified math for visualization
            // Let's compute the attenuation for the current input freq vs center freq
            const R_BP = params.r * 1000;
            const C_BP = params.c * 1e-9;
            const f_in = params.freq;
            const f_center = 1 / (2 * Math.PI * R_BP * C_BP); // Approx center
            const Q = 1; // Quality factor fixed for viz
            
            // Standard normalized bandpass response magnitude
            const x = f_in / f_center;
            const gainMag = 1 / Math.sqrt(1 + (Q * (x - 1/x))**2);
            
            // Phase shift
            const phaseBP = -Math.atan(Q * (x - 1/x));

            for (let i = 0; i < steps; i++) {
              const t = i / steps * 0.5; 
              const theta = 2 * Math.PI * f_in * t; // Use actual f_in for wave density visual? 
              // Actually for visual stability, let's keep wave density constant-ish but scale amplitude
              // Wait, oscilloscope should show frequency change.
              // We'll just oscillate at a fixed relative rate for visual, but scale amplitude by 'gainMag'
              
              const visualFreq = 5; // Fixed visual frequency
              const vin = params.vin * Math.sin(2 * Math.PI * visualFreq * t);
              const vout = params.vin * gainMag * Math.sin(2 * Math.PI * visualFreq * t + phaseBP);
              
              points.push({ time: i, input: vin, output: vout });
            }
            break;

        case CircuitType.SIGNAL_GENERATOR:
            // Wien Bridge Oscillator
            // Freq = 1 / (2pi RC)
            const f_osc = 1 / (2 * Math.PI * (params.r * 1000) * (params.c * 1e-9));
            
            for (let i = 0; i < steps; i++) {
               // Show the wave. The "Input" is 0 or noise, Output is Sine.
               // We need to map time 'i' to real time to show frequency change
               // Let's assume t goes from 0 to 1ms total for the graph
               const totalTime = 0.002; // 2ms window
               const t = (i / steps) * totalTime;
               
               const vout = 5 * Math.sin(2 * Math.PI * f_osc * t); // 5V amplitude
               
               points.push({ time: i, input: 0, output: vout });
            }
            break;
      }
      setData(points);
    };

    generateData();
  }, [activeCircuit, params]);

  // --- Handlers ---
  const handleCircuitChange = (type: CircuitType) => {
    setActiveCircuit(type);
    if (CIRCUITS[type]) {
      setParams(CIRCUITS[type].defaultParams);
    }
    setAiExplanation(""); 
    setShowAiPanel(false);
  };

  const handleParamChange = (key: string, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const handleAskAI = async () => {
    setIsAiLoading(true);
    setShowAiPanel(true);
    let signalDesc = "标准正弦波输入";
    if (activeCircuit === CircuitType.PHOTODIODE_SENSOR) signalDesc = "变化的光照强度";
    if (activeCircuit === CircuitType.SIGNAL_GENERATOR) signalDesc = "自激振荡";

    const result = await explainCircuit(activeCircuit, params, signalDesc);
    setAiExplanation(result);
    setIsAiLoading(false);
  };

  // --- Render ---
  return (
    <div className="flex h-screen bg-circuit-bg text-slate-200 overflow-hidden font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col overflow-y-auto shrink-0">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2 text-circuit-accent mb-1">
            <Cpu size={24} />
            <h1 className="text-xl font-bold tracking-wider">CIRCUIT<span className="text-white">SIM</span></h1>
          </div>
          <p className="text-xs text-slate-500">模拟电路教学仿真</p>
        </div>
        
        <nav className="p-4 space-y-1 flex-1">
          {Object.keys(CIRCUITS).map((key) => {
             const type = key as CircuitType;
             return (
              <button
                key={type}
                onClick={() => handleCircuitChange(type)}
                className={clsx(
                  "w-full text-left px-4 py-3 rounded-lg text-sm transition-all flex items-center gap-3",
                  activeCircuit === type 
                    ? "bg-circuit-accent/10 text-circuit-accent border border-circuit-accent/20" 
                    : "hover:bg-slate-800 text-slate-400"
                )}
              >
                <Activity size={16} className={activeCircuit === type ? "text-circuit-accent" : "text-slate-600"} />
                {type}
              </button>
             );
          })}
        </nav>
        
        <div className="p-4 border-t border-slate-800">
           <div className="bg-slate-800 rounded p-3 text-xs text-slate-400">
              <div className="flex items-center gap-2 mb-2 text-slate-300">
                <Info size={14}/> 
                <span>使用指南</span>
              </div>
              选择一个电路，调整右侧旋钮，观察示波器中的实时波形变化。
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur-sm shrink-0">
           <h2 className="text-lg font-medium text-white tracking-wide">{activeCircuit}</h2>
           <button 
             onClick={handleAskAI}
             className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white px-5 py-2 rounded-full text-sm font-medium transition-all shadow-lg shadow-purple-900/20"
           >
             <Zap size={16} fill="currentColor" />
             {isAiLoading ? '分析中...' : 'AI 助教'}
           </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Visuals */}
          <div className="lg:col-span-8 flex flex-col gap-6 min-h-[500px]">
             {/* Oscilloscope */}
             <section className="bg-circuit-panel rounded-xl p-4 border border-slate-700 shadow-xl">
               <div className="flex justify-between items-center mb-4">
                 <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">示波器 (Oscilloscope)</h3>
                 <span className="text-xs font-mono text-green-400 animate-pulse">LIVE</span>
               </div>
               <Oscilloscope 
                 data={data} 
                 showInput2={activeCircuit === CircuitType.SUMMING_AMPLIFIER || activeCircuit === CircuitType.DIFFERENCE_AMPLIFIER} 
               />
               <div className="mt-2 text-xs text-slate-500 text-right">
                  {activeCircuit === CircuitType.PHOTODIODE_SENSOR && "* 输入显示为相对光强"}
                  {activeCircuit === CircuitType.BAND_PASS_FILTER && "* 输入信号频率决定幅度衰减"}
               </div>
             </section>

             {/* Diagram */}
             <section className="flex-1 bg-white/5 rounded-xl p-6 border border-slate-700/50 flex items-center justify-center min-h-[350px]">
                <CircuitDiagram type={activeCircuit} params={params} />
             </section>
          </div>

          {/* Right Column: Controls */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-circuit-panel rounded-xl p-6 border border-slate-700">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-6 pb-2 border-b border-slate-700">电路参数</h3>
              
              {(CIRCUITS as any)[activeCircuit] ? (
                (CIRCUITS as any)[activeCircuit].controls.map((ctrl: any) => (
                  <ControlKnob
                    key={ctrl.id}
                    {...ctrl}
                    value={params[ctrl.id]}
                    onChange={(val) => handleParamChange(ctrl.id, val)}
                  />
                ))
              ) : (
                <div className="text-slate-500">暂无参数控制</div>
              )}
            </div>

            {/* AI Panel (Conditional) */}
            {(showAiPanel || aiExplanation) && (
              <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl p-1 border border-indigo-500/30 animate-in fade-in slide-in-from-bottom-4 shadow-2xl">
                <div className="bg-slate-900/95 rounded-lg p-5">
                   <div className="flex items-center gap-2 mb-3 text-indigo-400">
                     <Zap size={18} />
                     <h3 className="font-semibold">AI 电路分析</h3>
                   </div>
                   
                   {isAiLoading ? (
                     <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                        <Loader2 className="animate-spin mb-2" size={24} />
                        <span className="text-sm">正在计算电路物理特性...</span>
                     </div>
                   ) : (
                     <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed">
                        <div dangerouslySetInnerHTML={{ __html: aiExplanation.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong class="text-indigo-300">$1</strong>') }} />
                     </div>
                   )}
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;
