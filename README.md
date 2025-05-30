# Video Direct Link API

## Description
This API provides a way to get a direct download link for videos from various websites, utilizing the `yt-dlp` command-line tool. You provide a video URL, and the API returns a direct link that can be used for downloading.

## Prerequisites
Before you begin, ensure you have the following installed:
- **Node.js and npm**: You can download and install them from [https://nodejs.org/](https://nodejs.org/).
- **`yt-dlp`**: This tool is essential for fetching video information. It must be installed and accessible in your system's PATH.
  - For installation instructions, please visit: [https://github.com/yt-dlp/yt-dlp#installation](https://github.com/yt-dlp/yt-dlp#installation)

## Installation
1. Clone the repository:
   ```bash
   git clone <your_repository_url_here>
   ```
2. Change into the project directory:
   ```bash
   cd <project_directory_name_here>
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```

## Running the API
To start the API server, run the following command:
```bash
npm start
```
By default, the API will be running on `http://localhost:3000`.

## API Endpoint

### POST /generate
This endpoint processes the given video URL and attempts to return a direct download link.

**Request Body**:
```json
{
  "url": "VIDEO_URL"
}
```
- `url` (string, required): The URL of the video you want to process.

**Success Response (200 OK)**:
Indicates that a direct download link was successfully retrieved.
```json
{
  "direct_url": "DIRECT_DOWNLOAD_LINK"
}
```

**Error Responses**:
- **400 Bad Request**: Sent if the provided URL is missing or invalid.
  ```json
  {
    "error": "Invalid URL provided."
  }
  ```
- **500 Internal Server Error**: Sent if `yt-dlp` fails to process the video or if there's an unexpected server error.
  ```json
  {
    "error": "Failed to process video.",
    "details": "<specific_error_details_from_yt-dlp_or_server>"
  }
  ```
- **504 Gateway Timeout**: Sent if `yt-dlp` takes too long to process the video (currently 30 seconds).
  ```json
  {
    "error": "Processing timed out."
  }
  ```

## Example Usage (curl)
Here's how you can use `curl` to request a direct download link. Replace `YOUTUBE_VIDEO_URL_OR_OTHER_SUPPORTED_URL` with an actual video URL.

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"url": "YOUTUBE_VIDEO_URL_OR_OTHER_SUPPORTED_URL"}' \
  http://localhost:3000/generate
```
