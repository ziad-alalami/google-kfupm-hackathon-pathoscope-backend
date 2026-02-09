from app.node.service import city_graph
from app.simulate.engine import SimulationEngine
from app.simulate.dtos import SimulateRequest


class SimulationService:
    def __init__(self):
        self.engine = SimulationEngine(city_graph)
        # In-memory cache of the last simulation run
        # Hackathon-level only, not persisted storage
        self.last_simulation = None

    def run_simulation(self, req: SimulateRequest):
        results = self.engine.run(req)
        # Cache last run for downstream consumers (e.g., the AI agent)
        self.last_simulation = results
        return results


# Singleton instance so that /simulate and /agent share the same cached state
simulation_service = SimulationService()
