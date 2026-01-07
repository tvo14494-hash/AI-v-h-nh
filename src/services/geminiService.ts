import { GoogleGenerativeAI } from "@google/genai";
import { GeometryData } from "../types";

// Lấy API Key từ biến môi trường của Netlify (đã cấu hình VITE_)
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export const parseGeometryPrompt = async (prompt: string): Promise<GeometryData> => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const systemInstruction = `
    Bạn là một chuyên gia toán học hình học. Hãy phân tích đề bài tiếng Việt và trả về JSON định dạng GeometryData.
    Cấu trúc JSON:
    {
      "points": [{"id": "A", "x": 400, "y": 200, "label": "A"}],
      "lines": [{"from": "A", "to": "B", "dashed": false, "isPerp": false}],
      "circles": [{"center": "O", "radiusPt": "A"}],
      "angles": []
    }
    Lưu ý: 
    - Nếu là đường cao, hãy để isPerp: true.
    - Nếu là nét phụ, hãy để dashed: true.
    - Tọa độ canvas từ 0-800.
  `;

  const result = await model.generateContent([systemInstruction, prompt]);
  const response = await result.response;
  const text = response.text();
  
  // Trích xuất JSON từ phản hồi của AI
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI không trả về đúng định dạng hình học.");
  
  return JSON.parse(jsonMatch[0]);
};
