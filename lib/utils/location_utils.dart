import 'dart:math';
import 'package:geolocator/geolocator.dart';

class LocationUtils {
  // Calculate distance between two coordinates in meters
  static double calculateDistance(
    double lat1,
    double lon1,
    double lat2,
    double lon2,
  ) {
    const earthRadius = 6371e3; // Earth's radius in meters

    final phi1 = lat1 * pi / 180;
    final phi2 = lat2 * pi / 180;
    final deltaPhi = (lat2 - lat1) * pi / 180;
    final deltaLambda = (lon2 - lon1) * pi / 180;

    final a = sin(deltaPhi / 2) * sin(deltaPhi / 2) +
        cos(phi1) * cos(phi2) *
            sin(deltaLambda / 2) * sin(deltaLambda / 2);
    
    final c = 2 * atan2(sqrt(a), sqrt(1 - a));

    return earthRadius * c;
  }

  // Check if location is within radius
  static bool isWithinRadius({
    required Position userPosition,
    required double targetLat,
    required double targetLng,
    required double radius,
  }) {
    final distance = calculateDistance(
      userPosition.latitude,
      userPosition.longitude,
      targetLat,
      targetLng,
    );
    return distance <= radius;
  }

  // Get formatted distance string
  static String getFormattedDistance(double distanceInMeters) {
    if (distanceInMeters < 1000) {
      return '${distanceInMeters.toStringAsFixed(0)} m';
    } else {
      return '${(distanceInMeters / 1000).toStringAsFixed(1)} km';
    }
  }

  // Check location permissions
  static Future<bool> checkLocationPermission() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      return false;
    }

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        return false;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      return false;
    }

    return true;
  }

  // Get current position with timeout
  static Future<Position?> getCurrentPosition({
    Duration timeout = const Duration(seconds: 10),
  }) async {
    try {
      return await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
        timeLimit: timeout,
      );
    } catch (e) {
      print('Error getting position: $e');
      return null;
    }
  }

  // Check for mock location (Android)
  static Future<bool> checkMockLocation(Position position) async {
    try {
      // This is a basic check - you might need platform-specific implementation
      return position.isMocked ?? false;
    } catch (e) {
      return false;
    }
  }

  // Get address from coordinates
  static Future<String?> getAddressFromCoordinates(
    double lat,
    double lng,
  ) async {
    try {
      final placemarks = await Geolocator.placemarkFromCoordinates(lat, lng);
      if (placemarks.isNotEmpty) {
        final placemark = placemarks.first;
        return '${placemark.street}, ${placemark.locality}, ${placemark.administrativeArea}';
      }
      return null;
    } catch (e) {
      return null;
    }
  }
}