import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:provider/provider.dart';
import 'package:smart_attendance/providers/auth_provider.dart';
import 'package:smart_attendance/providers/attendance_provider.dart';
import 'package:smart_attendance/providers/class_provider.dart';
import 'package:smart_attendance/screens/student/login_screen.dart';
import 'package:smart_attendance/screens/faculty/faculty_login.dart';
import 'package:smart_attendance/screens/student/home_screen.dart';
import 'package:smart_attendance/screens/faculty/faculty_dashboard.dart';
import 'package:smart_attendance/utils/theme.dart';
import 'firebase_options.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Firebase
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => AttendanceProvider()),
        ChangeNotifierProvider(create: (_) => ClassProvider()),
      ],
      child: MaterialApp(
        title: 'Smart Attendance System',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        darkTheme: AppTheme.darkTheme,
        themeMode: ThemeMode.light,
        initialRoute: '/',
        routes: {
          '/': (context) => const SplashScreen(),
          '/student-login': (context) => const StudentLoginScreen(),
          '/faculty-login': (context) => const FacultyLoginScreen(),
          '/student-home': (context) => const StudentHomeScreen(),
          '/faculty-dashboard': (context) => const FacultyDashboard(),
        },
      ),
    );
  }
}

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _checkAuthentication();
  }

  Future<void> _checkAuthentication() async {
    await Future.delayed(const Duration(seconds: 2));
    
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final isLoggedIn = await authProvider.checkLoginStatus();
    
    if (isLoggedIn) {
      final user = authProvider.currentUser;
      if (user != null) {
        if (user.userType == 'student') {
          Navigator.pushReplacementNamed(context, '/student-home');
        } else if (user.userType == 'faculty') {
          Navigator.pushReplacementNamed(context, '/faculty-dashboard');
        }
      }
    } else {
      Navigator.pushReplacementNamed(context, '/student-login');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.primary,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Image.asset(
              'assets/images/logo.png',
              height: 120,
              width: 120,
            ),
            const SizedBox(height: 20),
            Text(
              'Smart Attendance',
              style: TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 10),
            Text(
              'QR + GPS Geo-Fencing System',
              style: TextStyle(
                fontSize: 16,
                color: Colors.white.withOpacity(0.8),
              ),
            ),
            const SizedBox(height: 40),
            const CircularProgressIndicator(
              color: Colors.white,
            ),
          ],
        ),
      ),
    );
  }
}