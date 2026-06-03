from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import subprocess
import uuid
import os
import shutil

app = FastAPI()

# ---------- CORS ----------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- ROOT ----------

@app.get("/")
def home():

    return {
        "status": "running",
        "message": "AI Reel Generator API"
    }

# ---------- GENERATE ----------

@app.get("/generate")
def generate_reel(topic: str):

    try:

        # ---------- UNIQUE ID ----------

        reel_id = str(uuid.uuid4())[:8]

        print(f"\n🔥 Generating reel for: {topic}")

        # ---------- SAVE TOPIC ----------

        with open(
            "topic.txt",
            "w",
            encoding="utf-8"
        ) as f:

            f.write(topic)

        # ---------- RUN PIPELINE ----------

        result = subprocess.run(
            ["py", "-3.14", "create_reel.py"],
            capture_output=True,
            text=True
        )

        print(result.stdout)
        print(result.stderr)

        # ---------- FIND OUTPUT ----------

        output_folder = "output"

        files = [

            os.path.join(output_folder, f)

            for f in os.listdir(output_folder)

            if f.endswith(".mp4")

        ]

        if len(files) == 0:

            return {
                "error": "No video generated"
            }

        latest_video = max(
            files,
            key=os.path.getctime
        )

        # ---------- UNIQUE OUTPUT ----------

        final_output = (
            f"output/{topic}_{reel_id}.mp4"
        )

        shutil.copy(
            latest_video,
            final_output
        )

        print(f"✅ Saved: {final_output}")

        # ---------- RETURN VIDEO ----------

        return FileResponse(
            final_output,
            media_type="video/mp4",
            filename=f"{topic}.mp4"
        )

    except Exception as e:

        return {
            "error": str(e)
        }