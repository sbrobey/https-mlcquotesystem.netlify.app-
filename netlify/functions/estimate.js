const https = require('https');

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.log("ERROR: No API key found");
    return { statusCode: 500, headers, body: JSON.stringify({ error: "API key not set" }) };
  }

  console.log("API key found, length:", apiKey.length);

  return new Promise((resolve) => {
    const body = event.body || '{}';
    console.log("Request body preview:", body.substring(0, 100));

    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log("Anthropic status code:", res.statusCode);
        console.log("Anthropic response:", data.substring(0, 500));
        resolve({ statusCode: res.statusCode, headers, body: data });
      });
    });

    req.on('error', (err) => {
      console.log("HTTPS error:", err.message);
      resolve({ statusCode: 500, headers, body: JSON.stringify({ error: err.message }) });
    });

    req.write(body);
    req.end();
  });
};
