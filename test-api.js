// Test script for local API
const testPayload = {
  messages: [
    {
      role: "user",
      content: "\"Crée une carte mémoire pour la formule E=mc²\""
    }
  ],
  conversationId: "d6e5226a-3132-4506-aa66-2f7a95bee667",
  userId: "user-1766060853954-aehroif6a"
};

async function testAPI() {
  try {
    console.log('Testing API with payload:', JSON.stringify(testPayload, null, 2));
    console.log('\nSending request to http://localhost:3000/api/chat...\n');
    
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log('\nResponse body:');
    console.log(text);
    
    if (!response.ok) {
      try {
        const json = JSON.parse(text);
        console.log('\nParsed error:', JSON.stringify(json, null, 2));
      } catch (e) {
        console.log('\nCould not parse as JSON');
      }
    }
  } catch (error) {
    console.error('Error calling API:', error);
    console.error('Error stack:', error.stack);
  }
}

// Wait a bit for server to start, then test
setTimeout(() => {
  testAPI();
}, 3000);

