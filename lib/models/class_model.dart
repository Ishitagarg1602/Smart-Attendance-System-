class ClassModel {
  final String classId;
  final String className;
  final String subjectCode;
  final String facultyId;
  final String facultyName;
  final String department;
  final String semester;
  final List<String> enrolledStudents;
  final GeoPoint location;
  final double radius; // in meters
  final String roomNumber;
  final Map<String, dynamic> schedule; // day -> time
  final bool isActive;
  final DateTime createdAt;

  ClassModel({
    required this.classId,
    required this.className,
    required this.subjectCode,
    required this.facultyId,
    required this.facultyName,
    required this.department,
    required this.semester,
    required this.enrolledStudents,
    required this.location,
    this.radius = 20.0,
    required this.roomNumber,
    required this.schedule,
    this.isActive = true,
    required this.createdAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'classId': classId,
      'className': className,
      'subjectCode': subjectCode,
      'facultyId': facultyId,
      'facultyName': facultyName,
      'department': department,
      'semester': semester,
      'enrolledStudents': enrolledStudents,
      'location': location,
      'radius': radius,
      'roomNumber': roomNumber,
      'schedule': schedule,
      'isActive': isActive,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  factory ClassModel.fromMap(Map<String, dynamic> map) {
    return ClassModel(
      classId: map['classId'],
      className: map['className'],
      subjectCode: map['subjectCode'],
      facultyId: map['facultyId'],
      facultyName: map['facultyName'],
      department: map['department'],
      semester: map['semester'],
      enrolledStudents: List<String>.from(map['enrolledStudents'] ?? []),
      location: map['location'],
      radius: map['radius']?.toDouble() ?? 20.0,
      roomNumber: map['roomNumber'],
      schedule: Map<String, dynamic>.from(map['schedule'] ?? {}),
      isActive: map['isActive'] ?? true,
      createdAt: DateTime.parse(map['createdAt']),
    );
  }
}