const axios = require('axios');

async function test() {
  try {
    // 1. Login to get token
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'faculty@test.com',
      password: 'Faculty@123'
    });
    const token = loginRes.data.data.token;

    // 2. Try creating a block
    const formData = {
      subjectName: 'Test Subject',
      subjectCode: 'TEST101',
      department: 'CSE',
      semester: 1,
      classLocation: {
        lat: '30.1',
        long: '77.1',
        roomNumber: '101'
      },
      schedule: {
        days: ['Monday'],
        startTime: '10:00',
        endTime: '11:00'
      }
    };

    const res = await axios.post('http://localhost:5000/api/faculty/classes', formData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Success:", res.data);
  } catch (err) {
    if (err.response) {
      console.log("Validation Errors:", JSON.stringify(err.response.data, null, 2));
    } else {
      console.error(err);
    }
  }
}

test();
