from pydantic import BaseModel, Field
from enum import StrEnum
from typing import List, Optional, Dict, Any
from app.simulate.dtos import SimulateRequest, SimulationResult, DiseaseParameters, PolicyDefinition

class AgentActionEnum(StrEnum):
    RESPONSE = "RESPONSE"       # Just talking
    SIMULATE = "SIMULATE"       # Running a simulation

# ---------------------------------------------------------
# 1. Structure for the LLM itself (Structured Output Schema)
# ---------------------------------------------------------
class LLMOutputStructure(BaseModel):
    action: AgentActionEnum = Field(..., description="The action to take. Choose SIMULATE if the user asks for a prediction, forecast, or 'what if' scenario.")
    response_text: str = Field(..., description="The natural language response to show the user. If simulating, explain what parameters you are using.")
    simulation_params: Optional[SimulateRequest] = Field(None, description="The parameters to use for the simulation. Required ONLY if action is SIMULATE.")

# ---------------------------------------------------------
# 2. Structure for the Frontend (API Request/Response)
# ---------------------------------------------------------
class ChatMessage(BaseModel):
    role: str # "user" or "model"
    content: str

class AgentRequest(BaseModel):
    chat_history: List[ChatMessage]
    # Optional: Context overrides if the frontend wants to force specific context
    # But usually, the backend gathers this.

class AgentResponse(BaseModel):
    action: AgentActionEnum
    response: str
    simulation_result: Optional[List[dict]] = None # The actual data points from the engine