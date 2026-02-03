import json
from app.agent_integration.client.gemini_agent import GeminiAgent
from app.agent.dtos import AgentRequest, AgentResponse, AgentActionEnum, LLMOutputStructure
from app.simulate.service import simulation_service
from app.node.service import NodeService

class AgentService:
    def __init__(self):
        self.llm_client = GeminiAgent()
        # Use the shared simulation_service singleton so we see the last run
        self.sim_service = simulation_service
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

        # Attach last simulation context (if any) for the agent
        last_sim = getattr(self.sim_service, "last_simulation", None)
        if last_sim is None:
            system_context += "\nNO SIMULATIONS HAVE BEEN DONE YET. INFORM THE USER TO RUN A SIMULATION FIRST."
        else:
            try:
                horizon = len(last_sim)
                final_total_infected = last_sim[-1].get("total_infected") if last_sim else None
                system_context += (
                    f"\nLast Simulation Summary: horizon_days={horizon}, "
                    f"final_total_infected={final_total_infected}. "
                    f"Full frames JSON: {json.dumps(last_sim)}"
                )
            except Exception:
                # Best-effort only; never crash the agent on summary issues
                system_context += "\n(Warning: Failed to summarise last simulation results, but raw data may still exist.)"

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