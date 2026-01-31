from abc import ABC, abstractmethod

class BaseAgent(ABC):
    @abstractmethod
    async def generate_response(self, prompt: str, context: dict) -> str:
        pass