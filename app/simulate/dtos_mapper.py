from typing import List, Dict, Any
from app.simulate.dtos import SimulationResult

def map_engine_output_to_dto(engine_output: Dict[str, Any]) -> SimulationResult:
    """
    Converts a single day's raw simulation dictionary into a validated Pydantic model.
    """
    return SimulationResult(
        day=engine_output.get("day"),
        nodes_state=engine_output.get("nodes_state", {}),
        total_infected=engine_output.get("total_infected", 0)
    )

def map_simulation_results(engine_results: List[Dict[str, Any]]) -> List[SimulationResult]:
    """
    Maps a full list of simulation days.
    """
    return [map_engine_output_to_dto(day) for day in engine_results]