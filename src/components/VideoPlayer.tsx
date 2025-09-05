import React, { useState, useEffect, useRef } from 'react';
import './VideoPlayer.css';
import HLs from 'hls.js';
import * as dashjs from "dashjs";

export default function VideoPlayer({ src, onMetadataLoaded }: { src: string, onMetadataLoaded: (metadata: any) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoMetadata, setVideoMetadata] = useState<VideoMetadata>({
    duration: null,
    bitrate: null,
    width: null,
    height: null,
    scanType: null,
    frameRate: null,
    codec: null,
  });

  const parseVideoMetadata = (videoMetadata: any, type: string) => {
    if (type === 'dash') {
      return {
        duration: videoMetadata.adaptation?.period?.duration || null,
        bitrate: videoMetadata.bitrateInKbit || null,
        width: videoMetadata.width || null,
        height: videoMetadata.height || null,
        scanType: videoMetadata.scanType || null,
        frameRate: videoMetadata.frameRate || null,
        codec: videoMetadata.codecs || null,
      };
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    let hls:HLs | null = null;

    if (src.endsWith(".mp4")) {
      console.log('MP4 FILE DETECTED');
      video.src = src;
      video.play().catch(() => {});
      return () => { video.pause(); video.removeAttribute("src"); };
    } else if (src.endsWith(".mpd")) {
      console.log('DASH PLAYLIST DETECTED');
      const dashPlayer = dashjs.MediaPlayer().create();

      dashPlayer.initialize(video, src, true);
      dashPlayer.attachView(video);

      dashPlayer.on('streamInitialized', (e: void) => {
        const videoRepresentation = dashPlayer.getCurrentRepresentationForType('video');
        const parsedDashData = parseVideoMetadata(videoRepresentation, 'dash');
        if (parsedDashData) {
          // setVideoMetadata(parsedDashData);
          onMetadataLoaded(parsedDashData);
        }
      });

      return () => { dashPlayer.destroy(); };
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      console.log('HLS (native) DETECTED');
      video.src = src;
      video.play().catch((error) => console.error(error));
      return () => { video.pause(); video.removeAttribute("src"); };
    } else if (HLs.isSupported()) {
      console.log('HLS (non native) DETECTED');
      hls = new HLs({ enableWorker: true });
      hls.loadSource(src);
      hls.attachMedia(video);
    }
    return () => { hls?.destroy(); };
  }, [src]);

  return (
    <video
      ref={videoRef}
      controls
      playsInline
      className="player"
      aria-label="Video player"
    >
      <track kind="subtitles" src="captions.vtt" srcLang="en" label="English" default />
    </video>
  );
}
