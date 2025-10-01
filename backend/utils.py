import geohash as gh

BASE_32 = set('0123456789bcdefghjkmnpqrstuvwxyz')

# Geohash precision mapping (length -> decimal places for consistent accuracy)
# 9-char geohash has ±2.4m precision, so we use 6 decimal places (~0.11m precision)
GEOHASH_PRECISION_MAP = {
    9: 6,  # ±2.4m -> 6 decimal places
    8: 5,  # ±19m -> 5 decimal places
    7: 5,  # ±153m -> 5 decimal places
    6: 4,  # ±1.2km -> 4 decimal places
}

def is_valid_geohash(geohash_str):
    """Validate if a string is a valid geohash"""
    if not geohash_str:
        return False
    return all(c in BASE_32 for c in geohash_str.lower())

def is_valid_latitude(lat):
    """Validate latitude is between -90 and 90"""
    try:
        lat_float = float(lat)
        return -90 <= lat_float <= 90
    except (ValueError, TypeError):
        return False

def is_valid_longitude(lon):
    """Validate longitude is between -180 and 180"""
    try:
        lon_float = float(lon)
        return -180 <= lon_float <= 180
    except (ValueError, TypeError):
        return False

def encode_geohash(latitude, longitude, precision=9):
    """Encode lat/lon to geohash with specified precision"""
    return gh.encode(latitude, longitude, precision=precision)

def decode_geohash(geohash_str):
    """
    Decode geohash to lat/lon tuple with appropriate precision
    Returns coordinates rounded to match the geohash accuracy
    """
    lat, lon = gh.decode(geohash_str)

    # Get appropriate decimal places based on geohash length
    geohash_length = len(geohash_str)
    decimal_places = GEOHASH_PRECISION_MAP.get(geohash_length, 6)

    # Round to appropriate precision
    lat = round(lat, decimal_places)
    lon = round(lon, decimal_places)

    return lat, lon

def split_geohash_into_parts(geohash_str, part_length=3):
    """Split a geohash string into equal parts"""
    return [geohash_str[i:i+part_length] for i in range(0, len(geohash_str), part_length)]

def create_response(message, status_code, data=None):
    """Create standardized API response"""
    return {
        'message': message,
        'status': status_code,
        'data': data
    }, status_code
