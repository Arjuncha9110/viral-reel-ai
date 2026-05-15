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
        background-color: #050816;
        color: white;
    }

    section[data-testid="stSidebar"] {
        background-color: #0b1120;
    }

    .block-container {
        padding-top: 2rem;
        padding-bottom: 2rem;
    }

    .template-card {
        background: #111827;
        border-radius: 20px;
        padding: 15px;
        margin-bottom: 20px;
        border: 1px solid #1f2937;
        transition: 0.3s;
    }

    .template-card:hover {
        transform: scale(1.02);
        border: 1px solid #7c3aed;
    }

    .section-title {
        font-size: 34px;
        font-weight: 700;
        color: white;
        margin-bottom: 20px;
    }

    .sub-title {
        color: #9ca3af;
        margin-bottom: 30px;
    }

    .stButton button {
        width: 100%;
        height: 52px;
        border-radius: 14px;
        border: none;
        background: linear-gradient(
            90deg,
            #7c3aed,
            #06b6d4
        );
        color: white;
        font-size: 17px;
        font-weight: 700;
    }

    .stTextInput input {
        background-color: #111827;
        color: white;
        border-radius: 12px;
        border: 1px solid #374151;
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
    <div style="
        padding:60px;
        border-radius:25px;
        background:linear-gradient(
            135deg,
            #111827,
            #0f172a
        );
        text-align:center;
        margin-bottom:40px;
    ">

        <h1 style="
            color:white;
            font-size:64px;
            font-weight:800;
            margin-bottom:10px;
        ">
        🎬 AI Viral Reel Generator
        </h1>

        <p style="
            color:#9ca3af;
            font-size:22px;
        ">
        Create cinematic viral reels automatically using AI
        </p>

    </div>
    """,
    unsafe_allow_html=True
)

# ---------- TEMPLATE SECTION ----------

st.markdown(
    "<div class='section-title'>🔥 Viral Reel Templates</div>",
    unsafe_allow_html=True
)

col1, col2 = st.columns(2)

with col1:

    st.markdown("<div class='template-card'>", unsafe_allow_html=True)

    st.image(
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
        use_container_width=True
    )

    if st.button(
        "🔥 Luxury Travel",
        key="luxury"
    ):
        st.session_state["template"] = "Luxury Travel"

    st.markdown("</div>", unsafe_allow_html=True)

with col2:

    st.markdown("<div class='template-card'>", unsafe_allow_html=True)

    st.image(
        "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a",
        use_container_width=True
    )

    if st.button(
        "💸 Finance Motivation",
        key="finance"
    ):
        st.session_state["template"] = "Finance"

    st.markdown("</div>", unsafe_allow_html=True)

col3, col4 = st.columns(2)

with col3:

    st.markdown("<div class='template-card'>", unsafe_allow_html=True)

    st.image(
        "https://images.unsplash.com/photo-1493246507139-91e8fad9978e",
        use_container_width=True
    )

    if st.button(
        "🌌 Dark Cinematic",
        key="dark"
    ):
        st.session_state["template"] = "Dark Cinematic"

    st.markdown("</div>", unsafe_allow_html=True)

with col4:

    st.markdown("<div class='template-card'>", unsafe_allow_html=True)

    st.image(
        "https://images.unsplash.com/photo-1517841905240-472988babdf9",
        use_container_width=True
    )

    if st.button(
        "❤️ Emotional Storytelling",
        key="emotional"
    ):
        st.session_state["template"] = "Emotional Storytelling"

    st.markdown("</div>", unsafe_allow_html=True)

st.markdown("<br>", unsafe_allow_html=True)

# ---------- MAIN LAYOUT ----------

left, right = st.columns([1, 1])

# ---------- LEFT PANEL ----------

with left:

    st.markdown(
        "<div class='section-title'>🎯 Reel Settings</div>",
        unsafe_allow_html=True
    )

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

    # ---------- GENERATE BUTTON ----------

    generate = st.button(
        "🚀 Generate Cinematic Reel"
    )

# ---------- RIGHT PANEL ----------

with right:

    st.markdown(
        "<div class='section-title'>🎞️ Reel Preview</div>",
        unsafe_allow_html=True
    )

    preview_box = st.container()

# ---------- GENERATE ----------

if generate:

    if topic == "":

        st.error("Please enter a topic.")

    else:

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

        # ---------- VIDEO ----------

        video_path = "output/final_reel.mp4"

        if os.path.exists(video_path):

            with preview_box:

                st.video(video_path)

                with open(video_path, "rb") as file:

                    st.download_button(
                        label="⬇️ Download Reel",
                        data=file,
                        file_name="viral_reel.mp4",
                        mime="video/mp4"
                    )

        else:

            st.error(
                "Video generation failed."
            )