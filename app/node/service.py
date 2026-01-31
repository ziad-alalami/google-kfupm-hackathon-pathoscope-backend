import uuid
import json
import os
from app.helper.graph_helper.graph import Graph
from app.helper.graph_helper.node import GraphNode
from app.node.dtos import CreateNodeRequest

# Global Graph Singleton
# In a real app, this might be stored in a DB, but for Hackathon we keep in memory
city_graph = Graph()
INITIAL_NODES_DIR= path = "app/data/initial_data/initial_nodes.json"
class NodeService:
    def __init__(self):
        # Load initial data if graph is empty
        if not city_graph.nodes or city_graph.nodes == {}:
            self._load_initial_nodes()

    def _load_initial_nodes(self):
        if os.path.exists(path):
            with open(path, "r") as f:
                data = json.load(f)
                for item in data:
                    node = GraphNode(
                        node_id=str(uuid.uuid4()),
                        lat=item["lat"],
                        lon=item["lon"],
                        population=item["population"],
                        mobility_coefficient=item.get("mobility_coefficient", 0.1)
                    )
                    # We store name/region in a metadata dict attached to the object dynamically for now
                    # or extend GraphNode. For simplicity, we just use the ID map in memory or add attr
                    node.name = item["name"]
                    node.region = item["region"]
                    if "initial_infected" in item:
                        node.state["I"] = item["initial_infected"]
                        node.state["S"] -= item["initial_infected"]
                    city_graph.add_node(node)

    def create_node(self, req: CreateNodeRequest) -> str:
        new_id = str(uuid.uuid4())
        node = GraphNode(new_id, req.lat, req.lon, req.population, req.mobility_coefficient)
        node.name = req.name
        node.region = req.region
        
        # Set initial infection
        if req.initial_infected > 0:
            node.state["I"] = req.initial_infected
            node.state["S"] = max(0, req.population - req.initial_infected)
            
        city_graph.add_node(node)
        return new_id

    def get_all_nodes(self):
        return city_graph.get_all_nodes()

    def get_node(self, node_id: str):
        return city_graph.get_node(node_id)

    def delete_node(self, node_id: str):
        return city_graph.remove_node(node_id)