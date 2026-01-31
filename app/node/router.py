from fastapi import APIRouter, HTTPException
from typing import List
from app.node.service import NodeService
from app.node.dtos import CreateNodeRequest, NodeResponse
from app.node.dtos_mapper import map_node_to_response

router = APIRouter(prefix="/node", tags=["Nodes"])
service = NodeService()

@router.post("/", response_model=str)
def create_node(req: CreateNodeRequest):
    return service.create_node(req)

@router.get("/all", response_model=List[NodeResponse])
def get_all_nodes():
    nodes = service.get_all_nodes()
    return [map_node_to_response(n) for n in nodes]

@router.get("/{node_id}", response_model=NodeResponse)
def get_node(node_id: str):
    node = service.get_node(node_id)
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    return map_node_to_response(node)

@router.delete("/{node_id}")
def delete_node(node_id: str):
    success = service.delete_node(node_id)
    if not success:
        raise HTTPException(status_code=404, detail="Node not found")
    return {"success": True, "node_deleted_id": node_id}