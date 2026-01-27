class AppConstants {
  // API & Firebase
  static const String firebaseProjectId = 'smart-attendance-12345';
  
  // Collections
  static const String usersCollection = 'users';
  static const String classesCollection = 'classes';
  static const String qrSessionsCollection = 'qr_sessions';
  static const String attendanceCollection = 'attendance';
  static const String devicesCollection = 'devices';
  
  // Storage
  static const String profileImagesPath = 'profile_images/';
  static const String qrCodesPath = 'qr_codes/';
  
  // QR Code
  static const int qrTokenExpirySeconds = 60; // QR valid for 60 seconds
  static const int qrRefreshSeconds = 30; // Generate new QR every 30 seconds
  
  // Geo-fencing
  static const double defaultGeoFenceRadius = 20.0; // 20 meters
  static const double maxAllowedDistance = 50.0; // 50 meters
  
  // Time
  static const int attendanceGracePeriodMinutes = 10; // Allow 10 minutes late
  
  // Status
  static const String statusPresent = 'present';
  static const String statusAbsent = 'absent';
  static const String statusLate = 'late';
  static const String statusRejected = 'rejected';
  
  // User Types
  static const String userTypeStudent = 'student';
  static const String userTypeFaculty = 'faculty';
  static const String userTypeAdmin = 'admin';
  
  // Departments
  static const List<String> departments = [
    'Computer Science',
    'Information Technology',
    'Electronics',
    'Mechanical',
    'Civil',
    'Electrical',
    'MBA',
    'MCA',
  ];
  
  // Semesters
  static const List<String> semesters = [
    'Semester 1',
    'Semester 2',
    'Semester 3',
    'Semester 4',
    'Semester 5',
    'Semester 6',
    'Semester 7',
    'Semester 8',
  ];
  
  // Days
  static const List<String> days = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  
  // Time Slots
  static const Map<String, String> timeSlots = {
    '1': '08:00 - 09:00',
    '2': '09:00 - 10:00',
    '3': '10:00 - 11:00',
    '4': '11:00 - 12:00',
    '5': '12:00 - 13:00',
    '6': '14:00 - 15:00',
    '7': '15:00 - 16:00',
    '8': '16:00 - 17:00',
  };
}

class RouteConstants {
  static const String splash = '/';
  static const String studentLogin = '/student-login';
  static const String facultyLogin = '/faculty-login';
  static const String studentHome = '/student-home';
  static const String facultyDashboard = '/faculty-dashboard';
  static const String scanQR = '/scan-qr';
  static const String attendanceHistory = '/attendance-history';
  static const String profile = '/profile';
  static const String createClass = '/create-class';
  static const String liveQR = '/live-qr';
  static const String attendanceView = '/attendance-view';
  static const String analytics = '/analytics';
}

class AssetConstants {
  static const String logo = 'assets/images/logo.png';
  static const String splashAnimation = 'assets/animations/splash.json';
  static const String successAnimation = 'assets/animations/success.json';
  static const String errorAnimation = 'assets/animations/error.json';
  static const String qrAnimation = 'assets/animations/qr_scan.json';
  static const String locationAnimation = 'assets/animations/location.json';
  
  static const String defaultProfile = 'assets/images/default_profile.png';
  static const String facultyIcon = 'assets/images/faculty_icon.png';
  static const String studentIcon = 'assets/images/student_icon.png';
  
  static const String bgPattern = 'assets/images/bg_pattern.png';
  static const String loginBg = 'assets/images/login_bg.png';
}