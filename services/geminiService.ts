import { AddressParseResult, ProductParseResult } from "../types";
import { COUNTRIES } from "../constants";

// Helper to find country in text
const findCountry = (text: string): string => {
  for (const country of COUNTRIES) {
    if (text.includes(country)) return country;
  }
  // Basic mapping fallback
  if (text.match(/Guangzhou|Foshan|China/i)) return "中国";
  if (text.match(/Lome|Togo/i)) return "多哥";
  if (text.match(/Zambia|Lusaka/i)) return "赞比亚";
  if (text.match(/Benin|Cotonou/i)) return "贝宁";
  if (text.match(/Nigeria|Lagos/i)) return "尼日利亚";
  return "";
};

/**
 * Local Regex-based Address Parser
 * Replaces Google AI for China accessibility
 */
export const parseAddressWithAI = async (rawText: string): Promise<AddressParseResult> => {
  // Simulate async delay for UI consistency
  await new Promise(resolve => setTimeout(resolve, 300));

  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l);
  
  let recipientName = "";
  let recipientPhone = "";
  let country = findCountry(rawText);
  let addressParts: string[] = [];

  // Regex for phone detection (supports various formats)
  const phoneRegex = /(?:(?:\+|00)86)?1[3-9]\d{9}|(?:\+|00)\d{1,3}[\s-]?\d{6,}/g;
  
  const phoneMatch = rawText.match(phoneRegex);
  if (phoneMatch && phoneMatch.length > 0) {
    recipientPhone = phoneMatch[0];
  }

  // Simple heuristic for parsing
  // Assuming: Name is often short, Address is long
  for (const line of lines) {
    // If line is the phone number, skip adding to address
    if (line.includes(recipientPhone) && recipientPhone) continue;

    // Try to identify name (short line, no numbers usually)
    if (!recipientName && line.length < 20 && !line.match(/\d{5,}/)) {
        // check for keywords
        if (line.toLowerCase().startsWith("name:") || line.toLowerCase().startsWith("收件人")) {
            recipientName = line.replace(/name:|收件人[:：]/i, "").trim();
        } else {
            recipientName = line;
        }
        continue;
    }
    
    // Detect Country line
    if (COUNTRIES.includes(line.trim())) {
        country = line.trim();
        continue;
    }

    addressParts.push(line);
  }

  return {
    recipientName: recipientName,
    recipientPhone: recipientPhone,
    recipientAddress: addressParts.join(", "),
    country: country,
  };
};

/**
 * Local Regex-based Product Parser
 * Replaces Google AI for China accessibility
 */
export const parseProductInfoWithAI = async (rawText: string): Promise<Partial<ProductParseResult>> => {
  await new Promise(resolve => setTimeout(resolve, 300));

  const result: Partial<ProductParseResult> = {};

  // 1. Extract Price ($XX.XX or XX.XX USD)
  const priceMatch = rawText.match(/(?:\$|USD|￥)\s?(\d+(\.\d+)?)/i);
  if (priceMatch) {
      result.price = parseFloat(priceMatch[1]);
  }

  // 2. Extract Dimensions (60x40x30 or 60*40*30)
  // Look for pattern like number x number x number
  const dimMatch = rawText.match(/(\d+(\.\d+)?)\s*[xX\*]\s*(\d+(\.\d+)?)\s*[xX\*]\s*(\d+(\.\d+)?)(cm|mm)?/i);
  if (dimMatch) {
      // Assuming the matched string is the carton size
      result.cartonSize = dimMatch[0]; 
      // If it looks small, maybe product size? But usually this format in trade chat is carton size.
  }

  // 3. Extract Weight (XX kg)
  const weightMatch = rawText.match(/(\d+(\.\d+)?)\s*(kg|KG|Kg)/);
  if (weightMatch) {
      result.grossWeight = parseFloat(weightMatch[1]);
  }

  // 4. Extract Qty per Carton (XX pcs/ctn or XX/箱)
  const qtyMatch = rawText.match(/(\d+)\s*(pcs|ctn|箱|个)/i);
  if (qtyMatch) {
      result.qtyPerCarton = parseInt(qtyMatch[1]);
  }

  // 5. Extract Model (Model: XXX or just vague guess)
  const modelMatch = rawText.match(/(?:Model|型号)[:：]\s*([a-zA-Z0-9\-\s]+)/i);
  if (modelMatch) {
      result.model = modelMatch[1].trim();
  }

  result.description = rawText.substring(0, 100); // Keep first part as description

  return result;
};