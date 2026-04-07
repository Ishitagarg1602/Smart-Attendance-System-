const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User.model');
const Student = require('../models/Student.model');
const Faculty = require('../models/Faculty.model');
const Class = require('../models/Class.model');
const QRSession = require('../models/QRSession.model');
const Attendance = require('../models/Attendance.model');
require('dotenv').config();

// Helper generators for anonymous data
const firstNames = ['Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Cameron', 'Quinn', 'Avery', 'Skylar', 'Dakota', 'Reese', 'Peyton', 'Rowan', 'Charlie', 'Drew', 'Kendall', 'Blake', 'Parker', 'Emerson'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];

const getRandomName = () => {
  const first = firstNames[Math.floor(Math.random() * firstNames.length)];
  const last = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${first} ${last}`;
};

const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Student.deleteMany({});
    await Faculty.deleteMany({});
    await Class.deleteMany({});
    await QRSession.deleteMany({});
    await Attendance.deleteMany({});

    console.log('🗑️  Existing data cleared. Generating fresh anonymous data...');

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

    // Create Anonymous Faculties
    const facultyDocs = [];
    for (let i = 1; i <= 3; i++) {
        const name = `Dr. ${getRandomName()}`;
        const email = `faculty${Math.floor(Math.random() * 9000) + 1000}@test.com`;
        const dept = i === 3 ? 'Electronics' : 'Computer Science';
        const fid = `F${Date.now().toString().slice(-5)}${i}`;

        const u = new User({
            email, password: 'Faculty@123', name, role: 'faculty', department: dept, isActive: true
        });
        await u.save();
        const fac = new Faculty({
            user: u._id, facultyId: fid, designation: 'Professor', department: dept, isHOD: i === 1
        });
        await fac.save();
        facultyDocs.push({ model: fac, email });
    }

    // Create Anonymous Students
    const students = [];
    for (let i = 1; i <= 20; i++) {
      const name = getRandomName();
      const email = `student${Math.floor(Math.random() * 90000) + 10000}@test.com`;
      const studentUser = new User({
        email,
        password: 'Student@123',
        name,
        role: 'student',
        department: i <= 12 ? 'Computer Science' : 'Electronics',
        isActive: true
      });
      await studentUser.save();

      const student = new Student({
        user: studentUser._id,
        studentId: `S${Math.floor(Math.random() * 9000000) + 1000000}`,
        rollNumber: `R${Math.floor(Math.random() * 9000000) + 1000000}`,
        semester: Math.floor(Math.random() * 8) + 1,
        attendanceCount: 0
      });
      await student.save();
      students.push({ model: student, email });
    }

    // Create Classes
    const cseStudents = students.slice(0, 12).map(s => s.model._id);
    const eceStudents = students.slice(12, 20).map(s => s.model._id);

    const classes = [
      new Class({ subjectName: 'Data Structures', subjectCode: `CSE${Math.floor(Math.random()*900)+100}`, faculty: facultyDocs[0].model._id, department: 'Computer Science', semester: 3, classLocation: { lat: 30.12, long: 77.12, roomNumber: 'LH-101' }, schedule: { days: ['Monday', 'Wednesday'], startTime: '10:00', endTime: '11:00' }, studentsEnrolled: cseStudents }),
      new Class({ subjectName: 'DBMS', subjectCode: `CSE${Math.floor(Math.random()*900)+100}`, faculty: facultyDocs[1].model._id, department: 'Computer Science', semester: 4, classLocation: { lat: 30.13, long: 77.13, roomNumber: 'LH-102' }, schedule: { days: ['Tuesday', 'Thursday'], startTime: '11:00', endTime: '12:00' }, studentsEnrolled: cseStudents.slice(0, 6) }),
      new Class({ subjectName: 'Signals & Systems', subjectCode: `ECE${Math.floor(Math.random()*900)+100}`, faculty: facultyDocs[2].model._id, department: 'Electronics', semester: 3, classLocation: { lat: 30.14, long: 77.14, roomNumber: 'LH-103' }, schedule: { days: ['Friday'], startTime: '09:00', endTime: '11:00' }, studentsEnrolled: eceStudents })
    ];

    for (const c of classes) {
      await c.save();
    }
    
    // Enroll classes to faculty
    facultyDocs[0].model.createdClasses = [classes[0]._id]; await facultyDocs[0].model.save();
    facultyDocs[1].model.createdClasses = [classes[1]._id]; await facultyDocs[1].model.save();
    facultyDocs[2].model.createdClasses = [classes[2]._id]; await facultyDocs[2].model.save();

    // Enroll classes to students objects
    for(let i=0; i<12; i++) { students[i].model.enrolledClasses.push(classes[0]._id); if(i<6) students[i].model.enrolledClasses.push(classes[1]._id); await students[i].model.save(); }
    for(let i=12; i<20; i++) { students[i].model.enrolledClasses.push(classes[2]._id); await students[i].model.save(); }

    // Create Dummy Attendance Data spanning the past 5 days
    let totalAtt = 0;
    const now = new Date();
    for (let dayOffset = 5; dayOffset >= 0; dayOffset--) {
        const simDate = new Date(now);
        simDate.setDate(simDate.getDate() - dayOffset);
        
        for (const cls of classes) {
            const session = new QRSession({
                classId: cls._id,
                facultyId: cls.faculty,
                token: `sim_token_${cls.subjectCode}_${dayOffset}_${Math.floor(Math.random()*999)}`,
                expiresAt: new Date(simDate.getTime() + 60*1000),
                isActive: false,
                attendanceMarked: [],
                createdAt: simDate
            });
            await session.save();

            for (const sId of cls.studentsEnrolled) {
                if (Math.random() > 0.3) {
                    const studentObj = students.find(s => s.model._id.toString() === sId.toString());
                    const attendance = new Attendance({
                        sessionId: session._id,
                        studentId: sId,
                        classId: cls._id,
                        status: Math.random() > 0.08 ? 'present' : 'rejected',
                        timestamp: new Date(simDate.getTime() + Math.random()*20000)
                    });
                    if (attendance.status === 'present') {
                        session.attendanceMarked.push(sId);
                        studentObj.model.attendanceCount += 1;
                        await studentObj.model.save();
                    }
                    await attendance.save();
                    totalAtt++;
                }
            }
            await session.save();
        }
    }
    
    console.log('\n📊 Anonymous Seed Data Summary:');
    console.log(`- Admin: 1`);
    console.log(`- Faculty: ${facultyDocs.length}`);
    console.log(`- Students: ${students.length}`);
    console.log(`- Classes: ${classes.length}`);
    console.log(`- Artificial Attendance Scans: ${totalAtt}`);
    console.log('\n🔑 Test Credentials (Randomly Generated):');
    console.log('Admin: admin@test.com / Admin@123');
    console.log('--- Sample Faculty ---');
    console.log(`Login: ${facultyDocs[0].email} / Faculty@123`);
    console.log(`Login: ${facultyDocs[1].email} / Faculty@123`);
    console.log('--- Sample Students ---');
    console.log(`Login: ${students[0].email} / Student@123`);
    console.log(`Login: ${students[1].email} / Student@123`);
    console.log(`Login: ${students[2].email} / Student@123`);
    console.log('NOTE: All passwords are set to Student@123 or Faculty@123');

  } catch (error) {
    console.error('❌ Seed error:', error);
  } finally {
    mongoose.connection.close();
  }
};

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-attendance')
  .then(() => {
    console.log('📦 Connected to MongoDB');
    seedDatabase();
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
  });