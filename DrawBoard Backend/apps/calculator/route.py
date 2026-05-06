import logging
import base64
from io import BytesIO
from fastapi import APIRouter, HTTPException
from apps.calculator.utils import analyze_image
from schema import ImageData
from PIL import Image

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("")
def calculate(request: ImageData):
    try:
        image_data = base64.b64decode(request.image.split(",")[1])
        image = Image.open(BytesIO(image_data))
    except Exception as e:
        logger.error("Failed to decode image: %s", e)
        raise HTTPException(status_code=400, detail="Invalid image data") from e

    try:
        results = analyze_image(image, dict_of_vars=request.dict_of_vars)
    except ValueError as e:
        logger.error("Analysis failed: %s", e)
        raise HTTPException(status_code=422, detail=str(e)) from e

    logger.info("Returning %d results", len(results))
    return {"message": "Image processed", "data": results, "status": "success"}
