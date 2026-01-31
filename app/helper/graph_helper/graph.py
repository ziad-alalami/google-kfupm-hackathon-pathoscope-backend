import math
from typing import Dict, List
from .node import GraphNode

class Graph:
    def __init__(self):
        self.nodes: Dict[str, GraphNode] = {}
        # Precomputed distance weights w_ij
        self.weights: Dict[str, Dict[str, float]] = {}

    def add_node(self, node: GraphNode):
        self.nodes[node.id] = node
        self._recalculate_weights()

    def remove_node(self, node_id: str):
        if node_id in self.nodes:
            del self.nodes[node_id]
            self._recalculate_weights()
            return True
        return False

    def get_node(self, node_id: str) -> GraphNode:
        return self.nodes.get(node_id)

    def get_all_nodes(self) -> List[GraphNode]:
        return list(self.nodes.values())

    def _haversine_distance(self, lat1, lon1, lat2, lon2):
        R = 6371  # Earth radius in km
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c

    def _recalculate_weights(self):
        """
        Calculates w_ij based on inverse square distance.
        w_ij = (1 / d_ij^2) / Sum(1/d_ik^2)
        """
        node_ids = list(self.nodes.keys())
        self.weights = {nid: {} for nid in node_ids}

        for i in node_ids:
            total_weight = 0
            temp_weights = {}
            for j in node_ids:
                if i == j:
                    continue
                
                n_i = self.nodes[i]
                n_j = self.nodes[j]
                dist = self._haversine_distance(n_i.lat, n_i.lon, n_j.lat, n_j.lon)
                
                # Avoid division by zero, min distance 0.1km
                dist = max(dist, 0.1)
                
                # Gravity model: Weight proportional to inverse distance squared
                w = 1.0 / (dist ** 2)
                temp_weights[j] = w
                total_weight += w
            
            # Normalize so sum(w_ij) = 1 for each node i
            if total_weight > 0:
                for j, w in temp_weights.items():
                    self.weights[i][j] = w / total_weight