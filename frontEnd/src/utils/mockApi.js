// Mock API 服务 - 模拟 Coze Studio 后端接口

import { v4 as uuidv4 } from 'uuid'

// 模拟延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Mock 智能体列表
export const getAgents = async () => {
  await delay(300)
  return [
    {
      id: 'agent_001',
      name: '英语聊天',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=english',
      description: '一个友好的英语学习助手',
      model: 'Doubao-pro-32k'
    },
    {
      id: 'agent_002', 
      name: '代码助手',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=code',
      description: '专业的编程助手',
      model: 'GPT-4'
    }
  ]
}

// Mock 发送消息 - 支持流式输出
export const sendMessage = async (params, onStream) => {
  const { message, sessionId, agentId } = params

  // 模拟网络延迟
  await delay(500)

  // 生成消息ID
  const messageId = uuidv4()

  // 根据用户输入生成不同的回复
  const responses = generateResponse(message)

  // 模拟流式输出
  let fullContent = ''
  const chunks = responses.content.split('')

  for (let i = 0; i < chunks.length; i++) {
    await delay(30 + Math.random() * 50) // 随机打字延迟
    fullContent += chunks[i]

    if (onStream) {
      onStream({
        type: 'delta',
        data: {
          messageId,
          content: fullContent,
          isComplete: i === chunks.length - 1
        }
      })
    }
  }

  // 返回完整消息
  return {
    messageId,
    content: fullContent,
    usage: {
      prompt_tokens: Math.floor(message.length / 2),
      completion_tokens: fullContent.length,
      total_tokens: Math.floor(message.length / 2) + fullContent.length
    },
    latency: (Math.random() * 3 + 2).toFixed(1),
    plugins: responses.plugins || [],
    knowledge: responses.knowledge || null
  }
}

// 生成智能回复
function generateResponse(message) {
  const lowerMsg = message.toLowerCase()

  // 代码相关
  if (lowerMsg.includes('code') || lowerMsg.includes('python') || lowerMsg.includes('javascript')) {
    return {
      content: `当然！我可以帮你写代码。以下是一个 Python 示例：\n\n\`\`\`python\ndef fibonacci(n):\n    if n <= 1:\n        return n\n    else:\n        return fibonacci(n-1) + fibonacci(n-2)\n\n# 打印前10个斐波那契数\nfor i in range(10):\n    print(f\"F({i}) = {fibonacci(i)}\")\n\`\`\`\n\n这个代码使用了递归算法来计算斐波那契数列。你可以根据需要修改参数。`,
      plugins: ['code-interpreter']
    }
  }

  // 知识库相关
  if (lowerMsg.includes('知识') || lowerMsg.includes('knowledge') || lowerMsg.includes('什么是')) {
    return {
      content: `根据我的知识库，这是一个关于该主题的详细解释：\n\n## 核心概念\n\n这是一个重要的概念，在多个领域都有应用。主要特点包括：\n\n1. **高效性** - 能够快速处理大量数据\n2. **可扩展性** - 支持水平扩展\n3. **易用性** - 提供简单的 API 接口\n\n> 引用自：技术文档 v2.0\n\n如果你需要更详细的信息，我可以进一步查询。`,
      knowledge: {
        source: '技术文档库',
        confidence: 0.95
      }
    }
  }

  // 工作流相关
  if (lowerMsg.includes('workflow') || lowerMsg.includes('工作流') || lowerMsg.includes('流程')) {
    return {
      content: `我正在调用工作流来处理你的请求...\n\n✅ **工作流执行成功**\n\n**执行步骤：**\n1. 参数验证 - 通过\n2. 数据查询 - 完成 (耗时 0.8s)\n3. 结果处理 - 完成\n\n**输出结果：**\n- 处理记录数：150 条\n- 成功率：98.5%\n- 总耗时：2.3s`,
      plugins: ['workflow-engine']
    }
  }

  // 默认回复
  return {
    content: `Hello! It's great to see you. How can I help with your English today?\n\nI can assist you with:\n- Grammar corrections\n- Vocabulary expansion\n- Conversation practice\n- Writing improvements\n\nFeel free to ask me anything!`,
    plugins: []
  }
}

// Mock 重新生成消息
export const regenerateMessage = async (messageId, onStream) => {
  await delay(800)

  const newContent = `这是重新生成的回复（版本2）：\n\n我可以从不同的角度来回答你的问题。\n\n**替代方案：**\n\n1. 使用在线资源学习\n2. 参加语言交换活动\n3. 观看英文影视作品\n4. 阅读英文原版书籍\n\n每种方法都有其优势，建议结合使用以获得最佳效果。`

  let fullContent = ''
  const chunks = newContent.split('')

  for (let i = 0; i < chunks.length; i++) {
    await delay(20 + Math.random() * 30)
    fullContent += chunks[i]

    if (onStream) {
      onStream({
        type: 'delta',
        data: {
          messageId: uuidv4(),
          content: fullContent,
          isComplete: i === chunks.length - 1
        }
      })
    }
  }

  return {
    messageId: uuidv4(),
    content: fullContent,
    usage: {
      prompt_tokens: 50,
      completion_tokens: fullContent.length,
      total_tokens: 50 + fullContent.length
    },
    latency: (Math.random() * 2 + 1).toFixed(1)
  }
}

// Mock 获取会话历史
export const getChatHistory = async (sessionId) => {
  await delay(400)
  return {
    sessionId,
    messages: [
      {
        id: 'msg_001',
        role: 'assistant',
        content: 'Hi, I\'m Lucas. How\'s your day going?',
        timestamp: Date.now() - 3600000
      },
      {
        id: 'msg_002',
        role: 'user',
        content: 'hello',
        timestamp: Date.now() - 3500000
      },
      {
        id: 'msg_003',
        role: 'assistant',
        content: 'Hello! It\'s great to see you. How can I help with your English today?',
        timestamp: Date.now() - 3400000
      }
    ]
  }
}

// Mock 上传文件
export const uploadFile = async (file, onProgress) => {
  await delay(1000)

  // 模拟进度
  for (let i = 0; i <= 100; i += 20) {
    await delay(200)
    if (onProgress) {
      onProgress(i)
    }
  }

  return {
    fileId: uuidv4(),
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    url: URL.createObjectURL(file)
  }
}

// Mock 插件列表
export const getPlugins = async () => {
  await delay(300)
  return [
    { id: 'plugin_001', name: '网页搜索', icon: '🔍', description: '搜索互联网信息' },
    { id: 'plugin_002', name: '代码执行', icon: '💻', description: '执行 Python/JavaScript 代码' },
    { id: 'plugin_003', name: '图像生成', icon: '🎨', description: '根据描述生成图像' },
    { id: 'plugin_004', name: '知识库', icon: '📚', description: '查询知识库内容' }
  ]
}

// Mock 获取建议问题
export const getSuggestedQuestions = async () => {
  await delay(200)
  return [
    'How can I improve my English speaking fluency?',
    'What are the most common grammar mistakes beginners make?',
    'Can you suggest effective ways to expand my vocabulary?'
  ]
}