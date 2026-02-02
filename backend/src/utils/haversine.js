/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in meters
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

/**
 * Check if location is within allowed radius
 * @param {Object} classLocation - Class location {lat, long}
 * @param {Object} studentLocation - Student location {lat, long}
 * @param {number} maxRadius - Maximum allowed radius in meters
 * @returns {Object} {isWithinRadius: boolean, distance: number}
 */
const checkLocationWithinRadius = (classLocation, studentLocation, maxRadius = 20) => {
  const distance = calculateDistance(
    classLocation.lat,
    classLocation.long,
    studentLocation.lat,
    studentLocation.long
  );

  return {
    isWithinRadius: distance <= maxRadius,
    distance: parseFloat(distance.toFixed(2))
  };
};

module.exports = {
  calculateDistance,
  checkLocationWithinRadius
};