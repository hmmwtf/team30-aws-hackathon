const { execSync } = require('child_process');

try {
  console.log('🔧 Setting up platform-specific package.json...');
  execSync('node setup-platform.js', { stdio: 'inherit' });
  
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('✅ Setup complete!');
} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
}