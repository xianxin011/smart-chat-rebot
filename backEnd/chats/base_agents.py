from langgraph.graph import StateGraph, END, START
from lang_core.messages import HumanMessage, SystemMessage, AIMessage, AnyMessage
from typing import TypedDict, Annotated
from langchain_deepseek import ChatDeepSeek

import Operator

model = ChatDeepSeek(
    model ="deepseek-v4-flash"
)

Class ChatAllState:
    messages: Annotated[Sequence[AnyMessage], Operator.add]

def handle_user_input(state:ChatAllState)->ChatAllState:
    try:
        user_input = input("用户输入(输入 'exit' 退出): ")
        if user_input.lower() == 'exit':
            return END
        return {
            "messages": [HumanMessage(content=user_input)]
        }
    except Exception as e:
        return END
def generate_ai_response(state:ChatAllState)->ChatAllState:
    try:
        recent_history = state.messages[-6:]  # 获取最近的6条消息
        response = model.invoke(recent_history)
        return {
            "messages":[response]
        }
    except Exception as e:
        return {
            "messages": [AIMessage(content="抱歉，我无法生成响应。")]
        }
builder = StateGraph(state_schema=ChatAllState)

builder.add_node("user_input", handle_user_input)
builder.add_node("ai_response", generate_ai_response)

builder.set_entry_point("user_input")
builder.add_edge("user_input", "ai_response")
builder.add_edge("ai_response", END)

conversation = builder.compile()

if __name__ == "__main__":
    system_prompt = f""" 你是一个专业级中文智能助手！"""
    state = ChatAllState(messages=[SystemMessage(content=system_prompt)])
    print("===== 智能对话系统已启动 =====")
    print("输入'exit'可随时结束对话\n")
    while True:
        try:
            result = conversation.invoke(state)
            if result is None or "messages" not in result:
                print("对话已结束。")
                break
            new_messages = result["messages"][-1]
            if isinstance(new_messages, AIMessage):
                print(f"AI: {new_messages.content}")
             elif isinstance(new_messages, HumanMessage):
                print(f"用户: {new_messages.content}")

            if any(isinstance(msg, AIMessage) and msg.content.lower() == 'exit' for msg in result["messages"]):
                print("对话已结束。")
                break
        except Exception as e:
            print(f"发生错误: {e}")
            break


