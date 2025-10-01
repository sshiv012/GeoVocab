# 🗺️ GeoVocab - Find Any Place with 3 Words

A modern web application that converts geographic coordinates into 3 simple English words. Built with Python Flask + SQLite backend and Next.js + OpenStreetMap frontend.

![GeoVocab Demo](https://img.shields.io/badge/status-ready-brightgreen)
![Python](https://img.shields.io/badge/python-3.8+-blue)
![Next.js](https://img.shields.io/badge/next.js-14-black)

## ✨ Features

- 🎯 **Bidirectional Conversion**: Coordinates ↔ 3 Magic Words
- 🗺️ **Interactive Map**: Click anywhere to get words
- 🔍 **Search**: Find locations by entering 3 words
- 💎 **Premium Geovocab**: Custom word mappings for specific locations
- ⚡ **Fast & Lightweight**: SQLite database with 32K+ word mappings
- 🎨 **Beautiful UI**: Modern design with Tailwind CSS
- 📱 **Responsive**: Works on all devices
- 🌍 **OpenStreetMap**: No API keys required

## 🏗️ Architecture

```
geovocab/
├── backend/          # Python Flask API + SQLite
│   ├── app.py       # Main Flask application
│   ├── models.py    # SQLAlchemy models
│   ├── database.py  # Database connection
│   ├── utils.py     # Geohash utilities
│   └── database/    # SQLite database & schema
│
└── frontend/        # Next.js 14 + TypeScript
    ├── src/
    │   ├── app/     # Next.js app router
    │   ├── components/  # React components
    │   └── lib/     # API client & utilities
    └── ...
```

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env

# Run server (database auto-initializes on first run)
python app.py
```

Backend runs on `http://localhost:5000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local

# Run development server
npm run dev
```

Frontend runs on `http://localhost:3000`

## 📖 How It Works

### Geohash Technology

GeoVocab uses **9-character geohashes** for precision of ≤ 4.77m × 4.77m:

1. Coordinates → 9-char geohash (e.g., `tdr1kmq8g`)
2. Split into 3 parts: `tdr` + `1km` + `q8g`
3. Each part maps to a word
4. Result: `word1-word2-word3`

### Example

- **Input**: `Latitude: 13.031437, Longitude: 80.246952`
- **Geohash**: `tdr1kmq8g`
- **Output**: `Isthmus-Standard-Vertex`

## 🔌 API Reference

### Convert Coordinates to Words

```bash
GET /api/geovocab/latitude/{lat}/longitude/{lon}/words
```

**Example:**
```bash
curl http://localhost:5000/api/geovocab/latitude/13.031437/longitude/80.246952/words
```

### Convert Words to Location

```bash
GET /api/geovocab/words/{word1-word2-word3}/location
```

**Example:**
```bash
curl http://localhost:5000/api/geovocab/words/Isthmus-Standard-Vertex/location
```

### Create Premium Geovocab

```bash
POST /api/geovocab/premium
Content-Type: application/json

{
  "geoHash": "tdr1kmq8g",
  "magicwords": "my-custom-location"
}
```

## 🚢 Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Set environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-api.com/api
   ```
4. Deploy!

### Backend (Railway / Render / DigitalOcean)

1. Push code to GitHub
2. Connect repository to your cloud provider
3. Set environment variables:
   ```
   FLASK_ENV=production
   SECRET_KEY=your-secret-key
   CORS_ORIGINS=https://your-frontend.vercel.app
   ```
4. Deploy!

**Start command:** `gunicorn -w 4 -b 0.0.0.0:$PORT app:app`

## 🛠️ Tech Stack

### Backend
- **Framework:** Flask 3.0
- **Database:** SQLite + SQLAlchemy
- **Geohash:** python-geohash
- **CORS:** Flask-CORS

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Maps:** Leaflet.js + React Leaflet
- **HTTP:** Axios
- **Icons:** Lucide React

## 📊 Database Schema

### GeoHashEntity Table
```sql
CREATE TABLE GeoHashEntity (
  hashVal TEXT PRIMARY KEY,  -- 3-char geohash part
  word TEXT NOT NULL         -- English word
);
CREATE INDEX idx_word ON GeoHashEntity(word);
```

### GeoVocabPremium Table
```sql
CREATE TABLE GeoVocabPremium (
  geoHash TEXT PRIMARY KEY,  -- 9-char geohash
  magicwords TEXT NOT NULL   -- Custom 3-word phrase
);
CREATE INDEX idx_magicwords ON GeoVocabPremium(magicwords);
```

## 🎨 UI Features

- **Gradient backgrounds** with beautiful color schemes
- **Glass-morphism** effects
- **Smooth animations** and transitions
- **Copy-to-clipboard** functionality
- **Real-time** coordinate updates
- **Error handling** with friendly messages
- **Loading states** for better UX

## 🔧 Configuration

### Backend (.env)
```env
FLASK_ENV=development
SECRET_KEY=your-secret-key
DATABASE_URI=sqlite:///database/geovocab.db
CORS_ORIGINS=http://localhost:3000
PORT=5000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 📝 Development

### Backend Development
```bash
cd backend
python app.py  # Runs with auto-reload in debug mode
```

### Frontend Development
```bash
cd frontend
npm run dev    # Runs with hot-reload
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- [Geohash](https://en.wikipedia.org/wiki/Geohash) algorithm
- [OpenStreetMap](https://www.openstreetmap.org/) for map tiles
- [Leaflet.js](https://leafletjs.com/) for mapping library
- Inspired by what3words concept

## 🔗 Links

- **Backend README:** [/backend/README.md](backend/README.md)
- **Frontend README:** [/frontend/README.md](frontend/README.md)