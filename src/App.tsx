import { useState, useRef, useEffect } from 'react';
import VideoPlayer from './components/VideoPlayer';
import { FaCopy, FaCheck } from "react-icons/fa";
import './App.css';

interface VideoMetadata {
  duration: number | null;
  bitrate: number | null;
  width: number | null;
  height: number | null;
  scanType: string | null;
  frameRate: number | null;
  codec: string | null;
}

function App() {
  const HLS = import.meta.env.VITE_STREAM_URL;
  const MP4 = import.meta.env.VITE_MP4_URL;
  const DASH = import.meta.env.VITE_DASH_URL;

  const [videoUrl, setVideoUrl] = useState(HLS);
  const [isCopied, setIsCopied] = useState(false);
  const [videoMetadata, setVideoMetadata] = useState<VideoMetadata>({
    duration: null,
    bitrate: null,
    width: null,
    height: null,
    scanType: null,
    frameRate: null,
    codec: null,
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(videoUrl);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 5000);
  };

  const handleVideoSelect = (url: string) => {
    setVideoMetadata({
      duration: null,
      bitrate: null,
      width: null,
      height: null,
      scanType: null,
      frameRate: null,
      codec: null,
    });
    setVideoUrl(url);
  };

  const handleVideoMetadata = (metadata: any) => {
    setVideoMetadata(metadata);
  };

  return (
    <>
      <div className="container">
        <header className="header">
          <h1>Web Player MVP</h1>
        </header>
        <div className="main-content">
          <div className="video-column">
            <VideoPlayer
              src={videoUrl}
              onMetadataLoaded={handleVideoMetadata}
            />
          </div>
          <div className="controls-column">
            <div className="video-type-button-group">
              {[
                {type: 'hls', url: HLS},
                {type: 'mp4', url: MP4},
                {type: 'dash', url: DASH}
              ].map((item, i) => (
                <button
                  key={i}
                  className={
                    item.url === videoUrl ? 
                    "video-type-button-active"
                    : 
                    "video-type-button"
                  }
                  onClick={() => handleVideoSelect(item.url)}
                >
                  <div className="video-type-text">{item.type.toUpperCase()}</div>
                </button>
              ))}
            </div>
            <div className="metrics-section">
              {/* Placeholder for future video metrics and features */}
              <h1>Video Metrics</h1>
              <div className="video-url-container">
                <h2>Video URL:</h2><p>{videoUrl.substring(0, 15)}...</p>
                <button onClick={handleCopy}>
                  {
                  isCopied ? 
                    <FaCheck className="check-icon" /> 
                  : 
                    <FaCopy className="copy-icon" />
                  }
                </button>
              </div>
              <div className="video-metadata-container">
                {
                  Object.entries(videoMetadata).map(([key, value]) => (
                    <div key={key}>
                      <h2>{key}:</h2><p>{value ? value : 'N/A'}</p>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
