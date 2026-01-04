#!/usr/bin/env node
const { execSync } = require('child_process');
const pkg = require('../packages/must/package.json');

const version = pkg.version;

console.log(`\n📦 Releasing v${version}...\n`);

try {
  // Stage all changes
  console.log('📝 Staging changes...');
  execSync('git add -A', { stdio: 'inherit' });

  // Commit
  console.log('💾 Committing...');
  execSync(`git commit -m "chore(release): v${version}"`, { stdio: 'inherit' });

  // Tag
  console.log('🏷️  Creating tag...');
  execSync(`git tag v${version}`, { stdio: 'inherit' });

  // Push
  console.log('🚀 Pushing to remote...');
  execSync('git push --follow-tags', { stdio: 'inherit' });

  console.log(`
✅ Successfully released v${version}!

📦 To publish to npm, run:
   cd packages/must && npm publish --access public --otp=YOUR_OTP

   Or simply:
   pnpm publish:must --otp=YOUR_OTP
`);
} catch (error) {
  console.error('❌ Release failed:', error.message);
  process.exit(1);
}

