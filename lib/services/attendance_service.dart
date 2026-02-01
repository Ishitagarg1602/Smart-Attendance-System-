import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:geolocator/geolocator.dart';
import 'package:smart_attendance/models/attendance_model.dart';
import 'package:smart_attendance/models/qr_session.dart';
import 'package:smart_attendance/models/user_model.dart';
import 'package:smart_attendance/models/class_model.dart';
import 'package:smart_attendance/services/location_service.dart';
import 'package:smart_attendance/services/qr_service.dart';
import 'package:smart_attendance/services/firestore_service.dart';
import 'package:smart_attendance/utils/location_utils.dart';
import 'package:smart_attendance/utils/constants.dart';

class AttendanceService {
  final FirestoreService _firestoreService = FirestoreService();
  final QRService _qrService = QRService();
  final LocationService _locationService = LocationService();

  // Mark attendance with QR validation
  Future<Map<String, dynamic>> markAttendanceWithQR({
    required String qrToken,
    required UserModel student,
    required String deviceId,
  }) async {
    try {
      // Step 1: Validate QR token
      final qrValidation = await _qrService.validateQRSession(
        token: qrToken,
        studentId: student.uid,
      );

      if (!qrValidation['valid']) {
        return {
          'success': false,
          'message': qrValidation['message'],
          'attendance': null,
        };
      }

      final session = qrValidation['session'] as QRSession;

      // Step 2: Get class details
      final classModel = await _firestoreService.getClassById(session.classId);
      if (classModel == null) {
        return {
          'success': false,
          'message': 'Class not found',
          'attendance': null,
        };
      }

      // Step 3: Get current location
      final position = await _locationService.getCurrentPosition();
      if (position == null) {
        return {
          'success': false,
          'message': 'Unable to get location. Please enable location services.',
          'attendance': null,
        };
      }

      // Step 4: Check geofence
      final distance = LocationUtils.calculateDistance(
        position.latitude,
        position.longitude,
        session.classLocation.latitude,
        session.classLocation.longitude,
      );

      final isWithinRadius = distance <= session.radius;
      
      // Step 5: Check if student is enrolled
      if (!classModel.enrolledStudents.contains(student.uid)) {
        return {
          'success': false,
          'message': 'You are not enrolled in this class',
          'attendance': null,
        };
      }

      // Step 6: Determine attendance status
      String status = AppConstants.statusPresent;
      if (!isWithinRadius) {
        status = AppConstants.statusRejected;
      } else {
        // Check if late (within grace period)
        final now = DateTime.now();
        final classTime = session.createdAt; // Session start time
        
        // Assuming class duration is 1 hour
        final classEndTime = classTime.add(Duration(hours: 1));
        final lateThreshold = classTime.add(
          Duration(minutes: AppConstants.attendanceGracePeriodMinutes),
        );

        if (now.isAfter(lateThreshold) && now.isBefore(classEndTime)) {
          status = AppConstants.statusLate;
        } else if (now.isAfter(classEndTime)) {
          return {
            'success': false,
            'message': 'Class has ended',
            'attendance': null,
          };
        }
      }

      // Step 7: Check for mock location
      final isMocked = position.isMocked ?? false;

      // Step 8: Create attendance record
      final attendance = AttendanceRecord(
        attendanceId: '',
        sessionId: session.sessionId,
        studentId: student.uid,
        studentName: student.name,
        classId: session.classId,
        className: classModel.className,
        studentLocation: GeoPoint(
          position.latitude,
          position.longitude,
        ),
        classLocation: session.classLocation,
        distance: distance,
        status: status,
        timestamp: DateTime.now(),
        verified: true,
        deviceId: deviceId,
        isMockLocation: isMocked,
      );

      // Step 9: Save attendance
      final attendanceId = await _firestoreService.markAttendance(attendance);

      // Step 10: Update session with marked attendance
      if (status == AppConstants.statusPresent || 
          status == AppConstants.statusLate) {
        await _firestoreService.markAttendanceInSession(
          session.sessionId,
          student.uid,
        );
      }

      // Step 11: Return result
      return {
        'success': true,
        'message': _getAttendanceMessage(status, distance),
        'attendance': attendance.copyWith(attendanceId: attendanceId),
        'distance': distance,
        'status': status,
        'isMocked': isMocked,
      };
    } catch (e) {
      print('Mark attendance error: $e');
      return {
        'success': false,
        'message': 'An error occurred. Please try again.',
        'attendance': null,
      };
    }
  }

  // Get attendance history for student
  Future<List<AttendanceRecord>> getAttendanceHistory(
    String studentId, {
    DateTime? startDate,
    DateTime? endDate,
    String? classId,
  }) async {
    try {
      List<AttendanceRecord> allRecords = await _firestoreService
          .getAttendanceByStudent(studentId, startDate: startDate, endDate: endDate);

      if (classId != null) {
        allRecords = allRecords
            .where((record) => record.classId == classId)
            .toList();
      }

      return allRecords;
    } catch (e) {
      print('Get attendance history error: $e');
      return [];
    }
  }

  // Get attendance statistics
  Future<Map<String, dynamic>> getAttendanceStatistics(String studentId) async {
    try {
      final stats = await _firestoreService.getAttendanceStats(studentId);
      
      // Get recent attendance
      final recentAttendance = await getAttendanceHistory(studentId, 
        startDate: DateTime.now().subtract(Duration(days: 30)));

      // Calculate streak
      int currentStreak = 0;
      DateTime? lastDate;
      for (var record in recentAttendance) {
        if (record.status == AppConstants.statusPresent || 
            record.status == AppConstants.statusLate) {
          final recordDate = DateTime(
            record.timestamp.year,
            record.timestamp.month,
            record.timestamp.day,
          );
          
          if (lastDate == null) {
            currentStreak = 1;
            lastDate = recordDate;
          } else if (recordDate.difference(lastDate).inDays == 1) {
            currentStreak++;
            lastDate = recordDate;
          } else if (recordDate.difference(lastDate).inDays > 1) {
            break;
          }
        }
      }

      return {
        ...stats,
        'currentStreak': currentStreak,
        'recentCount': recentAttendance.length,
      };
    } catch (e) {
      print('Get attendance statistics error: $e');
      return {
        'total': 0,
        'present': 0,
        'absent': 0,
        'late': 0,
        'attendancePercentage': 0,
        'currentStreak': 0,
        'recentCount': 0,
      };
    }
  }

  // Get class attendance
  Future<List<AttendanceRecord>> getClassAttendance(
    String classId,
    String sessionId,
  ) async {
    try {
      return await _firestoreService.getAttendanceByClass(classId, sessionId);
    } catch (e) {
      print('Get class attendance error: $e');
      return [];
    }
  }

  // Get live attendance stream
  Stream<List<AttendanceRecord>> getLiveAttendanceStream(String sessionId) {
    return _firestoreService.getLiveAttendanceStream(sessionId);
  }

  // Export attendance to CSV
  Future<String> exportAttendanceToCSV(List<AttendanceRecord> records) async {
    try {
      String csv = 'Student ID,Student Name,Class,Status,Time,Distance,Location Verified\n';
      
      for (var record in records) {
        csv += '"${record.studentId}",'
               '"${record.studentName}",'
               '"${record.className}",'
               '"${record.status}",'
               '"${record.timestamp}",'
               '"${record.distance.toStringAsFixed(2)} m",'
               '"${!record.isMockLocation}"\n';
      }
      
      return csv;
    } catch (e) {
      print('Export to CSV error: $e');
      return '';
    }
  }

  // Generate attendance report
  Future<Map<String, dynamic>> generateAttendanceReport({
    required String classId,
    required DateTime startDate,
    required DateTime endDate,
  }) async {
    try {
      // Get all sessions in date range
      final sessionsSnapshot = await FirebaseFirestore.instance
          .collection('qr_sessions')
          .where('classId', isEqualTo: classId)
          .where('createdAt', isGreaterThanOrEqualTo: startDate.toIso8601String())
          .where('createdAt', isLessThanOrEqualTo: endDate.toIso8601String())
          .get();

      final sessions = sessionsSnapshot.docs
          .map((doc) => QRSession.fromMap(doc.data()))
          .toList();

      // Get class details
      final classModel = await _firestoreService.getClassById(classId);
      if (classModel == null) {
        throw Exception('Class not found');
      }

      // Get attendance for each session
      List<Map<String, dynamic>> sessionReports = [];
      int totalPresent = 0;
      int totalAbsent = 0;
      int totalLate = 0;

      for (var session in sessions) {
        final attendance = await getClassAttendance(classId, session.sessionId);
        
        final present = attendance
            .where((a) => a.status == AppConstants.statusPresent)
            .length;
        final late = attendance
            .where((a) => a.status == AppConstants.statusLate)
            .length;
        final absent = classModel.enrolledStudents.length - present - late;

        sessionReports.add({
          'date': session.createdAt,
          'sessionId': session.sessionId,
          'present': present,
          'late': late,
          'absent': absent,
          'total': classModel.enrolledStudents.length,
          'attendanceRate': (present + late) / classModel.enrolledStudents.length * 100,
        });

        totalPresent += present;
        totalAbsent += absent;
        totalLate += late;
      }

      return {
        'classId': classId,
        'className': classModel.className,
        'facultyName': classModel.facultyName,
        'startDate': startDate,
        'endDate': endDate,
        'totalSessions': sessions.length,
        'totalPresent': totalPresent,
        'totalAbsent': totalAbsent,
        'totalLate': totalLate,
        'overallAttendanceRate': sessions.isNotEmpty 
            ? (totalPresent + totalLate) / (sessions.length * classModel.enrolledStudents.length) * 100 
            : 0,
        'sessionReports': sessionReports,
        'enrolledStudents': classModel.enrolledStudents,
      };
    } catch (e) {
      print('Generate report error: $e');
      rethrow;
    }
  }

  // Manual attendance marking (for faculty)
  Future<void> markManualAttendance({
    required String studentId,
    required String classId,
    required String sessionId,
    required String status,
    String? notes,
  }) async {
    try {
      // Get student details
      final student = await _firestoreService.getUser(studentId);
      if (student == null) throw Exception('Student not found');

      // Get class details
      final classModel = await _firestoreService.getClassById(classId);
      if (classModel == null) throw Exception('Class not found');

      // Get session details
      final session = await _qrService.getSessionById(sessionId);
      if (session == null) throw Exception('Session not found');

      // Create attendance record
      final attendance = AttendanceRecord(
        attendanceId: '',
        sessionId: sessionId,
        studentId: studentId,
        studentName: student.name,
        classId: classId,
        className: classModel.className,
        studentLocation: session.classLocation, // Using class location for manual
        classLocation: session.classLocation,
        distance: 0,
        status: status,
        timestamp: DateTime.now(),
        verified: true,
        deviceId: 'manual',
        isMockLocation: false,
      );

      await _firestoreService.markAttendance(attendance);
      
      // Update session
      await _firestoreService.markAttendanceInSession(sessionId, studentId);
    } catch (e) {
      print('Manual attendance error: $e');
      rethrow;
    }
  }

  // Helper method for attendance messages
  String _getAttendanceMessage(String status, double distance) {
    switch (status) {
      case AppConstants.statusPresent:
        return 'Attendance marked successfully! Distance: ${distance.toStringAsFixed(1)}m';
      case AppConstants.statusLate:
        return 'Late attendance marked. Distance: ${distance.toStringAsFixed(1)}m';
      case AppConstants.statusRejected:
        return 'You are too far from the class. Distance: ${distance.toStringAsFixed(1)}m';
      default:
        return 'Attendance could not be marked';
    }
  }
}