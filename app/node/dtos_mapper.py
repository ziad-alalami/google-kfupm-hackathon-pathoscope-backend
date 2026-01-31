from app.node.dtos import NodeResponse
from app.helper.graph_helper.node import GraphNode

def map_node_to_response(node: GraphNode) -> NodeResponse:
    """
    Maps the internal GraphNode object to the public NodeResponse DTO.
    Handles dynamic attributes (name, region) that might not exist on raw nodes.
    """
    return NodeResponse(
        node_id=node.id,
        # specific logic: use getattr defaults in case a node was created without metadata
        name=getattr(node, "name", "Unknown Node"),
        region=getattr(node, "region", "Unknown Region"),
        lat=node.lat,
        lon=node.lon,
        population=node.population,
        mobility_coefficient=node.mobility_coefficient,
        current_state=node.state
    )