import streamlit as st
import subprocess
import os
import time

# ---------- PAGE CONFIG ----------

st.set_page_config(
    page_title="AI Viral Reel Generator",
    page_icon="🎬",
    layout="wide"
)

# ---------- CUSTOM CSS ----------

st.markdown(
    """
    <style>

    .stApp {
        background-color: #070b14;
        color: white;
    }

    .main-title {
        font-size: 64px;
        font-weight: 800;
        text-align: center;
        color: white;
        margin-bottom: 10px;
    }

    .subtitle {
        text-align: center;
        color: #9ca3af;
        font-size: 20px;
        margin-bottom: 30px;
    }

    .hero-box {
        padding: 50px;
        border-radius: 25px;
        background: linear-gradient(
            135deg,
            #111827,
            #0f172a
        );
        box-shadow: 0 0 40px rgba(0,0,0,0.4);
        margin-bottom: 30px;
    }

    .stButton button {
        width: 100%;
        height: 55px;
        border-radius: 15px;
        border: none;
        background: linear-gradient(
            90deg,
            #7c3aed,
            #06b6d4
        );
        color: white;
        font-size: 18px;
        font-weight: 700;
    }

    .stTextInput input {
        background-color: #111827;
        color: white;
        border-radius: 12px;
        border: 1px solid #333;
    }

    .stSelectbox div {
        background-color: #111827;
        color: white;
    }

    video {
        border-radius: 20px;
        overflow: hidden;
    }

    </style>
    """,
    unsafe_allow_html=True
)

# ---------- HERO SECTION ----------

st.markdown(
    """
    <div class="hero-box">

        <div class="main-title">
        🎬 AI Viral Reel Generator
        </div>

        <div class="subtitle">
        Create cinematic viral reels automatically using AI
        </div>

    </div>
    """,
    unsafe_allow_html=True
)

# ---------- TEMPLATE SECTION ----------

st.markdown("## 🔥 Viral Reel Templates")

col1, col2 = st.columns(2)

with col1:

    if st.button("🔥 Luxury Travel"):
        st.session_state["template"] = "Luxury Travel"

    st.image(
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
        use_container_width=True
    )

with col2:

    if st.button("💸 Finance Motivation"):
        st.session_state["template"] = "Finance"

    st.image(
        "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a",
        use_container_width=True
    )

col3, col4 = st.columns(2)

with col3:

    if st.button("🌌 Dark Cinematic"):
        st.session_state["template"] = "Dark Cinematic"

    st.image(
        "https://images.unsplash.com/photo-1493246507139-91e8fad9978e",
        use_container_width=True
    )

with col4:

    if st.button("❤️ Emotional Storytelling"):
        st.session_state["template"] = "Emotional"

    st.image(
        "https://images.unsplash.com/photo-1517841905240-472988babdf9",
        use_container_width=True
    )

st.markdown("---")

# ---------- MAIN LAYOUT ----------

left, right = st.columns([1, 1.2])

# ---------- LEFT PANEL ----------

with left:

    st.markdown("## 🎯 Reel Settings")

    topic = st.text_input(
        "Enter Reel Topic",
        placeholder="Example: Dubai luxury lifestyle"
    )

    style = st.selectbox(
        "Choose Style",
        [
            "Luxury Travel",
            "Finance",
            "Motivation",
            "Luxury Lifestyle",
            "Dark Cinematic",
            "Emotional Storytelling"
        ]
    )

    duration = st.selectbox(
        "Video Duration",
        [
            "15 sec",
            "30 sec",
            "45 sec",
            "60 sec"
        ]
    )

    platform = st.selectbox(
        "Platform",
        [
            "Instagram Reels",
            "TikTok",
            "YouTube Shorts"
        ]
    )

    # ---------- TEMPLATE AUTO APPLY ----------

    if "template" in st.session_state:

        selected_template = st.session_state["template"]

        st.success(
            f"Selected Template: {selected_template}"
        )

        style = selected_template

    generate = st.button(
        "🚀 Generate Cinematic Reel"
    )

# ---------- RIGHT PANEL ----------

with right:

    st.markdown("## 🎞️ Reel Preview")

    preview_box = st.container()

# ---------- GENERATE ----------

if generate:

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

        result = subprocess.run(
            ["python", "video_editor.py"],
            capture_output=True,
            text=True
        )

        st.text("STDOUT:")
        st.text(result.stdout)

        st.text("STDERR:")
        st.text(result.stderr)

        time.sleep(1)

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

            with preview_box:

                st.video(video_path)

                st.markdown(
                    "### ✅ Reel Ready"
                )

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