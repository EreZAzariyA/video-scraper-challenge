# Video Metadata Dashboard

A comprehensive web application for extracting and analyzing metadata from video URLs. Built with Next.js, this tool fetches Open Graph, Twitter Card, JSON-LD, and standard metadata from video pages.

## Features

- **Metadata Extraction**: Automatically extracts comprehensive metadata from video URLs
- **Multiple Sources**: Supports Open Graph, Twitter Cards, JSON-LD, and standard meta tags
- **Video Preview**: Embedded video player with fallback support
- **Twitter Card Preview**: Visual preview of how content appears on Twitter
- **Copy Functionality**: Easy copying of metadata fields and JSON data
- **Download Support**: Direct video download through proxy
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Dark Mode**: Automatic dark/light theme support

## Supported Metadata

- **Basic Info**: Title, description, site name, canonical URL
- **Media**: Video URLs, images, thumbnails
- **Social**: Twitter card type, Open Graph data
- **Publishing**: Publication dates, modification dates
- **Technical**: Duration, locale, content type
- **Author**: Author information when available

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Enter a video URL** in the input field (e.g., YouTube, Vimeo, news sites)
2. **Click "Extract metadata"** to fetch and analyze the page
3. **Explore the results** across different tabs:
   - **Overview**: Detailed metadata fields
   - **Preview**: Embedded video player
   - **Twitter Card**: Social media preview
   - **Meta Tags**: Raw metadata inspection

## API Endpoints

### POST /api/metadata

Extracts metadata from a given URL.

**Request:**
```json
{
  "url": "https://example.com/video"
}
```

**Response:**
```json
{
  "metadata": {
    "title": "Video Title",
    "description": "Video description",
    "image": "https://example.com/thumbnail.jpg",
    "videoUrl": "https://example.com/video.mp4",
    // ... more metadata
  },
  "metaTags": [
    // Raw meta tags array
  ]
}
```

### GET /api/download

Proxies video downloads with proper headers.

**Parameters:**
- `url`: Video URL to download
- `disposition`: `inline` or `attachment`

## Technical Details

### Architecture

- **Frontend**: Next.js 15+ with React Server Components
- **Styling**: Tailwind CSS with dark mode support
- **HTTP Client**: Got.js with fallback mechanisms
- **HTML Parsing**: Cheerio for server-side DOM manipulation
- **Date Handling**: Day.js for date parsing and formatting

### Bot Detection Handling

The application includes sophisticated bot detection bypass:

- **Multiple User Agents**: Tries browser headers first, falls back to curl
- **Request Rotation**: Different approaches for different sites
- **Error Recovery**: Graceful handling of blocked requests

### Fallback Mechanisms

- **Multiple HTTP Methods**: Native fetch with Got.js fallback
- **Content Type Validation**: Ensures HTML content before parsing
- **Timeout Handling**: Configurable request timeouts
- **Error States**: Clear error messages and recovery suggestions

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── metadata/          # Metadata extraction API
│   │   │   ├── lib/          # Utility libraries
│   │   │   └── route.js      # Main endpoint
│   │   └── download/         # Video download proxy
│   ├── components/           # React components
│   ├── hooks/               # Custom React hooks
│   └── page.js             # Main dashboard page
```

## Dependencies

### Core
- **Next.js**: React framework
- **React**: UI library
- **Tailwind CSS**: Styling

### Utilities
- **cheerio**: Server-side HTML parsing
- **got**: HTTP client with advanced features
- **dayjs**: Date manipulation

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers with modern JavaScript support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.
