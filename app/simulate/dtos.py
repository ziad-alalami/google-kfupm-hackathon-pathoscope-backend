from pydantic import BaseModel, Field
from enum import StrEnum
from typing import List, Optional

class PolicyTypeEnum(StrEnum):
    MASK_MANDATE = "Mask Mandate"
    LOCKDOWN = "Lockdown"
    SCHOOL_CLOSURE = "School Closure"
    TRAVEL_BAN = "Travel Ban"
    REMOTE_WORK = "Remote Work"
    NO_POLICY = "None"

class PolicyDefinition(BaseModel):
    policy_type: PolicyTypeEnum
    impact_on_r0: float = Field(1.0, description="Multiplier for R0 (e.g., 0.8 reduces R0 by 20%)")
    impact_on_mobility: float = Field(1.0, description="Multiplier for m_i (e.g., 0.1 is strict lockdown)")

class DiseaseParameters(BaseModel):
    base_r0: float = Field(..., description="Basic Reproduction Number")
    incubation_period_days: float = Field(..., description="L parameter")
    infectious_period_days: float = Field(..., description="D parameter")
    infection_fatality_rate: float = Field(0.01, description="Probability of death given infection")

class SimulateRequest(BaseModel):
    simulation_horizon_days: int = 30
    disease_parameters: DiseaseParameters
    active_policies: List[PolicyDefinition] = []

class SimulationResult(BaseModel):
    day: int
    nodes_state: dict  # {node_id: {S, E, I, R, D}}
    total_infected: int