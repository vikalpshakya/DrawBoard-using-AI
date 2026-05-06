from pydantic import BaseModel


class ImageData(BaseModel):
    image: str
    dict_of_vars: dict


class AnalysisResult(BaseModel):
    expr: str
    result: str
    assign: bool = False


class CalculateResponse(BaseModel):
    message: str
    data: list[AnalysisResult]
    status: str
