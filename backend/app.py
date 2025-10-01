from flask import Flask, request, jsonify
from flask_cors import CORS
from config import config
from database import Database
from models import GeoHashEntity, GeoVocabPremium
from utils import (
    is_valid_geohash, is_valid_latitude, is_valid_longitude,
    encode_geohash, decode_geohash, split_geohash_into_parts,
    create_response
)
import os

app = Flask(__name__)

# Load configuration
env = os.getenv('FLASK_ENV', 'development')
app.config.from_object(config[env])

# Initialize CORS
CORS(app, resources={r"/api/*": {"origins": app.config['CORS_ORIGINS']}})

# Initialize database
db = Database(app.config['SQLALCHEMY_DATABASE_URI'])
db.init_db()

@app.route('/api/geovocab/latitude/<latitude>/longitude/<longitude>/words', methods=['GET'])
def get_words_from_coordinates(latitude, longitude):
    """Convert coordinates to 3 magic words"""
    try:
        # Validate inputs
        if not is_valid_latitude(latitude):
            return create_response("Invalid Latitude", 400)

        if not is_valid_longitude(longitude):
            return create_response("Invalid Longitude", 400)

        lat = float(latitude)
        lon = float(longitude)

        # Generate geohash
        geohash = encode_geohash(lat, lon, precision=9)
        sub_hashes = split_geohash_into_parts(geohash, 3)

        # Decode geohash to get consistent rounded coordinates
        lat_rounded, lon_rounded = decode_geohash(geohash)

        session = db.get_session()

        try:
            # Check for premium geovocab first
            premium = session.query(GeoVocabPremium).filter_by(geoHash=geohash).first()

            if premium:
                response_data = {
                    'geoVocab': premium.magicwords,
                    'geoHash': geohash,
                    'latitude': lat_rounded,
                    'longitude': lon_rounded
                }
                return create_response("Here's the 3 magic words to your location", 200, response_data)

            # Get regular geovocab
            entities = session.query(GeoHashEntity).filter(
                GeoHashEntity.hashVal.in_(sub_hashes)
            ).all()

            if len(entities) != 3:
                return create_response("Could not generate geovocab for this location", 400)

            # Create word map and build geovocab
            word_map = {e.hashVal: e.word for e in entities}
            geovocab = f"{word_map[sub_hashes[0]]}-{word_map[sub_hashes[1]]}-{word_map[sub_hashes[2]]}"

            response_data = {
                'geoVocab': geovocab,
                'geoHash': geohash,
                'latitude': lat_rounded,
                'longitude': lon_rounded
            }

            return create_response("Here's the 3 magic words to your location", 200, response_data)

        finally:
            session.close()

    except Exception as e:
        return create_response(str(e), 400)

@app.route('/api/geovocab/words/<words>/location', methods=['GET'])
def get_location_from_words(words):
    """Convert 3 magic words to coordinates"""
    try:
        # Validate format
        word_list = words.split('-')
        if len(word_list) != 3:
            return create_response("Kindly enter the right format. Eg. word1-word2-word3", 400)

        session = db.get_session()

        try:
            # Check for premium geovocab first
            premium = session.query(GeoVocabPremium).filter_by(magicwords=words).first()

            if premium:
                lat, lon = decode_geohash(premium.geoHash)
                response_data = {
                    'geoVocab': premium.magicwords,
                    'geoHash': premium.geoHash,
                    'latitude': lat,
                    'longitude': lon
                }
                return create_response("Here's the location pointed by your 3 magic words", 200, response_data)

            # Get regular geovocab entities
            entities = session.query(GeoHashEntity).filter(
                GeoHashEntity.word.in_(word_list)
            ).all()

            if len(entities) != 3:
                return create_response("Could not find a location associated to the geovocab", 400)

            # Build geohash from words
            word_map = {e.word: e.hashVal for e in entities}
            geohash = f"{word_map[word_list[0]]}{word_map[word_list[1]]}{word_map[word_list[2]]}"

            # Decode to lat/lon
            lat, lon = decode_geohash(geohash)

            response_data = {
                'geoVocab': words,
                'geoHash': geohash,
                'latitude': lat,
                'longitude': lon
            }

            return create_response("Here's the location pointed by your 3 magic words", 200, response_data)

        finally:
            session.close()

    except Exception as e:
        return create_response(str(e), 400)

@app.route('/api/geovocab/premium', methods=['POST'])
def create_premium_geovocab():
    """Create a premium geovocab mapping"""
    try:
        data = request.get_json()

        if not data:
            return create_response("Empty request body", 400)

        geohash = data.get('geoHash', '').strip()
        magicwords = data.get('magicwords', '').strip()

        # Validate inputs
        if not geohash:
            return create_response("Empty Geo Hash Value", 400)

        if not magicwords:
            return create_response("Empty Magic Words Value", 400)

        word_list = magicwords.split('-')
        if len(word_list) != 3:
            return create_response("Kindly enter the right format. Eg. word1-word2-word3", 400)

        if not is_valid_geohash(geohash):
            return create_response("Invalid GeoHash", 400)

        if len(geohash) != 9:
            return create_response("Geohash should be 9 characters long", 400)

        session = db.get_session()

        try:
            # Check if words are already mapped
            entities = session.query(GeoHashEntity).filter(
                GeoHashEntity.word.in_(word_list)
            ).all()

            if len(entities) == 3:
                return create_response("These words are already mapped to another location", 400)

            # Create premium geovocab
            premium = GeoVocabPremium(geoHash=geohash, magicwords=magicwords)
            session.add(premium)
            session.commit()

            return create_response("Successfully added a premium GeoVocab", 200, premium.to_dict())

        finally:
            session.close()

    except Exception as e:
        return create_response(str(e), 400)

@app.route('/api/geovocab/geohash/<geohash>', methods=['GET'])
def find_by_geohash(geohash):
    """Find word by geohash (3-character hash part)"""
    session = db.get_session()

    try:
        entity = session.query(GeoHashEntity).filter_by(hashVal=geohash).first()

        if entity:
            return jsonify({
                'message': 'Found',
                'status': 200,
                'data': entity.to_dict()
            })

        return create_response(f"No word found for geohash '{geohash}'", 404)

    except Exception as e:
        return create_response(str(e), 500)
    finally:
        session.close()

@app.route('/api/geovocab/geohashes', methods=['GET'])
def get_all_geohashes():
    """Get all geohash entities (with pagination)"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 100, type=int)

    session = db.get_session()

    try:
        query = session.query(GeoHashEntity)
        total = query.count()
        entities = query.limit(per_page).offset((page - 1) * per_page).all()

        return jsonify({
            'data': [e.to_dict() for e in entities],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': total,
                'pages': (total + per_page - 1) // per_page
            }
        })

    finally:
        session.close()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    session = db.get_session()
    try:
        # Check database connectivity and count records
        total_words = session.query(GeoHashEntity).count()
        total_premium = session.query(GeoVocabPremium).count()

        return jsonify({
            'status': 'healthy',
            'service': 'geovocab-api',
            'database': {
                'connected': True,
                'total_words': total_words,
                'total_premium': total_premium
            }
        })
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'service': 'geovocab-api',
            'error': str(e)
        }), 500
    finally:
        session.close()

@app.teardown_appcontext
def shutdown_session(exception=None):
    db.close_session()

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=app.config['DEBUG'])
