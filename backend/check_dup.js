const mongoose = require('mongoose');
const User = require('./src/models/User.model');
const Student = require('./src/models/Student.model');

mongoose.connect('mongodb://localhost:27017/smart-attendance').then(async () => {
    try {
        const u = new User({ email: 'fsdfsdfsdfs@test.com', password: 'Password@123', name: 'Test', role: 'student', department: 'CS' });
        await u.save();
        const s = new Student({ user: u._id, studentId: 'S999999999', rollNumber: 'R999999999', semester: 1 });
        await s.save();
        console.log('Success! No duplicate errors on fresh dummy insert.');
        await User.deleteOne({ _id: u._id });
        await Student.deleteOne({ _id: s._id });
    } catch (e) {
        console.error('ERROR MESSAGE:', e.message);
    }
    process.exit(0);
});
