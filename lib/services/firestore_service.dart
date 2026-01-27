import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:smart_attendance/models/user_model.dart';
import 'package:smart_attendance/models/class_model.dart';
import 'package:smart_attendance/models/qr_session.dart';
import 'package:smart_attendance/models/attendance_model.dart';

class FirestoreService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // ========== USER OPERATIONS ==========
  Future<UserModel?> getUser(String uid) async {
    try {
      DocumentSnapshot doc = await _firestore.collection('users').doc(uid).get();
      if (doc.exists) {
        return UserModel.fromMap(doc.data() as Map<String, dynamic>);
      }
      return null;
    } catch (e) {
      print('Get user error: $e');
      return null;
    }
  }

  Future<void> updateUser(String uid, Map<String, dynamic> data) async {
    try {
      await _firestore.collection('users').doc(uid).update(data);
    } catch (e) {
      print('Update user error: $e');
      rethrow;
    }
  }

  // ========== CLASS OPERATIONS ==========
  Future<String> createClass(ClassModel classModel) async {
    try {
      DocumentReference docRef = await _firestore
          .collection('classes')
          .add(classModel.toMap());
      
      await docRef.update({'classId': docRef.id});
      return docRef.id;
    } catch (e) {
      print('Create class error: $e');
      rethrow;
    }
  }

  Future<List<ClassModel>> getClassesByFaculty(String facultyId) async {
    try {
      QuerySnapshot snapshot = await _firestore
          .collection('classes')
          .where('facultyId', isEqualTo: facultyId)
          .where('isActive', isEqualTo: true)
          .get();

      return snapshot.docs
          .map((doc) => ClassModel.fromMap(doc.data() as Map<String, dynamic>))
          .toList();
    } catch (e) {
      print('Get classes error: $e');
      return [];
    }
  }

  Future<List<ClassModel>> getStudentClasses(List<String> classIds) async {
    try {
      if (classIds.isEmpty) return [];

      QuerySnapshot snapshot = await _firestore
          .collection('classes')
          .where('classId', whereIn: classIds)
          .where('isActive', isEqualTo: true)
          .get();

      return snapshot.docs
          .map((doc) => ClassModel.fromMap(doc.data() as Map<String, dynamic>))
          .toList();
    } catch (e) {
      print('Get student classes error: $e');
      return [];
    }
  }

  Future<ClassModel?> getClassById(String classId) async {
    try {
      DocumentSnapshot doc = await _firestore
          .collection('classes')
          .doc(classId)
          .get();

      if (doc.exists) {
        return ClassModel.fromMap(doc.data() as Map<String, dynamic>);
      }
      return null;
    } catch (e) {
      print('Get class by ID error: $e');
      return null;
    }
  }

  // ========== QR SESSION OPERATIONS ==========
  Future<String> createQRSession(QRSession session) async {
    try {
      DocumentReference docRef = await _firestore
          .collection('qr_sessions')
          .add(session.toMap());
      
      await docRef.update({'sessionId': docRef.id});
      return docRef.id;
    } catch (e) {
      print('Create QR session error: $e');
      rethrow;
    }
  }

  Future<QRSession?> getQRSession(String sessionId) async {
    try {
      QuerySnapshot snapshot = await _firestore
          .collection('qr_sessions')
          .where('sessionId', isEqualTo: sessionId)
          .where('isActive', isEqualTo: true)
          .get();

      if (snapshot.docs.isNotEmpty) {
        return QRSession.fromMap(
            snapshot.docs.first.data() as Map<String, dynamic>);
      }
      return null;
    } catch (e) {
      print('Get QR session error: $e');
      return null;
    }
  }

  Future<List<QRSession>> getActiveSessionsByClass(String classId) async {
    try {
      QuerySnapshot snapshot = await _firestore
          .collection('qr_sessions')
          .where('classId', isEqualTo: classId)
          .where('isActive', isEqualTo: true)
          .where('expiresAt', isGreaterThan: DateTime.now().toIso8601String())
          .get();

      return snapshot.docs
          .map((doc) => QRSession.fromMap(doc.data() as Map<String, dynamic>))
          .toList();
    } catch (e) {
      print('Get active sessions error: $e');
      return [];
    }
  }

  Future<void> markAttendanceInSession(
    String sessionId,
    String studentId,
  ) async {
    try {
      QuerySnapshot snapshot = await _firestore
          .collection('qr_sessions')
          .where('sessionId', isEqualTo: sessionId)
          .get();

      if (snapshot.docs.isNotEmpty) {
        DocumentReference docRef = snapshot.docs.first.reference;
        await docRef.update({
          'markedAttendance': FieldValue.arrayUnion([studentId])
        });
      }
    } catch (e) {
      print('Mark attendance in session error: $e');
      rethrow;
    }
  }

  // ========== ATTENDANCE OPERATIONS ==========
  Future<String> markAttendance(AttendanceRecord attendance) async {
    try {
      DocumentReference docRef = await _firestore
          .collection('attendance')
          .add(attendance.toMap());
      
      await docRef.update({'attendanceId': docRef.id});
      return docRef.id;
    } catch (e) {
      print('Mark attendance error: $e');
      rethrow;
    }
  }

  Future<List<AttendanceRecord>> getAttendanceByStudent(
    String studentId, {
    DateTime? startDate,
    DateTime? endDate,
  }) async {
    try {
      Query query = _firestore
          .collection('attendance')
          .where('studentId', isEqualTo: studentId)
          .orderBy('timestamp', descending: true);

      if (startDate != null) {
        query = query.where('timestamp',
            isGreaterThanOrEqualTo: startDate.toIso8601String());
      }
      if (endDate != null) {
        query = query.where('timestamp',
            isLessThanOrEqualTo: endDate.toIso8601String());
      }

      QuerySnapshot snapshot = await query.limit(100).get();

      return snapshot.docs
          .map((doc) =>
              AttendanceRecord.fromMap(doc.data() as Map<String, dynamic>))
          .toList();
    } catch (e) {
      print('Get attendance by student error: $e');
      return [];
    }
  }

  Future<List<AttendanceRecord>> getAttendanceByClass(
    String classId,
    String sessionId,
  ) async {
    try {
      QuerySnapshot snapshot = await _firestore
          .collection('attendance')
          .where('classId', isEqualTo: classId)
          .where('sessionId', isEqualTo: sessionId)
          .orderBy('timestamp')
          .get();

      return snapshot.docs
          .map((doc) =>
              AttendanceRecord.fromMap(doc.data() as Map<String, dynamic>))
          .toList();
    } catch (e) {
      print('Get attendance by class error: $e');
      return [];
    }
  }

  Future<Map<String, dynamic>> getAttendanceStats(String studentId) async {
    try {
      DateTime startOfMonth = DateTime(
        DateTime.now().year,
        DateTime.now().month,
        1,
      );

      QuerySnapshot snapshot = await _firestore
          .collection('attendance')
          .where('studentId', isEqualTo: studentId)
          .where('timestamp',
              isGreaterThanOrEqualTo: startOfMonth.toIso8601String())
          .get();

      int total = snapshot.docs.length;
      int present = snapshot.docs
          .where((doc) =>
              (doc.data() as Map<String, dynamic>)['status'] == 'present')
          .length;
      int absent = snapshot.docs
          .where((doc) =>
              (doc.data() as Map<String, dynamic>)['status'] == 'absent')
          .length;
      int late = snapshot.docs
          .where((doc) =>
              (doc.data() as Map<String, dynamic>)['status'] == 'late')
          .length;

      return {
        'total': total,
        'present': present,
        'absent': absent,
        'late': late,
        'attendancePercentage': total > 0 ? (present / total * 100) : 0,
      };
    } catch (e) {
      print('Get attendance stats error: $e');
      return {
        'total': 0,
        'present': 0,
        'absent': 0,
        'late': 0,
        'attendancePercentage': 0,
      };
    }
  }

  // ========== ANALYTICS ==========
  Future<Map<String, dynamic>> getClassAnalytics(String classId) async {
    try {
      QuerySnapshot snapshot = await _firestore
          .collection('attendance')
          .where('classId', isEqualTo: classId)
          .get();

      int totalStudents = snapshot.docs.length;
      int present = snapshot.docs
          .where((doc) =>
              (doc.data() as Map<String, dynamic>)['status'] == 'present')
          .length;

      // Group by date
      Map<String, int> dailyAttendance = {};
      for (var doc in snapshot.docs) {
        var data = doc.data() as Map<String, dynamic>;
        String date = DateTime.parse(data['timestamp'])
            .toIso8601String()
            .split('T')[0];
        dailyAttendance[date] = (dailyAttendance[date] ?? 0) + 1;
      }

      return {
        'totalStudents': totalStudents,
        'presentCount': present,
        'attendanceRate': totalStudents > 0 ? (present / totalStudents * 100) : 0,
        'dailyAttendance': dailyAttendance,
      };
    } catch (e) {
      print('Get class analytics error: $e');
      return {
        'totalStudents': 0,
        'presentCount': 0,
        'attendanceRate': 0,
        'dailyAttendance': {},
      };
    }
  }

  // ========== REAL-TIME LISTENERS ==========
  Stream<List<AttendanceRecord>> getLiveAttendanceStream(String sessionId) {
    return _firestore
        .collection('attendance')
        .where('sessionId', isEqualTo: sessionId)
        .orderBy('timestamp', descending: true)
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) =>
                AttendanceRecord.fromMap(doc.data() as Map<String, dynamic>))
            .toList());
  }

  Stream<List<QRSession>> getActiveSessionsStream(String classId) {
    return _firestore
        .collection('qr_sessions')
        .where('classId', isEqualTo: classId)
        .where('isActive', isEqualTo: true)
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => QRSession.fromMap(doc.data() as Map<String, dynamic>))
            .toList());
  }
}