const express = require('express');
const { spawn } = require('child_process'); // Added for yt-dlp integration

// Create an Express application
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Define the port
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// POST route for /generate
app.post('/generate', (req, res) => {
  console.log('Request body:', req.body);

  const { url } = req.body;

  // Basic validation
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return res.status(400).json({ error: 'Invalid URL provided.' });
  }

  // Placeholder success response
  // res.status(200).json({ message: 'Request received, URL is valid.' }); // Kept for now, will be replaced by yt-dlp logic

  // Note: yt-dlp must be installed and available in the system's PATH.
  const ytdlpCommand = 'yt-dlp';
  const ytdlpArgs = ['-g', url]; // -g gets the direct link

  const child = spawn(ytdlpCommand, ytdlpArgs);

  let stdoutData = '';
  let stderrData = '';
  let timedOut = false;

  // Timeout for the process
  const timeoutDuration = 30000; // 30 seconds
  const timer = setTimeout(() => {
    timedOut = true;
    child.kill('SIGKILL'); // Force kill the process
    console.error(`yt-dlp process timed out after ${timeoutDuration / 1000} seconds for URL: ${url}`);
    // Ensure response is sent only once
    if (!res.headersSent) {
      res.status(504).json({ error: 'Processing timed out.' });
    }
  }, timeoutDuration);

  child.stdout.on('data', (data) => {
    stdoutData += data.toString();
  });

  child.stderr.on('data', (data) => {
    stderrData += data.toString();
  });

  child.on('error', (error) => {
    clearTimeout(timer); // Clear the timeout
    console.error('Failed to start yt-dlp process:', error);
    // Ensure response is sent only once
    if (!res.headersSent) {
      // Consistent error message for spawn failures
      res.status(500).json({ error: 'Failed to process video.', details: 'Could not start yt-dlp process.' });
    }
  });

  child.on('close', (code) => {
    clearTimeout(timer); // Clear the timeout

    if (timedOut) {
      // Response may have already been sent by timeout logic.
      // If not, ensure the correct one is sent. This check is mostly a safeguard.
      if (!res.headersSent) {
        res.status(504).json({ error: 'Processing timed out.' });
      }
      return;
    }

    if (code === 0 && stdoutData.trim() !== '') {
      const directUrl = stdoutData.trim();
      console.log(`yt-dlp stdout (direct URL): ${directUrl}`);
      if (!res.headersSent) {
        res.status(200).json({ direct_url: directUrl });
      }
    } else {
      // Non-zero exit code or stderr data
      const errorDetails = stderrData.trim() || `yt-dlp exited with code ${code}`;
      console.error(`yt-dlp error: ${errorDetails}`);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to process video.', details: errorDetails });
      }
    }
  });
});
