class Validators {
  static String? validateEmail(String? value) {
    if (value == null || value.isEmpty) {
      return 'Email is required';
    }
    final emailRegex = RegExp(
        r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$');
    if (!emailRegex.hasMatch(value)) {
      return 'Enter a valid email address';
    }
    return null;
  }

  static String? validatePassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'Password is required';
    }
    if (value.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return null;
  }

  static String? validateName(String? value) {
    if (value == null || value.isEmpty) {
      return 'Name is required';
    }
    if (value.length < 2) {
      return 'Name must be at least 2 characters';
    }
    return null;
  }

  static String? validateStudentId(String? value) {
    if (value == null || value.isEmpty) {
      return 'Student ID is required';
    }
    if (value.length < 5) {
      return 'Enter a valid student ID';
    }
    return null;
  }

  static String? validatePhone(String? value) {
    if (value == null || value.isEmpty) {
      return 'Phone number is required';
    }
    final phoneRegex = RegExp(r'^[0-9]{10}$');
    if (!phoneRegex.hasMatch(value)) {
      return 'Enter a valid 10-digit phone number';
    }
    return null;
  }

  static String? validateDepartment(String? value) {
    if (value == null || value.isEmpty) {
      return 'Department is required';
    }
    return null;
  }

  static String? validateClassName(String? value) {
    if (value == null || value.isEmpty) {
      return 'Class name is required';
    }
    if (value.length < 3) {
      return 'Class name must be at least 3 characters';
    }
    return null;
  }

  static String? validateSubjectCode(String? value) {
    if (value == null || value.isEmpty) {
      return 'Subject code is required';
    }
    return null;
  }

  static String? validateRoomNumber(String? value) {
    if (value == null || value.isEmpty) {
      return 'Room number is required';
    }
    return null;
  }

  static String? validateLatitude(String? value) {
    if (value == null || value.isEmpty) {
      return 'Latitude is required';
    }
    final lat = double.tryParse(value);
    if (lat == null || lat < -90 || lat > 90) {
      return 'Enter valid latitude (-90 to 90)';
    }
    return null;
  }

  static String? validateLongitude(String? value) {
    if (value == null || value.isEmpty) {
      return 'Longitude is required';
    }
    final lng = double.tryParse(value);
    if (lng == null || lng < -180 || lng > 180) {
      return 'Enter valid longitude (-180 to 180)';
    }
    return null;
  }
}