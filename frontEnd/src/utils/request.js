import api from "@/api/api";

export const getSuggestedQuestions = async () => {
  const res = await api.get("/get-suggest-questions");
  if (res.success) {
    return res.data;
  }
};
