import json

from . import models
from .Provider import BaseProvider
from .typing import Any, CreateResult, Union, ChatResponse

logging = False


class ChatCompletion:
    @staticmethod
    def __json_response(response: CreateResult) -> ChatResponse:
        return (
            json.loads("".join(response))
            if response != "error"
            else ValueError("Invalid inputs")
        )

    @classmethod
    def create(
        cls,
        model: Union[models.Model, str],
        messages: str,
        provider: Union[type[BaseProvider], None] = None,
        conversation_id: str = "",
        response_id: str = "",
        choice_id: str = "",
        auth: Union[str, None] = None,
        **kwargs: Any,
    ) -> ChatResponse:
        if isinstance(model, str):
            try:
                model = models.ModelUtils.convert[model]
            except KeyError:
                raise Exception(f"The model: {model} does not exist")

        provider = model.best_provider if provider == None else provider

        if not provider.working:
            raise Exception(f"{provider.__name__} is not working")

        if provider.needs_auth and not auth:
            raise Exception(
                f'ValueError: {provider.__name__} requires authentication (use auth="cookie or token or jwt ..." param)'
            )
        if provider.needs_auth:
            kwargs["auth"] = auth

        if logging:
            print(f"Using {provider.__name__} provider")

        result = provider.create_completion(
            model=model.name,
            messages=messages,
            conversation_id=conversation_id,
            response_id=response_id,
            choice_id=choice_id,
            **kwargs,
        )
        return cls.__json_response(result)

    @classmethod
    def get(
        cls,
        model: Union[models.Model, str],
        conversation_id: str,
        rpcids: str = "hNvQHb",
        provider: Union[type[BaseProvider], None] = None,
        auth: Union[str, None] = None,
        **kwargs: Any,
    ) -> ChatResponse:
        if isinstance(model, str):
            try:
                model = models.ModelUtils.convert[model]
            except KeyError:
                raise Exception(f"The model: {model} does not exist")

        provider = model.best_provider if provider == None else provider

        if not provider.working:
            raise Exception(f"{provider.__name__} is not working")

        if provider.needs_auth and not auth:
            raise Exception(
                f'ValueError: {provider.__name__} requires authentication (use auth="cookie or token or jwt ..." param)'
            )
        if provider.needs_auth:
            kwargs["auth"] = auth

        if logging:
            print(f"Using {provider.__name__} provider")

        result = provider.get_completion(model.name, conversation_id, rpcids, **kwargs)
        return cls.__json_response(result)
