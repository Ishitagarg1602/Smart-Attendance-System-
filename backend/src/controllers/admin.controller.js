const User = require('../models/User.model');
const Student = require('../models/Student.model');
const Faculty = require('../models/Faculty.model');

// Create user directly, bypassing public registration token generation
exports.createUser = async (req, res) => {
  let createdUser = null;
  try {
    const { email, password, name, role, department, studentId, facultyId, rollNumber, designation, semester } = req.body;

    const user = new User({ email, password, name, role, department });
    createdUser = await user.save();

    if (role === 'student') {
      const student = new Student({
        user: user._id,
        studentId: studentId || `S${Date.now().toString().slice(-7)}`,
        rollNumber: rollNumber || `R${Date.now().toString().slice(-7)}`,
        semester: semester || 1
      });
      await student.save();
    } else if (role === 'faculty') {
      const faculty = new Faculty({
        user: user._id,
        facultyId: facultyId || `F${Date.now().toString().slice(-7)}`,
        designation: designation || 'Professor',
        department
      });
      await faculty.save();
    }

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user: userResponse }
    });
  } catch (dbError) {
    if (createdUser) {
      await User.findByIdAndDelete(createdUser._id);
    }
    console.error('Admin create user error:', dbError);
    if (dbError.code === 11000) {
      const field = Object.keys(dbError.keyValue)[0];
      return res.status(400).json({
        success: false,
        error: `An account with this ${field} already exists.`
      });
    }
    res.status(500).json({
      success: false,
      error: dbError.message || 'Failed to create user'
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Attempt to delete any relational data
    if (user.role === 'student') {
      await Student.deleteMany({ user: user._id });
    } else if (user.role === 'faculty') {
      await Faculty.deleteMany({ user: user._id });
    }
    
    // Delete the root account record
    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete user' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    user.password = newPassword;
    await user.save(); // pre-save hook will hash it automatically

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Admin password change error:', error);
    res.status(500).json({ success: false, error: 'Failed to update user password' });
  }
};

exports.forceSeed = async (req, res) => {
  const Class = require('../models/Class.model');
  const QRSession = require('../models/QRSession.model');
  const Attendance = require('../models/Attendance.model');
  try {
    // 1. ANNIHILATE EVERYTHING
    await User.deleteMany({});
    await Student.deleteMany({});
    await Faculty.deleteMany({});
    await Class.deleteMany({});
    await QRSession.deleteMany({});
    await Attendance.deleteMany({});

    // 2. Create standard Admin
    const admin = new User({ email: 'admin@test.com', password: 'Admin@123', name: 'System Administrator', role: 'admin', department: 'Administration', isActive: true });
    await admin.save();

    const firstNames = ['Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Cameron', 'Quinn', 'Avery', 'Skylar', 'Dakota', 'Reese', 'Peyton', 'Rowan', 'Charlie', 'Drew', 'Kendall', 'Blake', 'Parker', 'Emerson'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
    const randomName = () => `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;

    // 3. Create 3 random Faculty
    const facultyDocs = [];
    for (let i = 1; i <= 3; i++) {
        const u = new User({ email: `pfav${Math.floor(Math.random()*9000)}@univ.edu`, password: 'Faculty@123', name: `Dr. ${randomName()}`, role: 'faculty', department: i===3?'Electronics':'Computer Science', isActive: true });
        await u.save();
        const fac = new Faculty({ user: u._id, facultyId: `F${Date.now().toString().slice(-4)}${i}`, designation: 'Professor', department: u.department, isHOD: i===1 });
        await fac.save();
        facultyDocs.push({ model: fac, u });
    }

    // 4. Create 20 random students
    const students = [];
    for (let i = 1; i <= 20; i++) {
      const u = new User({ email: `st${Math.floor(Math.random()*90000)}@univ.edu`, password: 'Student@123', name: randomName(), role: 'student', department: i<=12?'Computer Science':'Electronics', isActive: true });
      await u.save();
      const s = new Student({ user: u._id, studentId: `S${Math.floor(Math.random() * 9000000)+100000}`, rollNumber: `R${Math.floor(Math.random() * 900000)+100000}`, semester: Math.floor(Math.random() * 8) + 1, attendanceCount: 0 });
      await s.save();
      students.push({ model: s, u });
    }

    // 5. Create Classes and enroll
    const classes = [
      new Class({ subjectName: 'Comp Science 101', subjectCode: `CS${Math.floor(Math.random()*900)}`, faculty: facultyDocs[0].model._id, department: 'Computer Science', semester: 3, classLocation: { lat: 30.12, long: 77.12, roomNumber: 'L-1' }, schedule: { days: ['Monday'], startTime: '10:00', endTime: '11:00' }, studentsEnrolled: students.slice(0, 10).map(s=>s.model._id) }),
      new Class({ subjectName: 'Eng Electronics', subjectCode: `EE${Math.floor(Math.random()*900)}`, faculty: facultyDocs[2].model._id, department: 'Electronics', semester: 2, classLocation: { lat: 30.13, long: 77.13, roomNumber: 'L-2' }, schedule: { days: ['Tuesday'], startTime: '11:00', endTime: '12:00' }, studentsEnrolled: students.slice(10, 20).map(s=>s.model._id) })
    ];
    for (const c of classes) await c.save();

    for(let i=0; i<10; i++) { students[i].model.enrolledClasses.push(classes[0]._id); await students[i].model.save(); }
    for(let i=10; i<20; i++) { students[i].model.enrolledClasses.push(classes[1]._id); await students[i].model.save(); }
    facultyDocs[0].model.createdClasses.push(classes[0]._id); await facultyDocs[0].model.save();
    facultyDocs[2].model.createdClasses.push(classes[1]._id); await facultyDocs[2].model.save();

    res.json({ success: true, message: 'Database forcefully eradicated and rebuilt with random data' });
  } catch(e) {
    res.status(500).json({ success: false, error: e.message });
  }
};
