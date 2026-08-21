import { ref, computed } from "vue";
import { v4 as uuidv4 } from "uuid";
import { sendMessage, regenerateMessage } from "../utils/mockApi.js";

import { getSuggestedQuestions } from "../utils/request.js";
export function useChat() {
  const messages = ref([]);
  const sessions = ref([]);
  const currentSessionId = ref(null);
  const isLoading = ref(false);
  const streamingMessageId = ref(null);
  const suggestedQuestions = ref([]);

  // 当前会话
  const currentSession = computed(() => {
    return sessions.value.find((s) => s.id === currentSessionId.value);
  });

  // 初始化
  const initChat = async () => {
    // 创建默认会话
    const sessionId = uuidv4();
    sessions.value.push({
      id: sessionId,
      title: "新会话",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    currentSessionId.value = sessionId;

    // 添加欢迎消息
    messages.value.push({
      id: uuidv4(),
      role: "assistant",
      content: "Hi, I'm Lucas. How's your day going?",
      sender: "智能聊天助手",
      avatar: "ai",
      timestamp: Date.now(),
      status: "complete",
      latency: 0.8,
      tokens: 12,
    });

    // 获取建议问题
    suggestedQuestions.value = await getSuggestedQuestions();
  };

  // 发送消息
  const sendChatMessage = async (content, options = {}) => {
    if (!content.trim()) return;

    const { quoteMessage } = options;

    // 添加用户消息
    const userMessageId = uuidv4();
    const userMessage = {
      id: userMessageId,
      role: "user",
      content,
      sender: "onething365",
      avatar: "user",
      timestamp: Date.now(),
      status: "complete",
    };

    // 如果有引用，添加引用信息
    if (quoteMessage) {
      userMessage.quote = {
        id: quoteMessage.id,
        content: quoteMessage.content,
        sender: quoteMessage.sender,
        role: quoteMessage.role,
      };
    }

    messages.value.push(userMessage);

    // 创建AI消息占位
    const aiMessageId = uuidv4();
    streamingMessageId.value = aiMessageId;
    const aiMessage = {
      id: aiMessageId,
      role: "assistant",
      content: "",
      sender: "英语聊天",
      avatar: "ai",
      timestamp: Date.now(),
      status: "streaming",
      latency: 0,
      tokens: 0,
    };
    messages.value.push(aiMessage);

    isLoading.value = true;

    try {
      // 调用API
      const startTime = Date.now();

      // 构建发送内容（包含引用上下文）
      let messageToSend = content;
      console.log(messageToSend);
      if (quoteMessage) {
        messageToSend = `[引用${quoteMessage.sender}的消息: "${quoteMessage.content}"]\n\n${content}`;
      }

      const result = await sendMessage(
        {
          message: messageToSend,
          sessionId: currentSessionId.value,
          agentId: "agent_001",
        },
        (streamData) => {
          // 流式更新
          const msg = messages.value.find((m) => m.id === aiMessageId);
          if (msg) {
            msg.content = streamData.data.content;
            msg.status = streamData.data.isComplete ? "complete" : "streaming";
          }
        }
      );

      // 更新最终消息
      const finalMsg = messages.value.find((m) => m.id === aiMessageId);
      if (finalMsg) {
        finalMsg.content = result.content;
        finalMsg.status = "complete";
        finalMsg.latency = result.latency;
        finalMsg.tokens = result.usage.total_tokens;
        finalMsg.plugins = result.plugins;
        finalMsg.knowledge = result.knowledge;
        finalMsg.messageId = result.messageId;
      }

      // 更新会话
      const session = sessions.value.find(
        (s) => s.id === currentSessionId.value
      );
      if (session) {
        session.updatedAt = Date.now();
        if (session.title === "新会话") {
          session.title =
            content.slice(0, 20) + (content.length > 20 ? "..." : "");
        }
      }
    } catch (error) {
      const errorMsg = messages.value.find((m) => m.id === aiMessageId);
      if (errorMsg) {
        errorMsg.status = "error";
        errorMsg.error = error.message;
      }
    } finally {
      isLoading.value = false;
      streamingMessageId.value = null;
    }
  };

  // 重新生成
  const regenerate = async (messageId) => {
    const msgIndex = messages.value.findIndex((m) => m.id === messageId);
    if (msgIndex === -1) return;

    // 找到对应的用户消息
    let userMsgIndex = msgIndex - 1;
    while (userMsgIndex >= 0 && messages.value[userMsgIndex].role !== "user") {
      userMsgIndex--;
    }

    if (userMsgIndex < 0) return;

    // 标记为重新生成中
    const aiMsg = messages.value[msgIndex];
    aiMsg.status = "regenerating";
    aiMsg.content = "";

    isLoading.value = true;
    streamingMessageId.value = aiMsg.id;

    try {
      await regenerateMessage(messageId, (streamData) => {
        aiMsg.content = streamData.data.content;
        aiMsg.status = streamData.data.isComplete ? "complete" : "streaming";
      });

      aiMsg.status = "complete";
      aiMsg.regenerated = true;
    } catch (error) {
      aiMsg.status = "error";
    } finally {
      isLoading.value = false;
      streamingMessageId.value = null;
    }
  };

  // 删除消息
  const deleteMessage = (messageId) => {
    const index = messages.value.findIndex((m) => m.id === messageId);
    if (index > -1) {
      messages.value.splice(index, 1);
    }
  };

  // 复制消息
  const copyMessage = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
      return true;
    } catch (err) {
      console.error("复制失败:", err);
      return false;
    }
  };

  // 点赞/点踩
  const rateMessage = (messageId, rating) => {
    const msg = messages.value.find((m) => m.id === messageId);
    if (msg) {
      msg.rating = rating;
    }
  };

  // 创建新会话
  const createSession = () => {
    const sessionId = uuidv4();
    sessions.value.push({
      id: sessionId,
      title: "新会话",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    currentSessionId.value = sessionId;
    messages.value = [];

    // 添加欢迎消息
    messages.value.push({
      id: uuidv4(),
      role: "assistant",
      content: "Hi, I'm Lucas. How's your day going?",
      sender: "英语聊天",
      avatar: "ai",
      timestamp: Date.now(),
      status: "complete",
      latency: 0.8,
      tokens: 12,
    });
  };

  // 切换会话
  const switchSession = (sessionId) => {
    currentSessionId.value = sessionId;
    // 这里应该加载会话历史，简化处理
    messages.value = [];
  };

  return {
    messages,
    sessions,
    currentSessionId,
    currentSession,
    isLoading,
    streamingMessageId,
    suggestedQuestions,
    initChat,
    sendChatMessage,
    regenerate,
    deleteMessage,
    copyMessage,
    rateMessage,
    createSession,
    switchSession,
  };
}
