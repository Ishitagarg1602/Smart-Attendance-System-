const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User.model');
const Student = require('../models/Student.model');
const Faculty = require('../models/Faculty.model');
const Class = require('../models/Class.model');
require('dotenv').config();

const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Student.deleteMany({});
    await Faculty.deleteMany({});
    await Class.deleteMany({});

    console.log('🗑️  Existing data cleared');

    // Create Admin
    const admin = new User({
      email: 'admin@test.com',
      password: 'Admin@123',
      name: 'System Administrator',
      role: 'admin',
      department: 'Administration',
      isActive: true
    });
    await admin.save();
    console.log('✅ Admin created');

    // Create Faculty
    const facultyUser = new User({
      email: 'faculty@test.com',
      password: 'Faculty@123',
      name: 'Dr. Rajesh Kumar',
      role: 'faculty',
      department: 'Computer Science',
      isActive: true
    });
    await facultyUser.save();

    const faculty = new Faculty({
      user: facultyUser._id,
      facultyId: 'F2023001',
      designation: 'Professor',
      department: 'Computer Science',
      isHOD: true
    });
    await faculty.save();
    console.log('✅ Faculty created');

    // Create Students
    const students = [];
    for (let i = 1; i <= 10; i++) {
      const studentUser = new User({
        email: `student${i}@test.com`,
        password: 'Student@123',
        name: `Student ${i}`,
        role: 'student',
        department: 'Computer Science',
        isActive: true
      });
      await studentUser.save();

      const student = new Student({
        user: studentUser._id,
        studentId: `S2023${String(i).padStart(3, '0')}`,
        rollNumber: `R2023${String(i).padStart(3, '0')}`,
        semester: Math.floor(Math.random() * 8) + 1
      });
      await student.save();
      students.push(student);
    }
    console.log('✅ 10 Students created');

    // Create Classes
    const class1 = new Class({
      subjectName: 'Data Structures and Algorithms',
      subjectCode: 'CSE101',
      faculty: faculty._id,
      department: 'Computer Science',
      semester: 3,
      classLocation: {
        lat: 30.123456,
        long: 77.123456,
        roomNumber: 'LH-101'
      },
      schedule: {
        days: ['Monday', 'Wednesday', 'Friday'],
        startTime: '10:00',
        endTime: '11:30'
      },
      studentsEnrolled: students.slice(0, 8).map(s => s._id)
    });
    await class1.save();

    const class2 = new Class({
      subjectName: 'Database Management Systems',
      subjectCode: 'CSE102',
      faculty: faculty._id,
      department: 'Computer Science',
      semester: 4,
      classLocation: {
        lat: 30.123789,
        long: 77.123789,
        roomNumber: 'LH-102'
      },
      schedule: {
        days: ['Tuesday', 'Thursday'],
        startTime: '14:00',
        endTime: '15:30'
      },
      studentsEnrolled: students.slice(5, 10).map(s => s._id)
    });
    await class2.save();

    const class3 = new Class({
      subjectName: 'Operating Systems',
      subjectCode: 'CSE103',
      faculty: faculty._id,
      department: 'Computer Science',
      semester: 4,
      classLocation: {
        lat: 30.124456,
        long: 77.124456,
        roomNumber: 'LH-103'
      },
      schedule: {
        days: ['Monday', 'Thursday'],
        startTime: '09:00',
        endTime: '10:30'
      },
      studentsEnrolled: students.slice(2, 7).map(s => s._id)
    });
    await class3.save();

    // Update faculty's created classes
    faculty.createdClasses = [class1._id, class2._id, class3._id];
    await faculty.save();

    // Update students' enrolled classes
    for (let i = 0; i < students.length; i++) {
      if (i < 8) {
        students[i].enrolledClasses.push(class1._id);
      }
      if (i >= 5 && i < 10) {
        students[i].enrolledClasses.push(class2._id);
      }
      if (i >= 2 && i < 7) {
        students[i].enrolledClasses.push(class3._id);
      }
      await students[i].save();
    }

    console.log('✅ 3 Classes created');
    console.log('\n📊 Seed Data Summary:');
    console.log(`- Admin: 1`);
    console.log(`- Faculty: 1`);
    console.log(`- Students: 10`);
    console.log(`- Classes: 3`);
    console.log('\n🔑 Test Credentials:');
    console.log('Admin: admin@test.com / Admin@123');
    console.log('Faculty: faculty@test.com / Faculty@123');
    console.log('Students: student1@test.com to student10@test.com / Student@123');
    console.log('\n📍 Class Locations (for testing GPS):');
    console.log('LH-101: 30.123456, 77.123456');
    console.log('LH-102: 30.123789, 77.123789');
    console.log('LH-103: 30.124456, 77.124456');

  } catch (error) {
    console.error('❌ Seed error:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Connect to MongoDB and run seed
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-attendance')
  .then(() => {
    console.log('📦 Connected to MongoDB');
    seedDatabase();
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
  });