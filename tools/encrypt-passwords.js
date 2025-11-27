/**
 * Password Encryption Tool
 * 
 * This script encrypts your organization passwords using AES-256 encryption.
 * The encrypted data is embedded in the visual code, providing much better
 * security than plaintext password mappings.
 * 
 * Usage:
 *   node tools/encrypt-passwords.js
 * 
 * This reads OrgPass.csv and outputs encrypted mappings to copy into visual.ts
 */

const CryptoJS = require('crypto-js');
const fs = require('fs');
const path = require('path');

// Read OrgPass.csv
const csvPath = path.join(__dirname, '..', 'OrgPass.csv');
let csvContent;

try {
    csvContent = fs.readFileSync(csvPath, 'utf-8');
} catch (error) {
    console.error('❌ Error: OrgPass.csv not found!');
    console.error('   Please create OrgPass.csv in the project root with format:');
    console.error('   Organization,Password');
    console.error('   FAO,A7F9D2C4E1');
    console.error('   IAEA,B3E8A6F1D9');
    process.exit(1);
}

// Parse CSV
const lines = csvContent.split('\n').map(line => line.trim()).filter(line => line);
const mappings = [];

for (let i = 1; i < lines.length; i++) { // Skip header
    const [org, password] = lines[i].split(',').map(s => s.trim());
    
    if (org && password) {
        mappings.push({ org, password });
    }
}

if (mappings.length === 0) {
    console.error('❌ Error: No valid mappings found in OrgPass.csv');
    process.exit(1);
}

console.log('🔐 Encrypting Organization Passwords with AES-256\n');
console.log(`Found ${mappings.length} organization/password pairs\n`);

// Encrypt each organization name with its password
const encrypted = mappings.map(({ org, password }) => {
    // Encrypt the organization name using the password as the key
    const encryptedOrg = CryptoJS.AES.encrypt(org, password).toString();
    
    console.log(`✓ Encrypted: ${org.padEnd(20)} (password: ${password.substring(0, 4)}...)`);
    
    return encryptedOrg;  // Return just the encrypted string
});

console.log('\n✅ Encryption complete!\n');
console.log('━'.repeat(80));
console.log('📋 COPY THIS JSON (paste into PowerBI Security Settings):');
console.log('━'.repeat(80));
console.log('\n' + JSON.stringify(encrypted) + '\n');
console.log('━'.repeat(80));
console.log('\n💡 Instructions:');
console.log('   1. Copy the JSON above (the entire line)');
console.log('   2. Open your PowerBI report');
console.log('   3. Select the visual → Format visual → Security Settings');
console.log('   4. Paste into "Encrypted Mappings (JSON)" field');
console.log('   5. Done! No rebuild needed - just refresh the visual');
console.log('\n✨ Easy workflow:');
console.log('   - Edit OrgPass.csv → Run this script → Paste JSON → Done!');
console.log('   - No need to rebuild the visual for password changes');
console.log('\n🔒 Security Note:');
console.log('   - Organization names are encrypted with AES-256');
console.log('   - Password acts as decryption key');
console.log('   - Much more secure than plaintext mappings');
console.log('\n');

