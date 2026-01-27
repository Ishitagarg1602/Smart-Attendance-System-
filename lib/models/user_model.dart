class UserModel {
  final String uid;
  final String email;
  final String name;
  final String userType; // 'student' or 'faculty' or 'admin'
  final String? studentId;
  final String? facultyId;
  final String? department;
  final String? phoneNumber;
  final String? profileImage;
  final DateTime createdAt;
  final bool isActive;
  final String? deviceId;
  final List<String>? enrolledClasses;

  UserModel({
    required this.uid,
    required this.email,
    required this.name,
    required this.userType,
    this.studentId,
    this.facultyId,
    this.department,
    this.phoneNumber,
    this.profileImage,
    required this.createdAt,
    this.isActive = true,
    this.deviceId,
    this.enrolledClasses,
  });

  // Convert to Map for Firestore
  Map<String, dynamic> toMap() {
    return {
      'uid': uid,
      'email': email,
      'name': name,
      'userType': userType,
      'studentId': studentId,
      'facultyId': facultyId,
      'department': department,
      'phoneNumber': phoneNumber,
      'profileImage': profileImage,
      'createdAt': createdAt.toIso8601String(),
      'isActive': isActive,
      'deviceId': deviceId,
      'enrolledClasses': enrolledClasses,
    };
  }

  // Create from Firestore Document
  factory UserModel.fromMap(Map<String, dynamic> map) {
    return UserModel(
      uid: map['uid'] ?? '',
      email: map['email'] ?? '',
      name: map['name'] ?? '',
      userType: map['userType'] ?? 'student',
      studentId: map['studentId'],
      facultyId: map['facultyId'],
      department: map['department'],
      phoneNumber: map['phoneNumber'],
      profileImage: map['profileImage'],
      createdAt: DateTime.parse(map['createdAt']),
      isActive: map['isActive'] ?? true,
      deviceId: map['deviceId'],
      enrolledClasses: List<String>.from(map['enrolledClasses'] ?? []),
    );
  }

  // Create from Firebase User
  factory UserModel.fromFirebaseUser(
    String uid,
    String email,
    String name, {
    String userType = 'student',
  }) {
    return UserModel(
      uid: uid,
      email: email,
      name: name,
      userType: userType,
      createdAt: DateTime.now(),
    );
  }
}