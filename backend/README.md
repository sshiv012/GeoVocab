# GeoVocab Backend API

Python Flask backend for GeoVocab - Convert geographic coordinates to 3 magic words.

## Features

- RESTful API with Flask
- SQLite database with ~32K word mappings
- Geohash-based location encoding/decoding (9-char precision: ±2.4m)
- Premium geovocab support
- CORS enabled for frontend integration
- Consistent coordinate precision (6 decimal places for 9-char geohash)

## Setup

### Prerequisites

- Python 3.8+
- pip

### Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your settings
```

3. Initialize database (automatic on first run):
```bash
python app.py
```

The database will be automatically created from `database/geovocab.sql` on first run.

## API Endpoints

### GET /api/geovocab/latitude/{lat}/longitude/{lon}/words
Convert coordinates to 3 magic words.

**Example:**
```
GET /api/geovocab/latitude/13.031437/longitude/80.246952/words
```

**Response:**
```json
{
  "message": "Here's the 3 magic words to your location",
  "status": 200,
  "data": {
    "geoVocab": "word1-word2-word3",
    "geoHash": "tdr1kmq8g",
    "latitude": 13.031437,
    "longitude": 80.246952
  }
}
```

### GET /api/geovocab/words/{words}/location
Convert 3 magic words to coordinates.

**Example:**
```
GET /api/geovocab/words/Bread-And-Chocolate/location
```

**Response:**
```json
{
  "message": "Here's the location pointed by your 3 magic words",
  "status": 200,
  "data": {
    "geoVocab": "Bread-And-Chocolate",
    "geoHash": "u4pruydq8",
    "latitude": 57.64911,
    "longitude": 10.40744
  }
}
```

### POST /api/geovocab/premium
Create a premium geovocab mapping.

**Request:**
```json
{
  "geoHash": "tdr1kmq8g",
  "magicwords": "my-custom-words"
}
```

### GET /api/geovocab/geohash/{geohash}
Find word by geohash.

### GET /api/geovocab/geohashes
Get all geohash entities (paginated).

**Query params:** `page`, `per_page`

### GET /api/health
Health check endpoint.

## Running the Server

### Development
```bash
python app.py
```

Server runs on `http://localhost:5000`

### Production

Using gunicorn:
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## Deployment

### Railway / Render / DigitalOcean

1. Push code to GitHub
2. Connect repository to your cloud provider
3. Set environment variables:
   - `FLASK_ENV=production`
   - `SECRET_KEY=<your-secret-key>`
   - `CORS_ORIGINS=https://your-frontend-domain.vercel.app`
4. Deploy!

### Docker (optional)

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

## Database

- SQLite database with 2 tables:
  - `GeoHashEntity`: Maps 3-char hash codes to words (~32K entries)
  - `GeoVocabPremium`: Custom premium mappings
- Automatically initialized from SQL file on first run

## Tech Stack

- **Framework:** Flask 3.0
- **Database:** SQLite with SQLAlchemy
- **Geohash:** python-geohash
- **CORS:** Flask-CORS