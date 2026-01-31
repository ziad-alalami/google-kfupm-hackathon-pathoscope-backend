import numpy as np
import copy
from typing import List, Dict
from app.helper.graph_helper.graph import Graph
from app.simulate.dtos import SimulateRequest, PolicyDefinition

class SimulationEngine:
    def __init__(self, graph: Graph):
        self.graph = graph

    def _apply_policies(self, base_r0, base_mobility_coeff, policies: List[PolicyDefinition]):
        """
        Aggregates policy multipliers.
        """
        r0_multiplier = 1.0
        mobility_multiplier = 1.0
        
        for p in policies:
            r0_multiplier *= p.impact_on_r0
            mobility_multiplier *= p.impact_on_mobility
            
        return base_r0 * r0_multiplier, base_mobility_coeff * mobility_multiplier

    def run(self, request: SimulateRequest) -> List[dict]:
        # Deep copy graph nodes to avoid mutating the actual city state permanently
        # In a real app, we might want to start from the current actual state
        sim_nodes = {nid: copy.deepcopy(node) for nid, node in self.graph.nodes.items()}
        weights = self.graph.weights
        
        results = []
        
        L = request.disease_parameters.incubation_period_days
        D = request.disease_parameters.infectious_period_days
        IFR = request.disease_parameters.infection_fatality_rate
        
        # Pre-calculate modified parameters based on policies
        # Note: We assume policies are constant for the whole 30 days for this hackathon MVP
        # Can be made dynamic later
        effective_R0, mobility_mult = self._apply_policies(
            request.disease_parameters.base_r0, 
            1.0, # Base mobility multiplier
            request.active_policies
        )

        steps = request.simulation_horizon_days
        
        for t in range(steps):
            daily_snapshot = {}
            total_I_city = 0
            
            # 1. Calculate Force of Infection (Lambda) for all nodes first
            lambdas = {}
            
            for i, node in sim_nodes.items():
                N_i = node.population
                I_i = node.state["I"]
                
                # Apply mobility policy to m_i
                m_i = node.mobility_coefficient * mobility_mult
                
                # Calculate Spillovers: Sum(w_ij * I_j / N_j)
                spillover_term = 0
                if i in weights:
                    for j, w_ij in weights[i].items():
                        neighbor = sim_nodes[j]
                        spillover_term += w_ij * (neighbor.state["I"] / neighbor.population)
                
                # [cite_start]Equation [cite: 1]
                # Lambda_i = (R0 / D) * [ (1-m_i)*(I_i/N_i) + m_i * spillover_term ]
                term_internal = (1 - m_i) * (I_i / N_i)
                term_external = m_i * spillover_term
                
                lambda_i = (effective_R0 / D) * (term_internal + term_external)
                lambdas[i] = lambda_i

            # 2. Update States
            for i, node in sim_nodes.items():
                S = node.state["S"]
                E = node.state["E"]
                I = node.state["I"]
                R = node.state["R"]
                Dead = node.state["D"]
                
                # Transitions
                # [cite_start]S -> E (Binomial) [cite: 1]
                # Prob of infection = 1 - exp(-lambda)
                prob_inf = 1 - np.exp(-lambdas[i])
                # Clamp prob to 0-1
                prob_inf = max(0.0, min(1.0, prob_inf))
                
                new_exposed = np.random.binomial(int(S), prob_inf)
                
                # [cite_start]E -> I (Rate based: E/L) [cite: 1]
                new_infectious = E / L if L > 0 else E
                
                # [cite_start]I -> R or D (Rate based: I/D) [cite: 1]
                leaving_infectious = I / D if D > 0 else I
                
                new_recovered = leaving_infectious * (1 - IFR)
                new_dead = leaving_infectious * IFR
                
                # Apply deltas
                node.state["S"] = max(0, S - new_exposed)
                node.state["E"] = max(0, E + new_exposed - new_infectious)
                node.state["I"] = max(0, I + new_infectious - leaving_infectious)
                node.state["R"] = R + new_recovered
                node.state["D"] = Dead + new_dead
                
                daily_snapshot[node.name] = node.state.copy()
                total_I_city += node.state["I"]

            results.append({
                "day": t + 1,
                "nodes_state": daily_snapshot,
                "total_infected": int(total_I_city)
            })
            
        return results