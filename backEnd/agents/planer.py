import operator
from typing import TypedDict,List, Tuple, Annotated

from langgraph.graph import StateGraph
from langchain.agents import create_agent
from langgraph.prebuilt import ToolNode
from langchain_deepseek import ChatDeepSeek

class PlanExecute(TypedDict):
    input:str
    plan: List[str]
    past_steps: Annotated[List[Tuple],operator.add]
    response: str
