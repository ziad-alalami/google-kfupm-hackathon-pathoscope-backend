from fastapi import APIRouter
from app.simulate.service import SimulationService
from app.simulate.dtos import SimulateRequest, SimulationResult
from app.simulate.dtos_mapper import map_simulation_results

from typing import List

router = APIRouter(prefix="/simulate", tags=["Simulation"])
service = SimulationService()


@router.post("/", response_model=List[SimulationResult])
def run_simulation(req: SimulateRequest):
    raw_results = service.run_simulation(req)
    return map_simulation_results(raw_results)