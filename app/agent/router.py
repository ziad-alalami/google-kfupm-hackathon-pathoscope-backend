from fastapi import APIRouter, HTTPException
from app.agent.service import AgentService
from app.agent.dtos import AgentRequest, AgentResponse

router = APIRouter(prefix="/agent", tags=["Agent"])
service = AgentService()

@router.post("/", response_model=AgentResponse)
async def chat_with_agent(req: AgentRequest):
    """
    Endpoints that takes chat history, decides whether to just answer 
    or run a simulation, and returns the result.
    """
    return await service.process_chat(req)