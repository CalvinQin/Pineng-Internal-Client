import { GoogleGenAI, Type } from "@google/genai";
import { AddressParseResult, ProductParseResult } from "../types";

const getAI = () => {
  if (!process.env.API_KEY) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
}

export const parseAddressWithAI = async (rawText: string): Promise<AddressParseResult> => {
  const ai = getAI();

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `你是一个专业的外贸地址解析助手。请从以下的原始文本中提取收件人姓名、电话号码、完整收货地址和国家。
      
      注意：
      1. 文本可能包含中文、英文或混合内容，以及很多杂乱的物流标记。
      2. 如果国家没有明确写出，请根据城市或地址上下文推断（例如 'Guangzhou' -> '中国', 'Lome' -> '多哥'）。
      3. 保持地址的完整性。

      原始文本:
      "${rawText}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recipientName: { type: Type.STRING },
            recipientPhone: { type: Type.STRING },
            recipientAddress: { type: Type.STRING },
            country: { type: Type.STRING },
          },
          required: ["recipientName", "recipientAddress", "country"],
        },
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from AI");

    return JSON.parse(jsonText) as AddressParseResult;

  } catch (error) {
    console.error("Gemini Parse Error:", error);
    return {
      recipientName: "",
      recipientPhone: "",
      recipientAddress: rawText.substring(0, 50),
      country: "",
    };
  }
};

export const parseProductInfoWithAI = async (rawText: string): Promise<Partial<ProductParseResult>> => {
  const ai = getAI();

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `你是一个外贸产品数据助手。请从以下杂乱的文本中提取产品规格信息。
      你需要提取：产品型号、名称、产品尺寸、建议单价(如果没有则为0)、装箱数(每箱多少个)、外箱尺寸(长x宽x高cm)、整箱毛重(kg)。

      原始文本:
      "${rawText}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            model: { type: Type.STRING, description: "型号" },
            name: { type: Type.STRING, description: "产品名称" },
            size: { type: Type.STRING, description: "产品本身尺寸" },
            price: { type: Type.NUMBER, description: "单价" },
            qtyPerCarton: { type: Type.NUMBER, description: "每箱数量 (pcs/ctn)" },
            cartonSize: { type: Type.STRING, description: "外箱尺寸 (e.g. 60x40x30cm)" },
            grossWeight: { type: Type.NUMBER, description: "整箱重量 (kg)" },
            description: { type: Type.STRING, description: "包含的配件或描述" },
          },
          required: ["model", "qtyPerCarton"],
        },
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from AI");

    return JSON.parse(jsonText) as Partial<ProductParseResult>;

  } catch (error) {
    console.error("Gemini Product Parse Error:", error);
    return {};
  }
};