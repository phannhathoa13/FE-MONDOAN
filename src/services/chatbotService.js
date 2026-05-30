import { API_BASE_URL } from "../constants";

export const askAiChatbot = async (message, history = []) => {
  const response = await fetch(`${API_BASE_URL}/chatbot`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      history,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to ask chatbot");
  }

  const data = await response.json();
  return {
    reply: data.reply || "Xin lỗi, hiện tại tôi chưa thể trả lời...",
    suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
  };
};
