import 'package:geolocator/geolocator.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:smart_attendance/utils/location_utils.dart';

class LocationService {
  // Check and request location permissions
  static Future<bool> checkAndRequestPermission() async {
    try {
      // Check if location services are enabled
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        // Location services are disabled
        return false;
      }

      // Check permission status
      LocationPermission permission = await Geolocator.checkPermission();
      
      if (permission == LocationPermission.denied) {
        // Request permission
        permission = await Geolocator.requestPermission();
        
        if (permission == LocationPermission.denied) {
          return false;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        // Permission denied forever, show dialog
        return false;
      }

      // Permission granted
      return true;
    } catch (e) {
      print('Permission check error: $e');
      return false;
    }
  }

  // Get current position with high accuracy
  static Future<Position?> getCurrentPosition() async {
    try {
      bool hasPermission = await checkAndRequestPermission();
      if (!hasPermission) {
        return null;
      }

      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
        timeLimit: Duration(seconds: 10),
      );

      // Check for mock location
      bool isMocked = await _checkMockLocation(position);
      if (isMocked) {
        throw Exception('Mock location detected');
      }

      return position;
    } catch (e) {
      print('Get current position error: $e');
      return null;
    }
  }

  // Get position with specific accuracy
  static Future<Position?> getPositionWithAccuracy(
    LocationAccuracy accuracy,
  ) async {
    try {
      bool hasPermission = await checkAndRequestPermission();
      if (!hasPermission) {
        return null;
      }

      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: accuracy,
      );

      bool isMocked = await _checkMockLocation(position);
      if (isMocked) {
        throw Exception('Mock location detected');
      }

      return position;
    } catch (e) {
      print('Get position error: $e');
      return null;
    }
  }

  // Watch position changes
  static Stream<Position> getPositionStream() {
    return Geolocator.getPositionStream(
      desiredAccuracy: LocationAccuracy.high,
      distanceFilter: 10, // Update every 10 meters
    );
  }

  // Check if location is within geofence
  static Future<bool> checkGeofence({
    required double targetLat,
    required double targetLng,
    required double radius,
    Position? currentPosition,
  }) async {
    try {
      Position? position = currentPosition ?? await getCurrentPosition();
      if (position == null) {
        return false;
      }

      return LocationUtils.isWithinRadius(
        userPosition: position,
        targetLat: targetLat,
        targetLng: targetLng,
        radius: radius,
      );
    } catch (e) {
      print('Check geofence error: $e');
      return false;
    }
  }

  // Get distance to target
  static Future<double?> getDistanceTo({
    required double targetLat,
    required double targetLng,
    Position? currentPosition,
  }) async {
    try {
      Position? position = currentPosition ?? await getCurrentPosition();
      if (position == null) {
        return null;
      }

      return LocationUtils.calculateDistance(
        position.latitude,
        position.longitude,
        targetLat,
        targetLng,
      );
    } catch (e) {
      print('Get distance error: $e');
      return null;
    }
  }

  // Get formatted address from coordinates
  static Future<String?> getAddressFromCoordinates(
    double lat,
    double lng,
  ) async {
    try {
      return await LocationUtils.getAddressFromCoordinates(lat, lng);
    } catch (e) {
      print('Get address error: $e');
      return null;
    }
  }

  // Check location accuracy
  static Future<double?> getLocationAccuracy() async {
    try {
      Position? position = await getPositionWithAccuracy(LocationAccuracy.high);
      return position?.accuracy;
    } catch (e) {
      return null;
    }
  }

  // Check if location services are enabled
  static Future<bool> isLocationEnabled() async {
    return await Geolocator.isLocationServiceEnabled();
  }

  // Open location settings
  static Future<void> openLocationSettings() async {
    await Geolocator.openLocationSettings();
  }

  // Open app settings for permission
  static Future<void> openAppSettings() async {
    await openAppSettings();
  }

  // Calculate bearing between two points
  static double calculateBearing(
    double startLat,
    double startLng,
    double endLat,
    double endLng,
  ) {
    final startLatRad = startLat * (pi / 180);
    final startLngRad = startLng * (pi / 180);
    final endLatRad = endLat * (pi / 180);
    final endLngRad = endLng * (pi / 180);

    final y = sin(endLngRad - startLngRad) * cos(endLatRad);
    final x = cos(startLatRad) * sin(endLatRad) -
        sin(startLatRad) * cos(endLatRad) * cos(endLngRad - startLngRad);

    final bearing = atan2(y, x) * (180 / pi);
    return (bearing + 360) % 360;
  }

  // Check if location is stationary
  static bool isStationary(List<Position> positions, {double threshold = 5.0}) {
    if (positions.length < 2) return true;

    double totalDistance = 0;
    for (int i = 1; i < positions.length; i++) {
      totalDistance += LocationUtils.calculateDistance(
        positions[i - 1].latitude,
        positions[i - 1].longitude,
        positions[i].latitude,
        positions[i].longitude,
      );
    }

    return totalDistance < threshold;
  }

  // Private method to check mock location
  static Future<bool> _checkMockLocation(Position position) async {
    try {
      // Platform-specific mock location detection
      // For Android
      if (position.isMocked != null) {
        return position.isMocked!;
      }

      // Additional checks
      final accuracy = position.accuracy;
      if (accuracy != null && accuracy > 1000) {
        // Suspiciously high accuracy error
        return true;
      }

      // Check speed (if stationary but location changes dramatically)
      return false;
    } catch (e) {
      return false;
    }
  }

  // Get last known position
  static Future<Position?> getLastKnownPosition() async {
    try {
      return await Geolocator.getLastKnownPosition();
    } catch (e) {
      return null;
    }
  }
}