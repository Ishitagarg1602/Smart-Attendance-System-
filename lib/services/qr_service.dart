import 'dart:math';
import 'dart:convert';
import 'package:crypto/crypto.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:smart_attendance/models/qr_session.dart';
import 'package:smart_attendance/utils/constants.dart';

class QRService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // Generate unique QR token
  String _generateToken() {
    final random = Random.secure();
    final values = List<int>.generate(32, (i) => random.nextInt(256));
    return sha256.convert(values).toString().substring(0, 32);
  }

  // Create QR Session
  Future<QRSession> createQRSession({
    required String classId,
    required GeoPoint classLocation,
    required double radius,
  }) async {
    try {
      final token = _generateToken();
      final expiresAt = DateTime.now().add(
        Duration(seconds: AppConstants.qrTokenExpirySeconds),
      );

      final session = QRSession(
        sessionId: '',
        classId: classId,
        token: token,
        classLocation: classLocation,
        radius: radius,
        expiresAt: expiresAt,
        createdAt: DateTime.now(),
        isActive: true,
        markedAttendance: [],
      );

      final sessionId = await _firestore
          .collection('qr_sessions')
          .add(session.toMap())
          .then((docRef) {
        docRef.update({'sessionId': docRef.id});
        return docRef.id;
      });

      return session.copyWith(sessionId: sessionId);
    } catch (e) {
      print('Create QR session error: $e');
      rethrow;
    }
  }

  // Validate QR Token
  Future<Map<String, dynamic>> validateQRSession({
    required String token,
    required String studentId,
  }) async {
    try {
      // Find active session with this token
      final snapshot = await _firestore
          .collection('qr_sessions')
          .where('token', isEqualTo: token)
          .where('isActive', isEqualTo: true)
          .get();

      if (snapshot.docs.isEmpty) {
        return {
          'valid': false,
          'message': 'Invalid or expired QR code',
          'session': null,
        };
      }

      final sessionData = snapshot.docs.first.data();
      final session = QRSession.fromMap(sessionData);

      // Check if expired
      if (!session.isValid) {
        return {
          'valid': false,
          'message': 'QR code has expired',
          'session': null,
        };
      }

      // Check if already marked attendance
      if (session.markedAttendance.contains(studentId)) {
        return {
          'valid': false,
          'message': 'Attendance already marked for this session',
          'session': session,
        };
      }

      return {
        'valid': true,
        'message': 'QR code is valid',
        'session': session,
      };
    } catch (e) {
      print('Validate QR session error: $e');
      return {
        'valid': false,
        'message': 'Error validating QR code',
        'session': null,
      };
    }
  }

  // Get QR Data for display
  Map<String, dynamic> getQRData(QRSession session) {
    final qrData = {
      'token': session.token,
      'sessionId': session.sessionId,
      'classId': session.classId,
      'expiresAt': session.expiresAt.toIso8601String(),
      'timeLeft': session.timeLeft.inSeconds,
    };

    return qrData;
  }

  // Generate QR Code Widget
  QrImageView generateQRCodeWidget(
    String data, {
    double size = 200,
    Color? backgroundColor,
    Color? foregroundColor,
  }) {
    return QrImageView(
      data: jsonEncode(data),
      version: QrVersions.auto,
      size: size,
      backgroundColor: backgroundColor ?? Colors.white,
      foregroundColor: foregroundColor ?? Colors.black,
      padding: const EdgeInsets.all(20),
    );
  }

  // Generate QR Code with logo
  QrImageView generateQRCodeWithLogo(
    String data, {
    double size = 200,
    String? logoPath,
  }) {
    return QrImageView(
      data: jsonEncode(data),
      version: QrVersions.auto,
      size: size,
      backgroundColor: Colors.white,
      foregroundColor: Colors.black,
      padding: const EdgeInsets.all(20),
      embeddedImage: logoPath != null ? AssetImage(logoPath) : null,
      embeddedImageStyle: logoPath != null
          ? QrEmbeddedImageStyle(
              size: Size(size * 0.2, size * 0.2),
            )
          : null,
    );
  }

  // Get active sessions for a class
  Stream<List<QRSession>> getActiveSessionsStream(String classId) {
    return _firestore
        .collection('qr_sessions')
        .where('classId', isEqualTo: classId)
        .where('isActive', isEqualTo: true)
        .where('expiresAt', isGreaterThan: DateTime.now().toIso8601String())
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => QRSession.fromMap(doc.data() as Map<String, dynamic>))
            .toList());
  }

  // Invalidate QR session (when class ends)
  Future<void> invalidateSession(String sessionId) async {
    try {
      await _firestore
          .collection('qr_sessions')
          .doc(sessionId)
          .update({'isActive': false});
    } catch (e) {
      print('Invalidate session error: $e');
    }
  }

  // Get QR session by ID
  Future<QRSession?> getSessionById(String sessionId) async {
    try {
      final doc = await _firestore
          .collection('qr_sessions')
          .doc(sessionId)
          .get();

      if (doc.exists) {
        return QRSession.fromMap(doc.data()!);
      }
      return null;
    } catch (e) {
      print('Get session by ID error: $e');
      return null;
    }
  }

  // Generate QR data string for sharing
  String generateQRDataString(Map<String, dynamic> data) {
    return jsonEncode({
      'type': 'attendance_qr',
      'data': data,
      'timestamp': DateTime.now().toIso8601String(),
      'app': 'Smart Attendance System',
    });
  }

  // Parse QR data string
  Map<String, dynamic>? parseQRDataString(String qrString) {
    try {
      final decoded = jsonDecode(qrString);
      if (decoded['type'] == 'attendance_qr') {
        return decoded['data'];
      }
      return null;
    } catch (e) {
      return null;
    }
  }
}