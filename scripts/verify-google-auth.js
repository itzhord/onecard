#!/usr/bin/env node

/**
 * Google OAuth Configuration Verification Script
 * 
 * This script verifies that Google OAuth is properly configured
 * in your Next.js project with Better Auth.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Google OAuth Configuration...\n');

let hasErrors = false;

// Check 1: Environment Variables
console.log('1️⃣  Checking environment variables...');
try {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    console.error('   ❌ .env file not found');
    hasErrors = true;
  } else {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    
    const hasGoogleClientId = envContent.includes('GOOGLE_CLIENT_ID=') && 
                               !envContent.includes('GOOGLE_CLIENT_ID=your-google-client-id');
    const hasGoogleClientSecret = envContent.includes('GOOGLE_CLIENT_SECRET=') && 
                                   !envContent.includes('GOOGLE_CLIENT_SECRET=your-google-client-secret');
    const hasBetterAuthSecret = envContent.includes('BETTER_AUTH_SECRET=') && 
                                 envContent.includes('BETTER_AUTH_SECRET=') && 
                                 envContent.split('BETTER_AUTH_SECRET=')[1].split('\n')[0].trim().length > 20;
    const hasBaseUrl = envContent.includes('NEXT_PUBLIC_BASE_URL=');
    
    if (hasGoogleClientId) {
      console.log('   ✅ GOOGLE_CLIENT_ID is set');
    } else {
      console.error('   ❌ GOOGLE_CLIENT_ID is missing or not configured');
      hasErrors = true;
    }
    
    if (hasGoogleClientSecret) {
      console.log('   ✅ GOOGLE_CLIENT_SECRET is set');
    } else {
      console.error('   ❌ GOOGLE_CLIENT_SECRET is missing or not configured');
      hasErrors = true;
    }
    
    if (hasBetterAuthSecret) {
      console.log('   ✅ BETTER_AUTH_SECRET is set');
    } else {
      console.error('   ❌ BETTER_AUTH_SECRET is missing or invalid');
      hasErrors = true;
    }
    
    if (hasBaseUrl) {
      console.log('   ✅ NEXT_PUBLIC_BASE_URL is set');
    } else {
      console.error('   ❌ NEXT_PUBLIC_BASE_URL is missing');
      hasErrors = true;
    }
  }
} catch (error) {
  console.error('   ❌ Error reading .env file:', error.message);
  hasErrors = true;
}

console.log('');

// Check 2: Server Auth Configuration
console.log('2️⃣  Checking server auth configuration...');
try {
  const authPath = path.join(process.cwd(), 'src/server/auth.ts');
  if (!fs.existsSync(authPath)) {
    console.error('   ❌ src/server/auth.ts not found');
    hasErrors = true;
  } else {
    const authContent = fs.readFileSync(authPath, 'utf-8');
    
    const hasGoogleProvider = authContent.includes('socialProviders:') && 
                               authContent.includes('google:') &&
                               !authContent.includes('// google:');
    
    if (hasGoogleProvider) {
      console.log('   ✅ Google provider is enabled in auth.ts');
    } else {
      console.error('   ❌ Google provider is not enabled or commented out');
      hasErrors = true;
    }
  }
} catch (error) {
  console.error('   ❌ Error reading auth.ts:', error.message);
  hasErrors = true;
}

console.log('');

// Check 3: API Route Handler
console.log('3️⃣  Checking API route handler...');
try {
  const routePath = path.join(process.cwd(), 'src/app/api/auth/[...auth]/route.ts');
  if (!fs.existsSync(routePath)) {
    console.error('   ❌ API route handler not found at src/app/api/auth/[...auth]/route.ts');
    hasErrors = true;
  } else {
    const routeContent = fs.readFileSync(routePath, 'utf-8');
    
    const hasHandler = routeContent.includes('toNextJsHandler') && 
                       routeContent.includes('GET') && 
                       routeContent.includes('POST');
    
    if (hasHandler) {
      console.log('   ✅ API route handler is properly configured');
    } else {
      console.error('   ❌ API route handler is not properly configured');
      hasErrors = true;
    }
  }
} catch (error) {
  console.error('   ❌ Error reading route.ts:', error.message);
  hasErrors = true;
}

console.log('');

// Check 4: Client Configuration
console.log('4️⃣  Checking client configuration...');
try {
  const clientPath = path.join(process.cwd(), 'src/lib/auth-client.ts');
  if (!fs.existsSync(clientPath)) {
    console.error('   ❌ src/lib/auth-client.ts not found');
    hasErrors = true;
  } else {
    const clientContent = fs.readFileSync(clientPath, 'utf-8');
    
    const hasAuthClient = clientContent.includes('createAuthClient');
    const hasSignIn = clientContent.includes('signIn');
    
    if (hasAuthClient && hasSignIn) {
      console.log('   ✅ Auth client is properly configured');
    } else {
      console.error('   ❌ Auth client is not properly configured');
      hasErrors = true;
    }
  }
} catch (error) {
  console.error('   ❌ Error reading auth-client.ts:', error.message);
  hasErrors = true;
}

console.log('');

// Check 5: UI Components
console.log('5️⃣  Checking UI components...');
try {
  const socialAuthPath = path.join(process.cwd(), 'src/components/SocialAuth.js');
  if (!fs.existsSync(socialAuthPath)) {
    console.error('   ❌ src/components/SocialAuth.js not found');
    hasErrors = true;
  } else {
    const socialAuthContent = fs.readFileSync(socialAuthPath, 'utf-8');
    
    const hasGoogleButton = socialAuthContent.includes('signIn.social') && 
                             socialAuthContent.includes('provider: "google"');
    
    if (hasGoogleButton) {
      console.log('   ✅ Google sign-in button is implemented');
    } else {
      console.error('   ❌ Google sign-in button is not properly implemented');
      hasErrors = true;
    }
  }
} catch (error) {
  console.error('   ❌ Error reading SocialAuth.js:', error.message);
  hasErrors = true;
}

console.log('');
console.log('═'.repeat(60));

if (hasErrors) {
  console.log('\n❌ Configuration has errors. Please fix the issues above.\n');
  process.exit(1);
} else {
  console.log('\n✅ All checks passed! Google OAuth is properly configured.\n');
  console.log('📝 Next steps:');
  console.log('   1. Ensure your Google Cloud Console OAuth credentials are set up');
  console.log('   2. Add redirect URI: http://localhost:3000/api/auth/callback/google');
  console.log('   3. Start the dev server: npm run dev');
  console.log('   4. Test sign-in at: http://localhost:3000/auth');
  console.log('\n📚 See GOOGLE_AUTH_SETUP.md for detailed instructions.\n');
  process.exit(0);
}
