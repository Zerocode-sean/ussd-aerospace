const express = require('express');
const bodyParser = require('body-parser');
const app = express();

// Africa’s Talking SDK
const AfricasTalking = require('africastalking');
const credentials = {
  apiKey: 'YOUR_API_KEY', // From Africa’s Talking sandbox
  username: 'sandbox' // Use 'sandbox' for testing
};
const africastalking = AfricasTalking(credentials);

// Middleware to parse POST requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// USSD endpoint
app.post('/ussd', (req, res) => {
  const { sessionId, serviceCode, phoneNumber, text } = req.body;

  let response = '';

  // Split text to handle multi-level inputs (e.g., 1*2)
  const textArray = text.split('*');
  const userResponse = textArray[textArray.length - 1];
  const level = textArray.length;

  if (text === '') {
    // Main menu
    response = `CON Welcome to Aerospace Maintenance Reporting\n`;
    response += `1. Report an issue\n`;
    response += `2. Check reported issues\n`;
  } else if (text === '1') {
    // Sub-menu: Select aircraft part
    response = `CON Select aircraft part:\n`;
    response += `1. Engine\n`;
    response += `2. Tire\n`;
    response += `3. Wing\n`;
  } else if (text.startsWith('1*') && level === 2) {
    // Sub-menu: Describe issue
    response = `CON Describe the issue (e.g., Engine overheating):\n`;
  } else if (text.startsWith('1*') && level === 3) {
    // Log issue and end session
    const issueDescription = userResponse;
    const part = textArray[1] === '1' ? 'Engine' : textArray[1] === '2' ? 'Tire' : 'Wing';
    console.log(`Issue reported: ${part} - ${issueDescription} by ${phoneNumber}`);
    response = `END Issue reported: ${part} - ${issueDescription}. Thank you!`;
    // Optionally, send an SMS confirmation
    africastalking.SMS.send({
      to: [phoneNumber],
      message: `Issue reported: ${part} - ${issueDescription}. We’ll address it soon.`
    }).catch(err => console.log(err));
  } else if (text === '2') {
    // Placeholder for checking issues
    response = `END No issues reported yet.`;
  } else {
    response = `END Invalid input. Please try again.`;
  }

  // Send plain text response
  res.set('Content-Type', 'text/plain');
  res.send(response);
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));