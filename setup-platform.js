const fs = require('fs');
const os = require('os');

const platform = os.platform();
const arch = os.arch();

let packageFile;
if (platform === 'win32' && arch === 'x64') {
  packageFile = 'package_x64.json';
} else if (platform === 'darwin' && arch === 'arm64') {
  packageFile = 'package_arm64.json';
} else {
  packageFile = 'package_arm64.json'; // 기본값
}

if (fs.existsSync(packageFile)) {
  fs.copyFileSync(packageFile, 'package.json');
  console.log(`✅ ${packageFile} → package.json (${platform}-${arch})`);
} else {
  console.log(`❌ ${packageFile} not found`);
}