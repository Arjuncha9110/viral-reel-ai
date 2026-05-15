import streamlit as st
import subprocess
import os
import time

# ---------- PAGE ----------

st.set_page_config(
    page_title="AI Reel Generator",
    page_icon="🎬",
    layout="centered"
)

# ---------- TITLE ----------

st.title("🎬 AI Viral Reel Generator")

st.markdown(
    "Generate cinematic AI reels automatically."
)

# ---------- SIDEBAR ----------

st.sidebar.title("⚙️ Reel Settings")

style = st.sidebar.selectbox(
    "Reel Style",
    [
        "Luxury Travel",
        "Finance",
        "Motivation",
        "Luxury Lifestyle"
    ]
)

# ---------- INPUT ----------

topic = st.text_input(
    "Enter Reel Topic",
    placeholder="Example: Bali"
)

# ---------- BUTTON ----------

if st.button("🚀 Generate Reel"):

    if topic == "":

        st.error("Please enter a topic.")

    else:

        # ---------- SAVE TOPIC ----------

        with open("topic.txt", "w", encoding="utf-8") as f:
            f.write(topic)

        # ---------- PROGRESS ----------

        progress = st.progress(0)

        status = st.empty()

        # ---------- VOICE ----------

        status.text("🎤 Generating AI voice...")
        progress.progress(20)

        subprocess.run(
            ["python", "voice_generator.py"]
        )

        time.sleep(1)

        # ---------- CLIPS ----------

        status.text("🎬 Downloading cinematic clips...")
        progress.progress(50)

        subprocess.run(
            ["python", "clip_downloader.py"]
        )

        time.sleep(1)

        # ---------- VIDEO ----------

        status.text("🎞️ Rendering cinematic reel...")
        progress.progress(80)

        subprocess.run(
            ["python", "video_editor.py"]
        )

        progress.progress(100)

        status.text("✅ Reel generated successfully!")

        # ---------- SHOW VIDEO ----------

        video_path = "output/final_reel.mp4"

        if os.path.exists(video_path):

            st.video(video_path)

            with open(video_path, "rb") as file:

                st.download_button(
                    label="⬇️ Download Reel",
                    data=file,
                    file_name="viral_reel.mp4",
                    mime="video/mp4"
                )

        else:

            st.error("Video generation failed.")