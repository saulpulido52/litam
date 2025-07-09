const axios = require('axios');

async function testEndpoints() {
  try {
    // First, login to get a token
    console.log('🔑 Intentando login...');
    const loginResponse = await axios.post('http://localhost:4000/api/auth/login', {
      email: 'nutri.admin@sistema.com',
      password: 'nutri123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');
    
    // Test getting appointments
    console.log('📅 Probando obtener citas...');
    try {
      const appointmentsResponse = await axios.get('http://localhost:4000/api/appointments/my-appointments', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Appointments endpoint works');
      console.log('Appointments:', appointmentsResponse.data);
    } catch (error) {
      console.error('❌ Error getting appointments:', error.response?.data || error.message);
    }
    
    // Test availability - clean data
    console.log('⏰ Probando actualizar disponibilidad...');
    const cleanTestData = {
      slots: [
        {
          day_of_week: "MONDAY",
          start_time_minutes: 540,
          end_time_minutes: 1020,
          is_active: true
        },
        {
          day_of_week: "TUESDAY", 
          start_time_minutes: 480,
          end_time_minutes: 1020,
          is_active: true
        },
        {
          day_of_week: "WEDNESDAY",
          start_time_minutes: 540,
          end_time_minutes: 1020,
          is_active: true
        }
      ]
    };
    
    const availabilityResponse = await axios.post('http://localhost:4000/api/appointments/availability', cleanTestData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Availability update successful');
    console.log('Response:', availabilityResponse.data);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testEndpoints();
