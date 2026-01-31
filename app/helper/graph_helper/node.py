from typing import Dict, Optional

class GraphNode:
    def __init__(
        self, 
        node_id: str, 
        lat: float, 
        lon: float, 
        population: int, 
        mobility_coefficient: float = 0.1
    ):
        self.id = node_id
        self.lat = lat
        self.lon = lon
        self.population = population
        self.mobility_coefficient = mobility_coefficient # m_i: tendency to leave/interact outside
        
        # State: S, E, I, R, D
        self.state = {
            "S": float(population), 
            "E": 0.0, 
            "I": 0.0, 
            "R": 0.0, 
            "D": 0.0
        }

    def set_state(self, s: float, e: float, i: float, r: float, d: float):
        self.state = {"S": s, "E": e, "I": i, "R": r, "D": d}

    def get_population(self) -> int:
        return self.population