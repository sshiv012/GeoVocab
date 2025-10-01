# GeoVocab Frontend

Beautiful, modern frontend for GeoVocab built with Next.js 14, TypeScript, Tailwind CSS, and OpenStreetMap (Leaflet.js).

## Features

- 🗺️ Interactive OpenStreetMap with Leaflet.js
- 🎯 Click-to-convert: Click map → get 3 magic words
- 🔍 Search: Enter 3 words → find location
- 🎨 Modern, beautiful UI with Tailwind CSS
- 📱 Fully responsive design
- ⚡ Fast and optimized
- 🌙 Gradient backgrounds and smooth animations
- 📋 Copy-to-clipboard for easy sharing

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Maps:** Leaflet.js + React Leaflet
- **HTTP Client:** Axios
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env.local
```

Edit `.env.local` and set your API URL:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

3. Run development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Building for Production

```bash
npm run build
npm start
```

## Deployment to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Manual Deploy

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variable:
   - `NEXT_PUBLIC_API_URL`: Your backend API URL
4. Deploy!

### Environment Variables in Vercel

Go to Project Settings → Environment Variables and add:

```
NEXT_PUBLIC_API_URL = https://your-backend-api.com/api
```

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Home page
│   │   └── globals.css      # Global styles
│   ├── components/
│   │   └── Map.tsx          # Leaflet map component
│   └── lib/
│       └── api.ts           # API client
├── public/
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vercel.json
```

## Features Breakdown

### Map Component
- Interactive OpenStreetMap
- Click anywhere to place marker
- Automatic 3-word conversion
- Popup display on marker

### Search Functionality
- Enter 3 magic words (format: word1-word2-word3)
- Instant location lookup
- Automatic map centering

### Results Display
- Beautiful gradient cards
- Copy-to-clipboard buttons
- GeoHash display
- Latitude/Longitude coordinates
- Error handling with friendly messages

### UI/UX
- Gradient backgrounds
- Smooth transitions
- Loading states
- Responsive design
- Glass-morphism effects
- Modern color palette

## API Integration

The frontend connects to the Flask backend API:

- `GET /api/geovocab/latitude/{lat}/longitude/{lon}/words`
- `GET /api/geovocab/words/{words}/location`

## Customization

### Colors

Edit `tailwind.config.ts` to customize the color scheme:

```typescript
theme: {
  extend: {
    colors: {
      primary: {
        500: '#0ea5e9',  // Your brand color
        // ...
      },
    },
  },
}
```

### Map Tiles

To use different map tiles, edit `src/components/Map.tsx`:

```tsx
<TileLayer
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  // Change to your preferred tile provider
/>
```

Popular alternatives:
- **CartoDB Positron:** `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png`
- **Stamen Toner:** `https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}{r}.png`

## Performance Optimization

- Dynamic imports for map (SSR disabled)
- Optimized images
- Tree-shaking enabled
- Production build minified
- CDN for Leaflet assets

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)