
@app.post("/consultation/log")
async def log_chat(data: ChatLogModel):
    log_dir = "logs/chat_sessions"
    os.makedirs(log_dir, exist_ok=True)
    
    filename = f"{log_dir}/{data.session_id}_{data.astrologer_id}.json"
    
    with open(filename, "w") as f:
        json.dump(data.dict(), f, indent=4)
        
    return {"status": "success", "file": filename}

class ChatQueryModel(BaseModel):
    messages: List[ChatMessage]
    astro_name: str

@app.post("/consultation/chat")
async def chat_with_astro(data: ChatQueryModel):
    from services.ai_service import AIService
    ai = AIService()
    response = await ai.get_consultation_response(data.messages, data.astro_name)
    return {"text": response}
