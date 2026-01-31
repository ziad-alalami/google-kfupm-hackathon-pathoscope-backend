from pydantic import BaseModel, Field
from enum import StrEnum
from typing import List, Optional

class RegionEnum(StrEnum):
    RIYADH = "Riyadh"
    JEDDAH = "Jeddah"
    EASTERN_PROVINCE = "Eastern Province"

class CreateNodeRequest(BaseModel):
    name: str
    region: RegionEnum
    lat: float = Field(..., ge=-90, le=90)
    lon: float = Field(..., ge=-180, le=180)
    population: int = Field(..., gt=0)
    mobility_coefficient: float = Field(0.1, ge=0, le=1, description="m_i: Tendency of node to interact with others")
    initial_infected: int = 0

class NodeResponse(BaseModel):
    node_id: str
    name: str
    region: str
    lat: float
    lon: float
    population: int
    mobility_coefficient: float
    current_state: dict # S, E, I, R, D