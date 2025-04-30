// Setup script for local Firebase testing
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('=== Local Firebase Testing Setup ===');
console.log('This script will help you set up your local environment for testing Firebase functionality.');
console.log('You\'ll need your Firebase project details from the Firebase console.');
console.log('Follow these steps:');
console.log('1. Go to https://console.firebase.google.com/');
console.log('2. Select your project');
console.log('3. Go to Project Settings > Service accounts');
console.log('4. Click "Generate new private key"');
console.log('5. Save the JSON file and use it with this script\n');

// Function to prompt for a service account file
function promptForServiceAccountFile() {
  rl.question('Enter the path to your Firebase service account JSON file: ', (filePath) => {
    try {
      // Try to read the service account file
      const absolutePath = path.resolve(filePath);
      if (!fs.existsSync(absolutePath)) {
        console.error(`File not found: ${absolutePath}`);
        return promptForServiceAccountFile();
      }

      const serviceAccount = require(absolutePath);
      
      // Create a .env.local file with the service account details
      const envContent = `# Firebase Admin SDK configuration for local function testing
FIREBASE_PROJECT_ID=${serviceAccount.project_id}
FIREBASE_CLIENT_EMAIL=${serviceAccount.client_email}
FIREBASE_PRIVATE_KEY="${serviceAccount.private_key}"

# Email configuration
EMAIL_USER=notifications@your-domain.com
EMAIL_PASSWORD=your-email-password
SENDER_EMAIL=noreply@jamaalaki.com

# Port for local function simulator
PORT=8888`;

      fs.writeFileSync(path.resolve(__dirname, '../.env.local'), envContent);
      
      // Create a firebase-service-account.json file
      fs.writeFileSync(
        path.resolve(__dirname, '../firebase-service-account.json'), 
        JSON.stringify(serviceAccount, null, 2)
      );

      console.log('\n✅ Setup complete!');
      console.log('Created:');
      console.log('- .env.local with your Firebase configuration');
      console.log('- firebase-service-account.json for the function simulator');
      console.log('\nTo start testing:');
      console.log('1. Run the client: cd client && npm run dev');
      console.log('2. Run the function simulator: node scripts/simulate-functions.js');
      rl.close();
    } catch (error) {
      console.error('Error processing service account file:', error);
      promptForServiceAccountFile();
    }
  });
}

// Function to manually enter details
function promptForManualEntry() {
  console.log('\nPlease enter your Firebase project details manually:');
  
  rl.question('Project ID: ', (projectId) => {
    rl.question('Client Email: ', (clientEmail) => {
      rl.question('Private Key (paste the entire key including BEGIN/END lines): ', (privateKey) => {
        // Create a .env.local file with the provided details
        const envContent = `# Firebase Admin SDK configuration for local function testing
FIREBASE_PROJECT_ID=${projectId}
FIREBASE_CLIENT_EMAIL=${clientEmail}
FIREBASE_PRIVATE_KEY="${privateKey}"

# Email configuration
EMAIL_USER=notifications@your-domain.com
EMAIL_PASSWORD=your-email-password
SENDER_EMAIL=noreply@jamaalaki.com

# Port for local function simulator
PORT=8888`;

        fs.writeFileSync(path.resolve(__dirname, '../.env.local'), envContent);
        
        // Create a simplified service account JSON
        const serviceAccount = {
          type: "service_account",
          project_id: projectId,
          client_email: clientEmail,
          private_key: privateKey
        };
        
        fs.writeFileSync(
          path.resolve(__dirname, '../firebase-service-account.json'), 
          JSON.stringify(serviceAccount, null, 2)
        );

        console.log('\n✅ Setup complete!');
        console.log('Created:');
        console.log('- .env.local with your Firebase configuration');
        console.log('- firebase-service-account.json for the function simulator');
        console.log('\nTo start testing:');
        console.log('1. Run the client: cd client && npm run dev');
        console.log('2. Run the function simulator: node scripts/simulate-functions.js');
        rl.close();
      });
    });
  });
}

// Main
console.log('Choose setup method:');
rl.question('1. Use a service account JSON file\n2. Enter details manually\nChoice (1 or 2): ', (choice) => {
  if (choice === '1') {
    promptForServiceAccountFile();
  } else if (choice === '2') {
    promptForManualEntry();
  } else {
    console.log('Invalid choice. Please enter 1 or 2.');
    rl.close();
  }
});
