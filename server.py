from fastapi import FastAPI
from fastapi.responses import FileResponse
import subprocess
import os

app = FastAPI()

@app.get("/")
def home():
    return {
        "message": "AI Reel Generator API Running"
    }

@app.get("/generate")
def generate_reel(topic: str):

    # SAVE TOPIC
    with open("topic.txt", "w", encoding="utf-8") as f:
        f.write(topic)

    # RUN AI PIPELINE
    subprocess.run(["python", "create_reel.py"])

    video_path = "output/final_reel.mp4"

    # CHECK OUTPUT
    if os.path.exists(video_path):
        return FileResponse(
            video_path,
            media_type="video/mp4",
            filename="final_reel.mp4"
        )

    return {
        "error": "Video generation failed"
    }