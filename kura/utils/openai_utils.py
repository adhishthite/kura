import os
from openai import AsyncOpenAI, AsyncAzureOpenAI
import instructor


def _truthy(val: str | None) -> bool:
    if val is None:
        return False
    return val.lower() in {"1", "true", "yes"}


def use_azure_openai() -> bool:
    if _truthy(os.getenv("USE_AZURE_OPENAI")):
        return True
    required = [
        "AZURE_OPENAI_API_BASE",
        "AZURE_OPENAI_API_KEY",
        "AZURE_OPENAI_API_VERSION",
    ]
    return all(os.getenv(k) for k in required)


def create_openai_client() -> AsyncOpenAI:
    if use_azure_openai():
        return AsyncAzureOpenAI(
            azure_endpoint=os.environ.get("AZURE_OPENAI_API_BASE"),
            api_key=os.environ.get("AZURE_OPENAI_API_KEY"),
            api_version=os.environ.get("AZURE_OPENAI_API_VERSION"),
        )
    return AsyncOpenAI()


def create_instructor_client(model: str):
    if use_azure_openai():
        provider, model_name = model.split("/", 1)
        if provider != "openai":
            return instructor.from_provider(model, async_client=True)
        client = create_openai_client()
        deployment = os.environ.get("AZURE_OPENAI_DEPLOYMENT_NAME", model_name)
        return instructor.from_openai(client, model=deployment)
    return instructor.from_provider(model, async_client=True)
