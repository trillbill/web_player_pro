import { useEffect, useRef } from 'react';
import './VideoPlayer.css';
import HLs from 'hls.js';
import * as dashjs from "dashjs";
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util';

export default function VideoPlayer(
  { src, selectedVariant, onMetadataLoaded, onVariantsLoaded }:
  { 
    src: string, 
    selectedVariant: number,
    onMetadataLoaded: (metadata: any) => void,
    onVariantsLoaded: (variants: any) => void
  }
) {
  const needMetadataRef = useRef(true);
  const videoRef = useRef<HTMLVideoElement>(null);

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
    return {
      duration: videoMetadata.duration || null,
      bitrate: videoMetadata.bitrate || null,
      width: videoMetadata.width || null,
      height: videoMetadata.height || null,
      scanType: videoMetadata.scanType || null,
      frameRate: videoMetadata.frameRate || null,
      codec: videoMetadata.codec || null,
    };
  };

  const fragParsing = async function(file: string, manifestData: any) {
    const ffmpeg = new FFmpeg();
    await ffmpeg.load();
    
    const data = {
      duration: manifestData.duration || null as any,
      bitrate: null as any,
      width: manifestData.width || null as any,
      height: manifestData.height || null as any,
      scanType: null as any,
      frameRate: null as any,
      codec: null as any,
    };

    ffmpeg.on('log', ({ message }) => { 
      // Parse bitrate
      const inputMatch = message.match(/Duration: ([\d:\.]+), start: ([\d\.]+), bitrate: ([\d]+) kb\/s/);
      if (inputMatch) {
        data.bitrate = parseInt(inputMatch[3]); // Extract bitrate in kb/s
      }
      // Parse video stream info
      const videoMatch = message.match(/Stream #0:*.*Video: ([^(]+) \(([^)]+)\).*?(\d+)x(\d+).*?(\d+\.?\d*) fps/);
      if (videoMatch) {
        data.codec = videoMatch[1].trim();
        data.frameRate = parseFloat(videoMatch[5]);
        
        // Check for scan type
        if (message.includes('progressive')) {
          data.scanType = 'progressive';
        } else if (message.includes('interlaced')) {
          data.scanType = 'interlaced';
        }
      }
      
      // When we see the output section, we have all the data
      if (message.includes('Output #0') && data.codec) {
        const parsedHLSData = parseVideoMetadata(data, 'hls');
        if (parsedHLSData) {
          onMetadataLoaded(parsedHLSData);
        }
      }
    });

    try {
      await ffmpeg.writeFile('input.mp4', await fetchFile(file));
      const command = ['-i', 'input.mp4', '-f', 'null', '-'];
      await ffmpeg.exec(command);
    } catch (error) {
      console.error('Error parsing fragment:', error);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;
    onVariantsLoaded([]);

    if (!needMetadataRef.current) {
      needMetadataRef.current = true;
    }

    let hls:HLs | null = null;

    if (src.endsWith(".mpd")) {
      console.log('DASH PLAYLIST DETECTED');
      const dashPlayer = dashjs.MediaPlayer().create();

      dashPlayer.initialize(video, src, true);
      const abrSettings = {
        autoSwitchBitrate: {
          audio: selectedVariant >= 0 ? false : true,
          video: selectedVariant >= 0 ? false : true
        }
      };
      dashPlayer.updateSettings({
        streaming: {
          abr: abrSettings
        }
      });
      dashPlayer.attachView(video);

      dashPlayer.on('streamActivated', (e: any) => {
        dashPlayer.setRepresentationForTypeByIndex('video', selectedVariant >= 0 ? selectedVariant : 0);
      });

      dashPlayer.on('streamInitialized', (e: void) => {
        const videoRepresentation = dashPlayer.getCurrentRepresentationForType('video');
        const availableQualities = dashPlayer.getRepresentationsByType('video');
        if (availableQualities?.length > 0) {
          const dashVariants = availableQualities.map((quality: any) => ({
            height: quality.height,
            width: quality.width,
            bitrate: quality.bitrateInKbit,
            codec: quality.codecs,
            frameRate: quality.frameRate,
            scanType: quality.scanType,
          }));
          onVariantsLoaded(dashVariants);
        }

        const parsedDashData = parseVideoMetadata(videoRepresentation, 'dash');
        if (parsedDashData) {
          onMetadataLoaded(parsedDashData);
        }
      });

      dashPlayer.on('qualityChangeRendered', (e: void) => {
        const videoRepresentation = dashPlayer.getCurrentRepresentationForType('video');
        const parsedDashData = parseVideoMetadata(videoRepresentation, 'dash');
        if (parsedDashData) {
          onMetadataLoaded(parsedDashData);
        }
      });

      dashPlayer.on('bufferLoaded', (e: void) => {
        const videoRepresentation = dashPlayer.getCurrentRepresentationForType('video');
        const parsedDashData = parseVideoMetadata(videoRepresentation, 'dash');
        if (parsedDashData) {
          onMetadataLoaded(parsedDashData);
        }
      });

      return () => { dashPlayer.destroy(); };
    } else if (HLs.isSupported()) {
      console.log('HLS PLAYLIST DETECTED');
      const hlsConfig = {
        enableWorker: true,
        startLevel: selectedVariant >= 0 ? selectedVariant : 0,
      };
      if (selectedVariant >= 0) {
        Object.assign(hlsConfig, {
          abrEwmaDefaultEstimate: 0,
          abrEwmaFastLive: 0,
          abrEwmaSlowLive: 0,
          abrMaxWithRealBitrate: false,
          maxStarvationDelay: 0,
          maxLoadingDelay: 0
        });
      }
      hls = new HLs(hlsConfig);
      hls.loadSource(src);
      hls.attachMedia(video);
      if (selectedVariant >= 0) {
        hls.currentLevel = selectedVariant;
      }

      let newLevel: any = null;

      const levelData: any[] = [];

      hls.on(HLs.Events.LEVEL_LOADED, (event: any, data: any) => {
        levelData.push({
          level: data.level,
          duration: data.details?.totalduration,
          bitrate: data.levelInfo?.bitrate,
          width: data.levelInfo?.width,
          height: data.levelInfo?.height,
          scanType: data.levelInfo?.scanType,
          frameRate: data.levelInfo?.frameRate,
          codec: data.levelInfo?.codecSet,
        });
      });

      hls.on(HLs.Events.MANIFEST_LOADED, (event: any, data: any) => {
        if (data?.levels?.length > 0) {
          const levelsSorted = data.levels
            .sort((level: any, level2: any) => level.height - level2.height);
          onVariantsLoaded(levelsSorted);
        }
      });

      hls.on(HLs.Events.LEVEL_UPDATED, (event: any, data: any) => {
        newLevel = data.level;
      });

      hls.on(HLs.Events.FRAG_CHANGED, (event: any, data: any) => {
        const fragLevel = data?.frag?.level;
        if (fragLevel === newLevel) {
          needMetadataRef.current = true;
        }
      });
      
      hls.on(HLs.Events.FRAG_PARSED, async (event: any, data: any) => {
        if (needMetadataRef.current && data?.frag?._url) {
          needMetadataRef.current = false;
          const manifestData = levelData.find((level: any) => level.level === data.frag.level);
          const shallowManifestData = { ...manifestData };
          delete shallowManifestData.level;
          onMetadataLoaded(shallowManifestData);
          fragParsing(data.frag._url, manifestData);
        }
      });
    }
    return () => { hls?.destroy(); };
  }, [src, selectedVariant]);

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
