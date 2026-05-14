import streamlit as st
import subprocess
import os

st.set_page_config(
    page_title="AI Reel Generator",
    layout="centered"
)

st.title("🎬 AI Reel Generator")

st.write("Generate cinematic AI reels automatically.")

# INPUT
topic = st.text_input(
    "Enter Reel Topic",
    placeholder="Luxury Bali"
)

# BUTTON
if st.button("Generate Reel"):

    if topic == "":
        st.error("Please enter a topic.")
    else:

        # SAVE TOPIC
        with open("topic.txt", "w", encoding="utf-8") as f:
            f.write(topic)

        st.info("Generating reel... Please wait.")

        # RUN MAIN SCRIPT
        subprocess.run(["python", "create_reel.py"])

        # CHECK OUTPUT
        video_path = "output/final_reel.mp4"

        if os.path.exists(video_path):

            st.success("Reel generated successfully!")

            # SHOW VIDEO
            st.video(video_path)

            # DOWNLOAD BUTTON
            with open(video_path, "rb") as file:
                st.download_button(
                    label="Download Reel",
                    data=file,
                    file_name="final_reel.mp4",
                    mime="video/mp4"
                )

        else:
            st.error("Failed to generate reel.")