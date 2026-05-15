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

        # ---------- CLEAN OLD FILES ----------

        if os.path.exists("topic.txt"):
            os.remove("topic.txt")

        if os.path.exists("assets"):

            for file in os.listdir("assets"):

                try:
                    os.remove(
                        os.path.join("assets", file)
                    )
                except:
                    pass

        if os.path.exists("output"):

            for file in os.listdir("output"):

                try:
                    os.remove(
                        os.path.join("output", file)
                    )
                except:
                    pass

        # ---------- SAVE TOPIC ----------

        with open(
            "topic.txt",
            "w",
            encoding="utf-8"
        ) as f:

            f.write(topic)

        # ---------- DEBUG ----------

        st.success(
            f"Current topic: {topic}"
        )

        # ---------- PROGRESS ----------

        progress = st.progress(0)

        status = st.empty()

        # ---------- VOICE ----------

        status.text(
            "🎤 Generating AI voice..."
        )

        progress.progress(20)

        subprocess.run(
            ["python", "voice_generator.py"]
        )

        time.sleep(1)

        # ---------- CLIPS ----------

        status.text(
            "🎬 Downloading cinematic clips..."
        )

        progress.progress(50)

        subprocess.run(
            ["python", "clip_downloader.py"]
        )

        time.sleep(1)

        # ---------- VIDEO ----------

        status.text(
            "🎞️ Rendering cinematic reel..."
        )

        progress.progress(80)

        subprocess.run(
            ["python", "video_editor.py"]
        )

        progress.progress(100)

        status.text(
            "✅ Reel generated successfully!"
        )

        # ---------- FIND LATEST VIDEO ----------

        videos = [
            os.path.join("output", f)
            for f in os.listdir("output")
            if f.endswith(".mp4")
        ]

        if len(videos) == 0:

            st.error(
                "Video generation failed."
            )

        else:

            videos.sort(
                key=os.path.getmtime,
                reverse=True
            )

            video_path = videos[0]

            # ---------- SHOW VIDEO ----------

            st.video(video_path)

            # ---------- DOWNLOAD ----------

            with open(video_path, "rb") as file:

                st.download_button(
                    label="⬇️ Download Reel",
                    data=file,
                    file_name=os.path.basename(
                        video_path
                    ),
                    mime="video/mp4"
                )