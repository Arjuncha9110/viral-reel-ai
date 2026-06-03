import argparse
import json
from pathlib import Path


SCOPES = ["https://www.googleapis.com/auth/youtube.upload"]
CLIENT_SECRET_FILE = Path("youtube_client_secret.json")
TOKEN_FILE = Path("youtube_token.json")
DEFAULT_VIDEO = Path("output/final_subtitled_reel.mp4")
DEFAULT_METADATA = Path("assets/youtube_metadata.json")


def load_google_modules():
    try:
        from google.auth.transport.requests import Request
        from google.oauth2.credentials import Credentials
        from google_auth_oauthlib.flow import InstalledAppFlow
        from googleapiclient.discovery import build
        from googleapiclient.http import MediaFileUpload
    except ModuleNotFoundError as e:
        raise RuntimeError(
            "Missing Google upload packages. Run: pip install -r requirements.txt"
        ) from e

    return Request, Credentials, InstalledAppFlow, build, MediaFileUpload


def load_metadata(path):
    if not path.exists():
        return {
            "title": "AI Travel Reel",
            "description": "Generated travel reel.",
            "hashtags": ["#TravelShorts"],
            "tags": ["travelshorts"],
            "privacy_status": "private",
        }

    metadata = json.loads(path.read_text(encoding="utf-8"))
    metadata.setdefault("title", "AI Travel Reel")
    metadata.setdefault("description", "")
    metadata.setdefault("hashtags", [])
    metadata.setdefault("tags", [])
    metadata.setdefault("privacy_status", "private")
    return metadata


def get_credentials():
    Request, Credentials, InstalledAppFlow, _, _ = load_google_modules()

    if not CLIENT_SECRET_FILE.exists():
        raise RuntimeError(f"Missing {CLIENT_SECRET_FILE}.")

    credentials = None
    if TOKEN_FILE.exists():
        credentials = Credentials.from_authorized_user_file(str(TOKEN_FILE), SCOPES)

    if credentials and credentials.expired and credentials.refresh_token:
        credentials.refresh(Request())

    if not credentials or not credentials.valid:
        flow = InstalledAppFlow.from_client_secrets_file(str(CLIENT_SECRET_FILE), SCOPES)
        credentials = flow.run_local_server(port=0)

    TOKEN_FILE.write_text(credentials.to_json(), encoding="utf-8")
    return credentials


def upload_video(video_path, metadata_path, privacy_status=None):
    _, _, _, build, MediaFileUpload = load_google_modules()

    if not video_path.exists():
        raise RuntimeError(f"Video not found: {video_path}")

    metadata = load_metadata(metadata_path)
    final_privacy = privacy_status or metadata.get("privacy_status") or "private"

    description = metadata.get("description", "")
    hashtags = metadata.get("hashtags", [])
    if hashtags and " ".join(hashtags) not in description:
        description = description.rstrip() + "\n\n" + " ".join(hashtags)

    body = {
        "snippet": {
            "title": metadata.get("title", "AI Travel Reel")[:100],
            "description": description,
            "tags": metadata.get("tags", []),
            "categoryId": "19",
        },
        "status": {
            "privacyStatus": final_privacy,
            "selfDeclaredMadeForKids": False,
        },
    }

    credentials = get_credentials()
    youtube = build("youtube", "v3", credentials=credentials)
    media = MediaFileUpload(str(video_path), chunksize=-1, resumable=True)
    request = youtube.videos().insert(
        part="snippet,status",
        body=body,
        media_body=media,
    )

    response = None
    while response is None:
        status, response = request.next_chunk()
        if status:
            print(f"Upload progress: {int(status.progress() * 100)}%")

    video_id = response["id"]
    url = f"https://www.youtube.com/watch?v={video_id}"
    print("YouTube upload complete")
    print(url)
    return url


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--video", default=str(DEFAULT_VIDEO))
    parser.add_argument("--metadata", default=str(DEFAULT_METADATA))
    parser.add_argument(
        "--privacy",
        choices=["private", "unlisted", "public"],
        default=None,
    )
    args = parser.parse_args()

    upload_video(
        Path(args.video),
        Path(args.metadata),
        privacy_status=args.privacy,
    )


if __name__ == "__main__":
    main()
