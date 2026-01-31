# PathoScope - Intelligent Planet Hackathon

**Team:** Binary Bros  
**Event:** Google KFUPM Hackathon

PathoScope is a **Graph-based Metapopulation Epidemiological Simulator** designed to predict the spread of respiratory viruses across Saudi Arabian cities (Riyadh, Jeddah, Eastern Province). 

Unlike traditional dashboards that look backward, PathoScope provides a **forward-looking 30-day forecast**, empowering health officials to test policy interventions (Lockdowns, Mask Mandates) using a **Generative AI "No-Code" Interface**.

---

## Setup
1 - Install deps:
```bash
uv sync
```

2 - Run backend with:
```bash
uv run uvicorn app.main:app --reload
```

If you dont have uv installed, you can check how to install it from [here](https://docs.astral.sh/uv/getting-started/installation/).

I have also attached a postman collection that you can use to see the schemas (check the dtos in the code as well if you want) and integrate it with the frontend.
YOU MIGHT FACE SOME ISSUES WITH AUTH AS I DID
CHECK [THIS](https://docs.cloud.google.com/docs/authentication/set-up-adc-local-dev-environment) AND [THIS](https://docs.cloud.google.com/sdk/docs/install-sdk#rpm) IN CASE YOU DO.
USE THE WEIRD EMAILS AND PASSWORDS PROVIDED BY THE GOOGLE TEAM FOR THE AUTH NOT YOUR PERSONAL ONE.

---

##  Key Innovations

### 1. Natural Language Simulation (GenAI Agent)
We democratize data science by integrating **Google Vertex AI (Gemini 1.5 Pro)** directly into the simulation loop.  
* **The Problem:** Health officials aren't Python coders.
* **The Solution:** A Minister can ask: *"What happens to infection rates in Al Olaya if we impose a lockdown tomorrow?"* The Agent parses this query, maps it to mathematical parameters (reducing $R_0$ and Mobility coefficients), runs the engine, and returns a structured forecast.

### 2. Graph-Based Metapopulation Engine
Instead of computationally expensive Agent-Based Models (ABMs) or overly simple aggregate ODEs, we use a **Graph Network approach**:
* **Nodes:** Districts/Microzones (e.g., Al Malaz, Dhahran) holding state ($S, E, I, R, D$).
* **Edges:** Mobility weights ($w_{ij}$) representing population flow between districts.
* **Math:** Deterministic SEIR dynamics with stochastic seeding, allowing for real-time "War Room" scenarios that run in seconds.

### 3. Hyper-Local Granularity
The system respects the topology of Saudi cities. An outbreak in **Dammam** doesn't instantly teleport to **Riyadh**; it propagates via specific mobility corridors, allowing for surgical interventions rather than city-wide shutdowns.

---

##  Technical Architecture

The backend is built with **FastAPI** and designed for Serverless deployment on **Google Cloud Run**.

### Core Modules
* **`node/`**: Manages the static graph topology (districts, population, initial infection states).
* **`simulate/`**: The mathematical core. Implements the SEIR equations, handling force of infection ($\lambda$) calculations based on internal prevalence and neighbor spillover.
* **`agent/`**: The intelligence layer. Connects to **Vertex AI** to translate natural language chat history into strict JSON simulation parameters (`SimulateRequest`) using Structured Outputs.

### Technology Stack
* **Language:** Python 3.12+
* **Framework:** FastAPI
* **AI/LLM:** Google Vertex AI (Gemini 1.5 Pro)
* **Data Validation:** Pydantic V2
* **Package Manager:** uv

---

##  API Reference

### 1. Agent (`/agent`)
The main entry point for the frontend.
* `POST /`: Sends chat history to Gemini. The agent decides whether to reply with text or trigger a simulation.
    * **Action `RESPONSE`**: Returns general advice or answers.
    * **Action `SIMULATE`**: Automatically configures and runs the SEIR engine based on the conversation context.

### 2. Simulation (`/simulate`)
The deterministic engine.
* `POST /`: Accepts explicit mathematical parameters ($R_0$, incubation period, policy multipliers) and returns day-by-day infection curves for every node in the graph.

### 3. Node Management (`/node`)
* `GET /all`: Returns the current state of all city districts (S, E, I, R counts).
* `POST /`: (Admin) Adds new districts dynamically to the graph.

---

## Disease Model Parameters

The engine creates a digital twin of the city using the following tunable parameters:
* **$R_0$ (Basic Reproduction Number):** Baseline transmissibility.
* **$L$ (Incubation Period):** Time from Exposure ($E$) to Infectious ($I$).
* **$D$ (Infectious Period):** Duration an individual spreads the virus.
* **$m_i$ (Mobility Coefficient):** The tendency of a node's population to interact with neighbors.
* **IFR (Infection Fatality Rate):** Probability of disease-induced mortality.
