from contextlib import asynccontextmanager
from uuid import uuid4

from pydantic import BaseModel
from libri_inference import StyleTTS2Inference
from fastapi import FastAPI, HTTPException

import os
import logging
import re

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


def text_chunker(text,max_chunk_size=125):
    if len(text) <= max_chunk_size:
        return [text]
    
    chunks=[]
    
    current_pos =0
    text_len = len(text)
    
    
    while current_pos < text_len:
        chunk_end = current_pos + max_chunk_size
        
        search_text = text[current_pos:chunk_end]
        
        
        sentence_ends = [m.end() for m in re.finditer(r'[.!?]+', search_text)]
        
        if sentence_ends:
            last_sentence_end = sentence_ends[-1]
            chunks.append(text[current_pos:current_pos+ last_sentence_end])
            
        else:
            last_space = search_text.rfind(' ')
            
            if last_space >0:
                chunks.append(text[current_pos:current_pos + last_space])
                
                current_pos += last_space +1

class TextOnlyRequest(BaseModel):
    text: str
    target_voice:str
    

@app.get("/generate")
async def generate_speech(request: TextOnlyRequest):
    if len(request.text) >5000:
        raise HTTPException(
            
            status_code=400,
            detail="Text length exceeds the maximum limit of 5000 characters."
        )  
        
    if not synthesizer:
        raise HTTPException(
            status_code=500,
            
            detail="Model not loaded"
        )
        
        
    if request.target_voice not in TARGET_VOICES:
        raise HTTPException(
            status_code=400,
            detail="Target voice not supported. Choose from {', '.join(TARGET_VOICES.keys())}."
        )
    
    
    try:
        ref_audio_path = TARGET_VOICES[request.target_voice]
        
        # Compute style for requested voice 
        current_style = synthesizer.compute_style(ref_audio_path)
        logger.info(f"Using voice {request.target_voice} from {ref_audio_path}")
        
        
        # Generate a unique filename
        
        audio_id = str(uuid4())
        output_filename = f"{audio_id}.wav"
        local_path= f"/tmp/{output_filename}"
        
        
        
        # Split text into manageable chunks 
        
        
        
        
    
    
  
        


@app.get("/voices")

async def list_voices():
    return {"voices": list(TARGET_VOICES.keys())}

@app.get("/health")
async def health_check():
    if synthesizer:
        return {"status": "healthy", "model": "loaded"}
    return {"status": "unhealthy", "model": "not loaded"}
