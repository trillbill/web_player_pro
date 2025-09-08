import { useState, useRef } from 'react';
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

const STREAM_DATA_LABELS = {
  duration: 'seconds',
  bitrate: 'kbps',
  width: 'px',
  height: 'px',
  codec: '',
  scanType: '',
  frameRate: 'fps',
};

function App() {
  const HLS = import.meta.env.VITE_STREAM_URL;
  const DASH = import.meta.env.VITE_DASH_URL;

  const [userUrl, setUserUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState(DASH);
  const [isCopied, setIsCopied] = useState(false);
  const [variants, setVariants] = useState<any[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<number>(-1);
  const [videoMetadata, setVideoMetadata] = useState<VideoMetadata>({
    duration: null,
    bitrate: null,
    width: null,
    height: null,
    scanType: null,
    frameRate: null,
    codec: null,
  });
  const timeoutRef = useRef<any>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(videoUrl);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
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

  const handleVariantsLoaded = (variants: any[]) => {
    setVariants(variants);
  };

  const handleUserInput = (url: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setUserUrl(url);
    timeoutRef.current = setTimeout(() => {
      setVideoUrl(url);
      clearTimeout(timeoutRef.current);
    }, 1000);
  };

  return (
    <>
      <div className="container">
        <header className="header">
          <h1>Adaptive Bitrate Video Player</h1>
        </header>
        <div className="input-container">
          <input
            className="user-input"
            type="text"
            value={userUrl}
            onChange={(e) => handleUserInput(e.target.value)}
            placeholder="Enter your HLS or DASH URL"
          />
        </div>
        <div className="main-content">
          <div className="video-column">
            <VideoPlayer
              src={videoUrl}
              selectedVariant={selectedVariant}
              onMetadataLoaded={handleVideoMetadata}
              onVariantsLoaded={handleVariantsLoaded}
            />
            <div className="variant-selector">
              {
                variants.map((variant, i) => (
                  <button 
                    key={i} 
                    onClick={() => setSelectedVariant(i)}
                    className={selectedVariant === i ? 'variant-button-active' : 'variant-button'}
                  >
                    {variant.name || variant.height ? `${variant.name || variant.height}p` : `Variant ${i}`}
                  </button>
                ))
              }
              <button className={selectedVariant === -1 ? 'variant-button-active' : 'variant-button'} onClick={() => setSelectedVariant(-1)}>Auto</button>
            </div>
          </div>
          <div className="controls-column">
            <div className="video-type-button-group">
              {[
                {type: 'hls', url: HLS},
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
                <h2>VIDEO URL:</h2><p>{videoUrl.substring(0, 15)}...</p>
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
                      <h2>{key.toUpperCase()}:</h2><p>{value ? value : 'N/A'} {value && STREAM_DATA_LABELS[key as keyof typeof STREAM_DATA_LABELS]}</p>
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
