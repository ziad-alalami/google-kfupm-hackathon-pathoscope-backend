from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.node.router import router as node_router
from app.simulate.router import router as sim_router
from app.agent.router import router as agent_router

app = FastAPI(title="Binary Bros Hackathon API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(node_router)
app.include_router(sim_router)
app.include_router(agent_router)

@app.get("/")
def health_check():
    return {"status": "ok", "team": "Binary Bros"}

# uvicorn app.main:app --reload RUN THIS COMMAND TO RUN THE BACKEND SERVER  