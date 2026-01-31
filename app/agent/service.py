import json
from app.agent_integration.client.gemini_agent import GeminiAgent
from app.agent.dtos import AgentRequest, AgentResponse, AgentActionEnum, LLMOutputStructure
from app.simulate.service import SimulationService
from app.node.service import NodeService

class AgentService:
    def __init__(self):
        self.llm_client = GeminiAgent()
        self.sim_service = SimulationService()
        self.node_service = NodeService()

    async def process_chat(self, req: AgentRequest) -> AgentResponse:
        # Gather Context (Map State)
        # We act as if we are retrieving the current state of the city
        nodes = self.node_service.get_all_nodes()
        node_summary = [
            f"{n.name} ({n.region}): Pop={n.population}, Current Infected={n.state['I']}" 
            for n in nodes
        ]
        
        system_context = f"Current System State (Nodes): {json.dumps(node_summary)}"

        # Call LLM with Structured Output enforcement
        # We pass the schema class (LLMOutputStructure) to the client
        llm_result: LLMOutputStructure = await self.llm_client.generate_response(
            chat_history=req.chat_history,
            system_context=system_context,
            response_schema=LLMOutputStructure
        )

        # Construct the response
        final_response = AgentResponse(
            action=llm_result.action,
            response=llm_result.response_text,
            simulation_result=None
        )

        # If the agent decided to simulate, run the engine
        if llm_result.action == AgentActionEnum.SIMULATE:
            if llm_result.simulation_params:
                # The LLM has already filled the SimulateRequest DTO for us!
                # We just pass it to the engine.
                sim_data = self.sim_service.run_simulation(llm_result.simulation_params)
                final_response.simulation_result = sim_data
            else:
                # Fallback if LLM hallucinated the params away
                final_response.response += " (Error: Simulation requested but parameters were missing.)"
                final_response.action = AgentActionEnum.RESPONSE

        return final_response