from typing import Optional, List, Dict
from app.agent.dtos import AgentResponse, AgentActionEnum

def map_agent_result_to_response(
    action: AgentActionEnum,
    response_text: str,
    simulation_data: Optional[List[Dict]] = None
) -> AgentResponse:
    """
    Constructs the final AgentResponse DTO.
    """
    return AgentResponse(
        action=action,
        response=response_text,
        simulation_result=simulation_data
    )