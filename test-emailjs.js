async function testEmailJS() {
  const emailjsData = {
    service_id: 'service_foyth57',
    template_id: 'template_6kgypei',
    user_id: 'N-sHjBFeFUVQiQMuh',
    accessToken: '98E_q_FlI_Pcn7_XTeNA-',
    template_params: {
      email: 'bhavikesh@test.com',
      login_id: 'TEST001',
      password: 'TestPassword123!',
    }
  };

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailjsData)
    });

    if (response.ok) {
      console.log('✅ EmailJS API Success WITH Private Key');
    } else {
      const text = await response.text();
      console.error('❌ EmailJS API Error:', text);
    }
  } catch (err) {
    console.error('Request failed:', err);
  }
}

testEmailJS();
