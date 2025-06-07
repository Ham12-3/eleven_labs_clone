from contextlib import asynccontextmanager

from pydantic import BaseModel
from libri_inference import StyleTTS2Inference
from fastapi import FastAPI

import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)  # Get the actual logger

# Global variables 
synthesizer = None
reference_style = None

@asynccontextmanager
async def lifespan(app:FastAPI): 
    global synthesizer, reference_style
    logger.info("loading StyleTTS2 model...")
    
    try:
        synthesizer = StyleTTS2Inference(
            config_path=os.getenv("CONFIG_PATH", "Models/LibriTTS/config.yml"),
            model_path=os.getenv("MODEL_PATH", "Models/LibriTTS/epochs_2nd_00020.pth"),
        )
        
        logger.info("StyleTTS2 model loaded successfully...")
        
    except Exception as e:
        logger.error(f"Failed to load StyleTTS2 model: {e}")
        raise 
    
    yield
    
    logger.info("Shutting down StyleTTS2 API...")

app = FastAPI(title="StyleTTS2 API", lifespan=lifespan)

TARGET_VOICES = {
    "3" : "reference_audio/reference_audio/3.wav",
    "amused": "reference_audio/reference_audio/amused.wav",
    "sleepy": "reference_audio/reference_audio/sleepy.wav",
}

class TextOnlyRequest(BaseModel):
    text: str
    target_voice:str
    

@app.get("/generate")
async def generate_speech(request):
    pass

@app.get("/voices")

async def list_voices():
    return {"voices": list(TARGET_VOICES.keys())}

@app.get("/health")
async def health_check():
    if synthesizer:
        return {"status": "healthy", "model": "loaded"}
    return {"status": "unhealthy", "model": "not loaded"}
