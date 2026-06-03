import argparse
import hashlib
import json
import os
import time
from pathlib import Path

import requests


DEFAULT_VIDEO = Path("output/final_subtitled_reel.mp4")
DEFAULT_METADATA = Path("assets/youtube_metadata.json")
DEFAULT_ENV_FILES = [Path(".env"), Path("api_keys.txt"), Path("instagram_env_template.txt")]


def load_local_env_files():
    for env_path in DEFAULT_ENV_FILES:
        if not env_path.exists():
            continue

        for line in env_path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue

            key, value = line.split("=", 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            if key and value and not os.getenv(key):
                os.environ[key] = value


def clean_env_value(key):
    value = os.getenv(key, "").strip()
    if not value or value.startswith("paste_"):
        return ""
    return value


def load_metadata(path):
    if not path.exists():
        return {
            "title": "AI Travel Reel",
            "description": "Generated travel reel.",
            "hashtags": ["#TravelShorts"],
        }

    metadata = json.loads(path.read_text(encoding="utf-8"))
    metadata.setdefault("title", "AI Travel Reel")
    metadata.setdefault("description", "")
    metadata.setdefault("hashtags", [])
    return metadata


def build_instagram_caption(metadata):
    title = metadata.get("title", "").strip()
    description = metadata.get("description", "").strip()
    hashtags = " ".join(metadata.get("hashtags", [])).strip()

    parts = [part for part in [title, description, hashtags] if part]
    caption = "\n\n".join(parts)
    return caption[:2200]


def cloudinary_signature(params, api_secret):
    signable = "&".join(f"{key}={params[key]}" for key in sorted(params))
    return hashlib.sha1(f"{signable}{api_secret}".encode("utf-8")).hexdigest()


def upload_to_cloudinary(video_path):
    cloud_name = clean_env_value("CLOUDINARY_CLOUD_NAME")
    api_key = clean_env_value("CLOUDINARY_API_KEY")
    api_secret = clean_env_value("CLOUDINARY_API_SECRET")

    if not all([cloud_name, api_key, api_secret]):
        raise RuntimeError(
            "Instagram needs a public HTTPS video URL. Add Cloudinary keys, or pass --video-url."
        )

    if not video_path.exists():
        raise RuntimeError(f"Video not found: {video_path}")

    timestamp = str(int(time.time()))
    params = {
        "folder": "ai-reel-agent",
        "timestamp": timestamp,
    }
    signature = cloudinary_signature(params, api_secret)

    upload_url = f"https://api.cloudinary.com/v1_1/{cloud_name}/video/upload"
    with video_path.open("rb") as video_file:
        response = requests.post(
            upload_url,
            data={
                "api_key": api_key,
                "timestamp": timestamp,
                "folder": params["folder"],
                "signature": signature,
            },
            files={"file": video_file},
            timeout=900,
        )

    if response.status_code >= 400:
        raise RuntimeError(f"Cloudinary upload failed: {response.text}")

    payload = response.json()
    secure_url = payload.get("secure_url")
    if not secure_url:
        raise RuntimeError(f"Cloudinary did not return a video URL: {payload}")

    print("Cloud upload complete")
    print(secure_url)
    return secure_url


def instagram_request(method, path, **kwargs):
    base_url = clean_env_value("INSTAGRAM_API_BASE") or "https://graph.instagram.com/v25.0"
    base_url = base_url.rstrip("/")
    url = f"{base_url}/{path.lstrip('/')}"
    response = requests.request(method, url, timeout=120, **kwargs)

    if response.status_code >= 400:
        raise RuntimeError(f"Instagram API error: {response.text}")

    return response.json()


def wait_for_container(container_id, access_token, max_attempts=30):
    for _ in range(max_attempts):
        payload = instagram_request(
            "GET",
            container_id,
            params={
                "fields": "status_code,status",
                "access_token": access_token,
            },
        )

        status_code = payload.get("status_code")
        status_text = payload.get("status", "")
        print(f"Instagram processing status: {status_code or status_text}")

        if status_code == "FINISHED":
            return
        if status_code == "ERROR":
            raise RuntimeError(f"Instagram container failed: {payload}")

        time.sleep(10)

    raise RuntimeError("Instagram video processing timed out. Try publishing again in a few minutes.")


def publish_reel(video_url, caption):
    access_token = clean_env_value("INSTAGRAM_ACCESS_TOKEN")
    user_id = clean_env_value("INSTAGRAM_USER_ID")

    if not access_token:
        raise RuntimeError("Missing INSTAGRAM_ACCESS_TOKEN.")
    if not user_id:
        raise RuntimeError("Missing INSTAGRAM_USER_ID.")

    create_payload = instagram_request(
        "POST",
        f"{user_id}/media",
        data={
            "media_type": "REELS",
            "video_url": video_url,
            "caption": caption,
            "share_to_feed": "true",
            "access_token": access_token,
        },
    )

    container_id = create_payload.get("id")
    if not container_id:
        raise RuntimeError(f"Instagram did not return a media container ID: {create_payload}")

    print(f"Instagram media container created: {container_id}")
    wait_for_container(container_id, access_token)

    publish_payload = instagram_request(
        "POST",
        f"{user_id}/media_publish",
        data={
            "creation_id": container_id,
            "access_token": access_token,
        },
    )

    media_id = publish_payload.get("id")
    if not media_id:
        raise RuntimeError(f"Instagram did not return a published media ID: {publish_payload}")

    print("Instagram Reel published")
    print(f"Instagram media ID: {media_id}")
    return media_id


def main():
    load_local_env_files()

    parser = argparse.ArgumentParser()
    parser.add_argument("--video", default=str(DEFAULT_VIDEO))
    parser.add_argument("--metadata", default=str(DEFAULT_METADATA))
    parser.add_argument("--video-url", default="")
    args = parser.parse_args()

    metadata = load_metadata(Path(args.metadata))
    caption = build_instagram_caption(metadata)
    video_url = args.video_url.strip() or upload_to_cloudinary(Path(args.video))
    publish_reel(video_url, caption)


if __name__ == "__main__":
    main()
