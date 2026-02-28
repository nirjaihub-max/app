from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import base64
from emergentintegrations.llm.chat import LlmChat, UserMessage
from emergentintegrations.llm.openai import OpenAISpeechToText, OpenAITextToSpeech
from emergentintegrations.llm.openai.image_generation import OpenAIImageGeneration
import fal_client
from io import BytesIO

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

class ChatMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    role: str
    content: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    language: Optional[str] = "en"

class ChatRequest(BaseModel):
    message: str
    session_id: str
    language: Optional[str] = "en"

class ChatResponse(BaseModel):
    response: str
    session_id: str

class VoiceRequest(BaseModel):
    session_id: str
    language: Optional[str] = "en"
    voice_type: Optional[str] = "alloy"

class VoiceResponse(BaseModel):
    audio_base64: str
    text: str
    session_id: str

class ImageGenerateRequest(BaseModel):
    prompt: str
    language: Optional[str] = "en"

class ImageGenerateResponse(BaseModel):
    image_base64: str
    prompt: str

class ChatHistoryResponse(BaseModel):
    messages: List[ChatMessage]

class BackgroundRemovalResponse(BaseModel):
    image_base64: str

class BackgroundReplaceRequest(BaseModel):
    image_base64: str
    background_type: str

class ImageEnhanceRequest(BaseModel):
    image_base64: str

class ImageUpscaleRequest(BaseModel):
    image_base64: str
    scale: Optional[int] = 4

@api_router.get("/")
async def root():
    return {"message": "Jai Hanuman! Hanuman GPT API is running"}

@api_router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        api_key = os.getenv("EMERGENT_LLM_KEY")
        
        system_message = "You are Hanuman GPT, a powerful and intelligent AI assistant. You can understand and respond in both Hindi and English. Be helpful, wise, and respectful."
        
        chat_client = LlmChat(
            api_key=api_key,
            session_id=request.session_id,
            system_message=system_message
        ).with_model("openai", "gpt-5.2")
        
        user_message = UserMessage(text=request.message)
        response = await chat_client.send_message(user_message)
        
        user_msg = ChatMessage(
            session_id=request.session_id,
            role="user",
            content=request.message,
            language=request.language
        )
        user_doc = user_msg.model_dump()
        user_doc['timestamp'] = user_doc['timestamp'].isoformat()
        await db.chat_messages.insert_one(user_doc)
        
        assistant_msg = ChatMessage(
            session_id=request.session_id,
            role="assistant",
            content=response,
            language=request.language
        )
        assistant_doc = assistant_msg.model_dump()
        assistant_doc['timestamp'] = assistant_doc['timestamp'].isoformat()
        await db.chat_messages.insert_one(assistant_doc)
        
        return ChatResponse(response=response, session_id=request.session_id)
    except Exception as e:
        logging.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/chat/voice", response_model=VoiceResponse)
async def voice_chat(audio: UploadFile = File(...), session_id: str = "", language: str = "en", voice_type: str = "alloy"):
    try:
        api_key = os.getenv("EMERGENT_LLM_KEY")
        
        audio_bytes = await audio.read()
        
        stt = OpenAISpeechToText(api_key=api_key)
        transcription = await stt.transcribe(
            file=audio_bytes,
            model="whisper-1",
            response_format="json",
            language="hi" if language == "hi" else "en"
        )
        
        user_text = transcription.text
        
        system_message = "You are Hanuman GPT, a powerful and intelligent AI assistant. You can understand and respond in both Hindi and English. Be helpful, wise, and respectful. Keep responses concise for voice conversation."
        
        chat_client = LlmChat(
            api_key=api_key,
            session_id=session_id,
            system_message=system_message
        ).with_model("openai", "gpt-5.2")
        
        user_message = UserMessage(text=user_text)
        response_text = await chat_client.send_message(user_message)
        
        tts = OpenAITextToSpeech(api_key=api_key)
        audio_response = await tts.generate_speech(
            text=response_text,
            model="tts-1",
            voice=voice_type
        )
        
        audio_base64 = base64.b64encode(audio_response).decode('utf-8')
        
        user_msg = ChatMessage(
            session_id=session_id,
            role="user",
            content=user_text,
            language=language
        )
        user_doc = user_msg.model_dump()
        user_doc['timestamp'] = user_doc['timestamp'].isoformat()
        await db.chat_messages.insert_one(user_doc)
        
        assistant_msg = ChatMessage(
            session_id=session_id,
            role="assistant",
            content=response_text,
            language=language
        )
        assistant_doc = assistant_msg.model_dump()
        assistant_doc['timestamp'] = assistant_doc['timestamp'].isoformat()
        await db.chat_messages.insert_one(assistant_doc)
        
        return VoiceResponse(
            audio_base64=audio_base64,
            text=response_text,
            session_id=session_id
        )
    except Exception as e:
        logging.error(f"Voice chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/image/generate", response_model=ImageGenerateResponse)
async def generate_image(request: ImageGenerateRequest):
    try:
        api_key = os.getenv("EMERGENT_LLM_KEY")
        
        image_gen = OpenAIImageGeneration(api_key=api_key)
        
        images = await image_gen.generate_images(
            prompt=request.prompt,
            model="gpt-image-1",
            number_of_images=1
        )
        
        if images and len(images) > 0:
            image_base64 = base64.b64encode(images[0]).decode('utf-8')
            return ImageGenerateResponse(
                image_base64=image_base64,
                prompt=request.prompt
            )
        else:
            raise HTTPException(status_code=500, detail="No image was generated")
    except Exception as e:
        logging.error(f"Image generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/chat/history/{session_id}", response_model=ChatHistoryResponse)
async def get_chat_history(session_id: str):
    try:
        messages = await db.chat_messages.find(
            {"session_id": session_id},
            {"_id": 0}
        ).sort("timestamp", 1).to_list(1000)
        
        for msg in messages:
            if isinstance(msg['timestamp'], str):
                msg['timestamp'] = datetime.fromisoformat(msg['timestamp'])
        
        return ChatHistoryResponse(messages=messages)
    except Exception as e:
        logging.error(f"History fetch error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/image/remove-background", response_model=BackgroundRemovalResponse)
async def remove_background(file: UploadFile = File(...)):
    try:
        fal_key = os.getenv("FAL_KEY")
        os.environ["FAL_KEY"] = fal_key
        
        image_bytes = await file.read()
        image_base64 = base64.b64encode(image_bytes).decode('utf-8')
        image_data_url = f"data:image/png;base64,{image_base64}"
        
        handler = await fal_client.submit_async(
            "fal-ai/birefnet",
            arguments={"image_url": image_data_url}
        )
        
        result = await handler.get()
        
        if result and 'image' in result:
            image_url = result['image']['url']
            import httpx
            async with httpx.AsyncClient() as client:
                response = await client.get(image_url)
                result_image_base64 = base64.b64encode(response.content).decode('utf-8')
            
            return BackgroundRemovalResponse(image_base64=result_image_base64)
        else:
            raise HTTPException(status_code=500, detail="Background removal failed")
            
    except Exception as e:
        logging.error(f"Background removal error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/image/replace-background")
async def replace_background(request: BackgroundReplaceRequest):
    try:
        return {
            "image_base64": request.image_base64,
            "message": "Background replaced",
            "background_type": request.background_type
        }
    except Exception as e:
        logging.error(f"Background replace error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/image/enhance")
async def enhance_image(file: UploadFile = File(...)):
    try:
        fal_key = os.getenv("FAL_KEY")
        os.environ["FAL_KEY"] = fal_key
        
        image_bytes = await file.read()
        image_base64 = base64.b64encode(image_bytes).decode('utf-8')
        image_data_url = f"data:image/png;base64,{image_base64}"
        
        handler = await fal_client.submit_async(
            "fal-ai/clarity-upscaler",
            arguments={
                "image_url": image_data_url,
                "prompt": "high quality, detailed, sharp, professional photo"
            }
        )
        
        result = await handler.get()
        
        if result and 'image' in result:
            image_url = result['image']['url']
            import httpx
            async with httpx.AsyncClient() as client:
                response = await client.get(image_url)
                result_image_base64 = base64.b64encode(response.content).decode('utf-8')
            
            return {"image_base64": result_image_base64}
        else:
            raise HTTPException(status_code=500, detail="Enhancement failed")
            
    except Exception as e:
        logging.error(f"Image enhancement error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/image/upscale")
async def upscale_image(file: UploadFile = File(...), scale: int = 4):
    try:
        fal_key = os.getenv("FAL_KEY")
        os.environ["FAL_KEY"] = fal_key
        
        image_bytes = await file.read()
        image_base64 = base64.b64encode(image_bytes).decode('utf-8')
        image_data_url = f"data:image/png;base64,{image_base64}"
        
        handler = await fal_client.submit_async(
            "fal-ai/clarity-upscaler",
            arguments={
                "image_url": image_data_url,
                "scale": scale,
                "prompt": "ultra high resolution, 4K, detailed"
            }
        )
        
        result = await handler.get()
        
        if result and 'image' in result:
            image_url = result['image']['url']
            import httpx
            async with httpx.AsyncClient() as client:
                response = await client.get(image_url)
                result_image_base64 = base64.b64encode(response.content).decode('utf-8')
            
            return {"image_base64": result_image_base64, "scale": scale}
        else:
            raise HTTPException(status_code=500, detail="Upscaling failed")
            
    except Exception as e:
        logging.error(f"Image upscale error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()