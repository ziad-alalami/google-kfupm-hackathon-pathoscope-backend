import os
import json
import vertexai
from vertexai.generative_models import GenerativeModel, Content, Part
from app.agent_integration.settings import settings
from app.agent_integration.client.base_agent import BaseAgent
from typing import Type
from pydantic import BaseModel

class GeminiAgent(BaseAgent):
    def __init__(self):
        try:
            vertexai.init(project=settings.PROJECT_ID, location=settings.LOCATION)
            self.model = GenerativeModel(settings.GEMINI_MODEL_NAME)
            self.connected = True
            
            # Load System Prompt
            prompt_path = "app/data/prompts/GEMINI_AGENT.md"
            if os.path.exists(prompt_path):
                with open(prompt_path, "r") as f:
                    self.system_prompt = f.read()
            else:
                self.system_prompt = "You are a helpful AI assistant."
                print(f"Warning: Prompt file not found at {prompt_path}")
                
        except Exception as e:
            print(f"Vertex AI Init Failed: {e}")
            self.connected = False

    def _get_manual_schema(self):
        """
        Returns a hardcoded, Google-compatible JSON Schema for LLMOutputStructure.
        We do this manually to avoid Pydantic V2 compatibility issues (AnyOf, $defs, lowercase types).
        """
        return {
            "type": "OBJECT",
            "properties": {
                "action": {
                    "type": "STRING",
                    "enum": ["RESPONSE", "SIMULATE"]
                },
                "response_text": {
                    "type": "STRING"
                },
                "simulation_params": {
                    "type": "OBJECT",
                    "description": "Parameters for the disease simulation. Required only if action is SIMULATE.",
                    "properties": {
                        "simulation_horizon_days": {"type": "INTEGER"},
                        "disease_parameters": {
                            "type": "OBJECT",
                            "properties": {
                                "base_r0": {"type": "NUMBER"},
                                "incubation_period_days": {"type": "NUMBER"},
                                "infectious_period_days": {"type": "NUMBER"},
                                "infection_fatality_rate": {"type": "NUMBER"}
                            },
                            "required": ["base_r0", "incubation_period_days", "infectious_period_days"]
                        },
                        "active_policies": {
                            "type": "ARRAY",
                            "items": {
                                "type": "OBJECT",
                                "properties": {
                                    "policy_type": {
                                        "type": "STRING", 
                                        "enum": ["Mask Mandate", "Lockdown", "School Closure", "Travel Ban", "Remote Work", "None"]
                                    },
                                    "impact_on_r0": {"type": "NUMBER"},
                                    "impact_on_mobility": {"type": "NUMBER"}
                                },
                                "required": ["policy_type"]
                            }
                        }
                    },
                    "required": ["simulation_horizon_days", "disease_parameters"]
                }
            },
            "required": ["action", "response_text"]
        }

    async def generate_response(
        self, 
        chat_history: list, 
        system_context: str, 
        response_schema: Type[BaseModel]
    ) -> BaseModel:
        
        if not self.connected:
            # MOCK RESPONSE
            from app.agent.dtos import LLMOutputStructure, AgentActionEnum
            return LLMOutputStructure(
                action=AgentActionEnum.RESPONSE,
                response_text="Vertex AI is offline. This is a mock response.",
                simulation_params=None
            )

        # 1. Prepare History
        full_history = [
            Content(role="user", parts=[
                Part.from_text(f"SYSTEM INSTRUCTIONS:\n{self.system_prompt}"),
                Part.from_text(f"CURRENT CONTEXT (System State):\n{system_context}")
            ])
        ]

        for msg in chat_history:
            role = "user" if msg.role == "user" else "model"
            full_history.append(Content(role=role, parts=[Part.from_text(msg.content)]))

        # 2. Use the Manual Schema (Bypassing Pydantic generation)
        google_schema = self._get_manual_schema()

        try:
            response = self.model.generate_content(
                full_history,
                generation_config={
                    "response_mime_type": "application/json",
                    "response_schema": google_schema
                }
            )
            
            # 3. Parse and Validate
            # We parse the raw JSON string from Gemini into the Pydantic model
            return response_schema.model_validate_json(response.text)
            
        except Exception as e:
            print(f"LLM Error: {e}")
            # Fallback
            from app.agent.dtos import LLMOutputStructure, AgentActionEnum
            return LLMOutputStructure(
                action=AgentActionEnum.RESPONSE,
                response_text=f"I encountered an error processing that request: {str(e)}",
                simulation_params=None
            )