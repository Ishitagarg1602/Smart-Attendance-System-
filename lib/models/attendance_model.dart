import 'package:cloud_firestore/cloud_firestore.dart';

class AttendanceRecord {
  final String attendanceId;
  final String sessionId;
  final String studentId;
  final String studentName;
  final String classId;
  final String className;
  final GeoPoint studentLocation;
  final GeoPoint classLocation;
  final double distance; // in meters
  final String status; // 'present', 'absent', 'late', 'rejected'
  final DateTime timestamp;
  final bool verified;
  final String? deviceId;
  final bool isMockLocation;

  AttendanceRecord({
    required this.attendanceId,
    required this.sessionId,
    required this.studentId,
    required this.studentName,
    required this.classId,
    required this.className,
    required this.studentLocation,
    required this.classLocation,
    required this.distance,
    required this.status,
    required this.timestamp,
    this.verified = false,
    this.deviceId,
    this.isMockLocation = false,
  });

  Map<String, dynamic> toMap() {
    return {
      'attendanceId': attendanceId,
      'sessionId': sessionId,
      'studentId': studentId,
      'studentName': studentName,
      'classId': classId,
      'className': className,
      'studentLocation': studentLocation,
      'classLocation': classLocation,
      'distance': distance,
      'status': status,
      'timestamp': timestamp.toIso8601String(),
      'verified': verified,
      'deviceId': deviceId,
      'isMockLocation': isMockLocation,
    };
  }

  factory AttendanceRecord.fromMap(Map<String, dynamic> map) {
    return AttendanceRecord(
      attendanceId: map['attendanceId'],
      sessionId: map['sessionId'],
      studentId: map['studentId'],
      studentName: map['studentName'],
      classId: map['classId'],
      className: map['className'],
      studentLocation: map['studentLocation'],
      classLocation: map['classLocation'],
      distance: map['distance']?.toDouble() ?? 0.0,
      status: map['status'],
      timestamp: DateTime.parse(map['timestamp']),
      verified: map['verified'] ?? false,
      deviceId: map['deviceId'],
      isMockLocation: map['isMockLocation'] ?? false,
    );
  }
}