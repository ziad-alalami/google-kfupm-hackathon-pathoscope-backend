from app.node.service import city_graph
from app.simulate.engine import SimulationEngine
from app.simulate.dtos import SimulateRequest

class SimulationService:
    def __init__(self):
        self.engine = SimulationEngine(city_graph)

    def run_simulation(self, req: SimulateRequest):
        return self.engine.run(req)