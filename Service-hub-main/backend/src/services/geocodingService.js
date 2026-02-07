/**
 * Simple Geocoding Service
 * This can be expanded to use Google Maps or Mapbox API with a secret token.
 */
class GeocodingService {
    async getCoordinates(address) {
        // MOCK: In a real app, you would call a geocoding API here
        // const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${address}.json?access_token=${process.env.GEOCODING_SECRET_TOKEN}`);

        console.log(`Geocoding address: ${address}`);

        // Returning random coordinates for the mock
        return {
            lat: 28.6139 + (Math.random() - 0.5) * 0.1,
            lng: 77.2090 + (Math.random() - 0.5) * 0.1
        };
    }
}

module.exports = new GeocodingService();
