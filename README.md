# Web Player Pro

A public adaptive bitrate video player built with React, TypeScript, and Vite. This application supports HLS (HTTP Live Streaming) and DASH (Dynamic Adaptive Streaming over HTTP) protocols with advanced metadata extraction and quality control features.

## Features

### 🎥 Multi-Format Support
- **HLS (HTTP Live Streaming)** - Full support with HLS.js
- **DASH (Dynamic Adaptive Streaming)** - Complete DASH.js integration

### 📊 Advanced Metadata Extraction
- **Real-time video metrics** including bitrate, resolution, frame rate, and codec information
- **FFmpeg.wasm integration** for detailed video analysis
- **Manifest parsing** for stream level metadata
- **Event Logging** for player based event tracking

### 🎛️ Quality Control
- **Manual quality selection** - Choose specific bitrate/resolution levels
- **Auto-adaptive streaming** - Let the player automatically adjust quality
- **Variant switching** - Real-time quality level changes

### 🔧 Developer Tools
- **Event logging** - Real-time HLS/DASH event monitoring
- **Manifest inspection** - View and analyze stream manifests
- **Error handling** - Comprehensive error reporting and debugging
- **URL input** - Test custom HLS/DASH streams

## Technology Stack

- **Frontend**: React + TypeScript
- **Build Tool**: Vite
- **Video Players**: HLS.js, DASH.js
- **Video Analysis**: FFmpeg.wasm
- **Styling**: CSS3 with Flexbox
- **Icons**: React Icons (Font Awesome)

## Getting Started

### Prerequisites
- Node.js ^20.19.13
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd web_player_pro
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create .env file
VITE_STREAM_URL=your_hls_stream_url
VITE_DASH_URL=your_dash_stream_url
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## Usage

### Basic Usage
1. **Load a stream**: Use the URL input field to enter an HLS (.m3u8) or DASH (.mpd) URL
2. **Select quality**: Choose from available quality variants or use auto-adaptive mode
3. **Monitor metrics**: View real-time video metadata in the right panel
4. **Debug**: Check the event log and manifest inspector for technical details

### Keyboard Controls
- **Space**: Play/Pause
- **Arrow Keys**: Seek forward/backward
- **Up/Down**: Volume control
- **M**: Mute/Unmute
- **F**: Fullscreen toggle

### API Integration
The player exposes several callback functions for integration:
- `onMetadataLoaded` - Video metadata updates
- `onVariantsLoaded` - Available quality levels
- `onError` - Error handling
- `onEvent` - Event logging

## Configuration

### Vite Configuration
The project includes CORS and COEP headers for FFmpeg.wasm compatibility:
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react(), crossOriginIsolation()],
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
})
```

### Environment Variables
- `VITE_STREAM_URL` - Default HLS stream URL
- `VITE_DASH_URL` - Default DASH stream URL

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Author

**Will Finnegan**
- LinkedIn: [William Finnegan](https://www.linkedin.com/in/william-finnegan-4b64819a)

## Acknowledgments

- HLS.js team for excellent HLS support
- DASH.js team for DASH implementation
- FFmpeg.wasm for browser-based video analysis
- React and Vite communities for the development tools
