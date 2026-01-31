from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_ID: str = "your-gcp-project-id"
    LOCATION: str = "europe-west6"
    GEMINI_MODEL_NAME: str = "gemini-1.5-pro-002"
    PROMPT_DIR: str = "app/data/prompts/GEMINI_AGENT.md"

    model_config = SettingsConfigDict(env_file=".env", env_prefix="AGENT_")

settings = Settings()