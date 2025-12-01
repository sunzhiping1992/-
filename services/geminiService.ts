import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const explainCircuit = async (
  circuitName: string,
  params: Record<string, number>,
  inputSignal: string
): Promise<string> => {
  if (!apiKey) {
    return "缺少 API 密钥。请检查配置。";
  }

  const prompt = `
    你是一位专业的电子工程教授，正在讲授模拟电路课程。
    
    当前电路: ${circuitName}
    当前参数: ${JSON.stringify(params)}
    输入信号背景: ${inputSignal}

    请根据这些具体参数，对电路中发生的情况进行简洁而深刻的解释。请使用中文回答。
    
    1. 根据提供的参数计算理论关键值（例如：增益 Gain、截止频率 Cutoff Frequency、输出电压 Vout）。
    2. 解释电路行为（例如：“信号被反向并放大了 2 倍”）。
    3. 如果参数设定较为极端（例如增益过高），请提及可能出现的实际问题，如饱和失真或噪声（即使仿真中是理想状态）。
    
    请将回复控制在 200 字以内。使用 Markdown 格式（如粗体）来强调关键数值。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "未生成解释。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "暂时无法生成解释，请稍后再试。";
  }
};