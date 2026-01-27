import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/user_model.dart';

class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final GoogleSignIn _googleSignIn = GoogleSignIn();
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  final DeviceInfoPlugin _deviceInfo = DeviceInfoPlugin();

  // Get current user
  User? get currentUser => _auth.currentUser;

  // Stream of authentication state changes
  Stream<User?> get authStateChanges => _auth.authStateChanges();

  // Student Registration
  Future<UserModel?> registerStudent({
    required String email,
    required String password,
    required String name,
    required String studentId,
    required String department,
    required String phoneNumber,
  }) async {
    try {
      // Create user in Firebase Auth
      UserCredential credential = await _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );

      // Get device ID
      String deviceId = await _getDeviceId();

      // Create user in Firestore
      UserModel user = UserModel(
        uid: credential.user!.uid,
        email: email,
        name: name,
        userType: 'student',
        studentId: studentId,
        department: department,
        phoneNumber: phoneNumber,
        createdAt: DateTime.now(),
        deviceId: deviceId,
      );

      await _firestore
          .collection('users')
          .doc(credential.user!.uid)
          .set(user.toMap());

      // Save login info
      await _saveLoginInfo(user);

      return user;
    } catch (e) {
      print('Registration error: $e');
      rethrow;
    }
  }

  // Faculty Registration
  Future<UserModel?> registerFaculty({
    required String email,
    required String password,
    required String name,
    required String facultyId,
    required String department,
    required String phoneNumber,
  }) async {
    try {
      UserCredential credential = await _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );

      UserModel user = UserModel(
        uid: credential.user!.uid,
        email: email,
        name: name,
        userType: 'faculty',
        facultyId: facultyId,
        department: department,
        phoneNumber: phoneNumber,
        createdAt: DateTime.now(),
      );

      await _firestore
          .collection('users')
          .doc(credential.user!.uid)
          .set(user.toMap());

      await _saveLoginInfo(user);

      return user;
    } catch (e) {
      print('Faculty registration error: $e');
      rethrow;
    }
  }

  // Login with Email & Password
  Future<UserModel?> loginWithEmailPassword(
    String email,
    String password,
  ) async {
    try {
      UserCredential credential = await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );

      // Get user data from Firestore
      DocumentSnapshot doc = await _firestore
          .collection('users')
          .doc(credential.user!.uid)
          .get();

      if (doc.exists) {
        UserModel user = UserModel.fromMap(doc.data() as Map<String, dynamic>);
        
        // Update device ID if student
        if (user.userType == 'student') {
          String deviceId = await _getDeviceId();
          await _firestore
              .collection('users')
              .doc(user.uid)
              .update({'deviceId': deviceId});
          user = user.copyWith(deviceId: deviceId);
        }

        await _saveLoginInfo(user);
        return user;
      }
      return null;
    } catch (e) {
      print('Login error: $e');
      rethrow;
    }
  }

  // Google Sign In
  Future<UserModel?> signInWithGoogle() async {
    try {
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      if (googleUser == null) return null;

      final GoogleSignInAuthentication googleAuth =
          await googleUser.authentication;
      final credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      UserCredential userCredential =
          await _auth.signInWithCredential(credential);

      // Check if user exists in Firestore
      DocumentSnapshot doc = await _firestore
          .collection('users')
          .doc(userCredential.user!.uid)
          .get();

      UserModel user;
      if (doc.exists) {
        user = UserModel.fromMap(doc.data() as Map<String, dynamic>);
      } else {
        // Create new user
        user = UserModel(
          uid: userCredential.user!.uid,
          email: userCredential.user!.email!,
          name: userCredential.user!.displayName ?? 'User',
          userType: 'student',
          createdAt: DateTime.now(),
        );

        await _firestore
            .collection('users')
            .doc(user.uid)
            .set(user.toMap());
      }

      await _saveLoginInfo(user);
      return user;
    } catch (e) {
      print('Google sign in error: $e');
      rethrow;
    }
  }

  // Check Login Status
  Future<bool> checkLoginStatus() async {
    try {
      final token = await _storage.read(key: 'auth_token');
      return token != null && _auth.currentUser != null;
    } catch (e) {
      return false;
    }
  }

  // Get Current User Data
  Future<UserModel?> getCurrentUserData() async {
    try {
      if (_auth.currentUser == null) return null;

      DocumentSnapshot doc = await _firestore
          .collection('users')
          .doc(_auth.currentUser!.uid)
          .get();

      if (doc.exists) {
        return UserModel.fromMap(doc.data() as Map<String, dynamic>);
      }
      return null;
    } catch (e) {
      print('Get user data error: $e');
      return null;
    }
  }

  // Logout
  Future<void> logout() async {
    try {
      await _googleSignIn.signOut();
      await _auth.signOut();
      await _storage.deleteAll();
    } catch (e) {
      print('Logout error: $e');
    }
  }

  // Reset Password
  Future<void> resetPassword(String email) async {
    try {
      await _auth.sendPasswordResetEmail(email: email);
    } catch (e) {
      print('Reset password error: $e');
      rethrow;
    }
  }

  // Update Profile
  Future<void> updateProfile({
    required String name,
    required String phoneNumber,
    required String department,
    String? profileImage,
  }) async {
    try {
      if (_auth.currentUser == null) return;

      await _firestore
          .collection('users')
          .doc(_auth.currentUser!.uid)
          .update({
            'name': name,
            'phoneNumber': phoneNumber,
            'department': department,
            if (profileImage != null) 'profileImage': profileImage,
          });
    } catch (e) {
      print('Update profile error: $e');
      rethrow;
    }
  }

  // Private Methods
  Future<String> _getDeviceId() async {
    try {
      if (androidInfo != null) {
        AndroidDeviceInfo androidInfo = await _deviceInfo.androidInfo;
        return androidInfo.id;
      } else {
        IosDeviceInfo iosInfo = await _deviceInfo.iosInfo;
        return iosInfo.identifierForVendor ?? 'ios_device';
      }
    } catch (e) {
      return 'unknown_device_${DateTime.now().millisecondsSinceEpoch}';
    }
  }

  Future<void> _saveLoginInfo(UserModel user) async {
    await _storage.write(key: 'user_uid', value: user.uid);
    await _storage.write(key: 'user_type', value: user.userType);
    await _storage.write(key: 'auth_token', value: 'logged_in');
  }
}