import 'package:cloud_firestore/cloud_firestore.dart';

class QRSession {
  final String sessionId;
  final String classId;
  final String token;
  final GeoPoint classLocation;
  final double radius;
  final DateTime expiresAt;
  final DateTime createdAt;
  final bool isActive;
  final List<String> markedAttendance; // student IDs who have marked attendance

  QRSession({
    required this.sessionId,
    required this.classId,
    required this.token,
    required this.classLocation,
    this.radius = 20.0,
    required this.expiresAt,
    required this.createdAt,
    this.isActive = true,
    this.markedAttendance = const [],
  });

  Map<String, dynamic> toMap() {
    return {
      'sessionId': sessionId,
      'classId': classId,
      'token': token,
      'classLocation': classLocation,
      'radius': radius,
      'expiresAt': expiresAt.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
      'isActive': isActive,
      'markedAttendance': markedAttendance,
    };
  }

  factory QRSession.fromMap(Map<String, dynamic> map) {
    return QRSession(
      sessionId: map['sessionId'],
      classId: map['classId'],
      token: map['token'],
      classLocation: map['classLocation'],
      radius: map['radius']?.toDouble() ?? 20.0,
      expiresAt: DateTime.parse(map['expiresAt']),
      createdAt: DateTime.parse(map['createdAt']),
      isActive: map['isActive'] ?? true,
      markedAttendance: List<String>.from(map['markedAttendance'] ?? []),
    );
  }

  bool get isValid => isActive && DateTime.now().isBefore(expiresAt);
  Duration get timeLeft => expiresAt.difference(DateTime.now());
}