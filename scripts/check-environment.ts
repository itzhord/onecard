/**
 * Environment Readiness Check
 *
 * Verifies that all required environment variables and dependencies
 * are properly configured for Better Auth + Drizzle integration.
 *
 * Run: npx tsx scripts/check-environment.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const ENV_PATH = path.join(process.cwd(), '.env');

interface EnvCheck {
  name: string;
  required: boolean;
  description: string;
  present: boolean;
  value?: string;
}

async function checkEnvironment() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║           Environment Readiness Check                      ║');
  console.log('║           Better Auth + Drizzle + Next.js                  ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  let allGood = true;
  const warnings: string[] = [];

  // Check if .env file exists
  console.log('📁 Configuration Files\n');
  const envExists = fs.existsSync(ENV_PATH);
  console.log(`   ${envExists ? '✅' : '❌'} .env file: ${envExists ? 'Found' : 'Missing'}`);

  if (!envExists) {
    console.log('   ⚠️  Create .env file from .env.example');
    allGood = false;
  }

  // Read environment variables
  const envVars: Record<string, string> = {};
  if (envExists) {
    const envContent = fs.readFileSync(ENV_PATH, 'utf-8');
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key) {
          envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        }
      }
    });
  }

  // Define required and optional environment variables
  const checks: EnvCheck[] = [
    {
      name: 'DATABASE_URL',
      required: true,
      description: 'PostgreSQL connection string',
      present: false,
    },
    {
      name: 'BETTER_AUTH_SECRET',
      required: true,
      description: 'Better Auth secret key (32+ chars)',
      present: false,
    },
    {
      name: 'AUTH_SECRET',
      required: false,
      description: 'Alternative auth secret (fallback)',
      present: false,
    },
    {
      name: 'NEXT_PUBLIC_BASE_URL',
      required: true,
      description: 'Base URL for your app',
      present: false,
    },
    {
      name: 'RESEND_API_KEY',
      required: false,
      description: 'Resend API key for emails',
      present: false,
    },
    {
      name: 'EMAIL_FROM',
      required: false,
      description: 'Email sender address',
      present: false,
    },
    {
      name: 'GOOGLE_CLIENT_ID',
      required: false,
      description: 'Google OAuth client ID',
      present: false,
    },
    {
      name: 'GOOGLE_CLIENT_SECRET',
      required: false,
      description: 'Google OAuth client secret',
      present: false,
    },
  ];

  // Check each variable
  checks.forEach(check => {
    const value = envVars[check.name] || process.env[check.name];
    check.present = !!value;
    check.value = value;
  });

  // Display results
  console.log('\n🔑 Required Environment Variables\n');
  checks
    .filter(c => c.required)
    .forEach(check => {
      const status = check.present ? '✅' : '❌';
      console.log(`   ${status} ${check.name}`);
      console.log(`      ${check.description}`);

      if (check.present && check.value) {
        // Show partial value for security
        const displayValue = check.name.includes('SECRET') || check.name.includes('KEY')
          ? check.value.substring(0, 8) + '...'
          : check.value;
        console.log(`      Value: ${displayValue}`);

        // Validate specific values
        if (check.name === 'BETTER_AUTH_SECRET' && check.value.length < 32) {
          console.log(`      ⚠️  Warning: Should be at least 32 characters`);
          warnings.push(`${check.name} should be at least 32 characters`);
        }

        if (check.name === 'DATABASE_URL' && !check.value.includes('postgresql://')) {
          console.log(`      ⚠️  Warning: Should be a PostgreSQL connection string`);
          warnings.push(`${check.name} should be a PostgreSQL connection string`);
        }
      } else {
        console.log(`      ❌ Not set`);
        allGood = false;
      }
      console.log('');
    });

  console.log('🎨 Optional Environment Variables\n');
  checks
    .filter(c => !c.required)
    .forEach(check => {
      const status = check.present ? '✅' : '⚪';
      console.log(`   ${status} ${check.name}`);
      console.log(`      ${check.description}`);

      if (check.present && check.value) {
        const displayValue = check.name.includes('SECRET') || check.name.includes('KEY')
          ? check.value.substring(0, 8) + '...'
          : check.value;
        console.log(`      Value: ${displayValue}`);
      } else {
        console.log(`      Not set (feature disabled)`);
      }
      console.log('');
    });

  // Check package.json dependencies
  console.log('📦 Dependencies\n');
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

  const requiredPackages = [
    { name: 'better-auth', version: deps['better-auth'] },
    { name: 'drizzle-orm', version: deps['drizzle-orm'] },
    { name: 'drizzle-kit', version: deps['drizzle-kit'] },
    { name: 'pg', version: deps['pg'] },
    { name: 'next', version: deps['next'] },
  ];

  requiredPackages.forEach(pkg => {
    const installed = !!pkg.version;
    console.log(`   ${installed ? '✅' : '❌'} ${pkg.name}${installed ? ` (${pkg.version})` : ''}`);
  });

  // Check for optional email providers
  console.log('\n📧 Email Providers\n');
  const emailProviders = [
    { name: 'resend', version: deps['resend'] },
    { name: '@sendgrid/mail', version: deps['@sendgrid/mail'] },
    { name: 'postmark', version: deps['postmark'] },
    { name: 'mailgun.js', version: deps['mailgun.js'] },
  ];

  const hasEmailProvider = emailProviders.some(p => p.version);
  emailProviders.forEach(pkg => {
    const installed = !!pkg.version;
    console.log(`   ${installed ? '✅' : '⚪'} ${pkg.name}${installed ? ` (${pkg.version})` : ''}`);
  });

  if (!hasEmailProvider) {
    console.log('\n   ℹ️  No email provider configured - emails will be logged to console');
  }

  // Check schema file
  console.log('\n📝 Schema Configuration\n');
  const schemaPath = path.join(process.cwd(), 'src/lib/schema.ts');
  const schemaExists = fs.existsSync(schemaPath);
  console.log(`   ${schemaExists ? '✅' : '❌'} src/lib/schema.ts: ${schemaExists ? 'Found' : 'Missing'}`);

  if (schemaExists) {
    const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
    const hasTimestampMode = /mode:\s*["']date["']/.test(schemaContent);
    console.log(`   ${hasTimestampMode ? '✅' : '❌'} Timestamp mode: "date" configured`);

    if (!hasTimestampMode) {
      console.log('      ❌ Run: npx tsx scripts/verify-timestamp-schema.ts');
      allGood = false;
    }
  }

  // Check auth configuration
  console.log('\n🔐 Better Auth Configuration\n');
  const authPath = path.join(process.cwd(), 'src/server/auth.ts');
  const authExists = fs.existsSync(authPath);
  console.log(`   ${authExists ? '✅' : '❌'} src/server/auth.ts: ${authExists ? 'Found' : 'Missing'}`);

  if (authExists) {
    const authContent = fs.readFileSync(authPath, 'utf-8');
    const hasDrizzleAdapter = /drizzleAdapter/.test(authContent);
    const hasUsePlural = /usePlural:\s*true/.test(authContent);
    const hasEmailPassword = /emailAndPassword/.test(authContent);

    console.log(`   ${hasDrizzleAdapter ? '✅' : '❌'} Drizzle adapter configured`);
    console.log(`   ${hasUsePlural ? '✅' : '❌'} usePlural: true configured`);
    console.log(`   ${hasEmailPassword ? '✅' : '⚪'} Email/password auth enabled`);
  }

  // Summary
  console.log('\n═'.repeat(60));
  console.log('\n📊 SUMMARY\n');

  const requiredChecks = checks.filter(c => c.required);
  const passedRequired = requiredChecks.filter(c => c.present).length;
  const totalRequired = requiredChecks.length;

  console.log(`Required Variables: ${passedRequired}/${totalRequired}`);
  console.log(`Warnings: ${warnings.length}`);

  if (allGood && passedRequired === totalRequired) {
    console.log('\n🎉 SUCCESS! Your environment is ready!');
    console.log('\n✅ Next steps:');
    console.log('   1. Start dev server: npm run dev');
    console.log('   2. Test user signup');
    console.log('   3. Verify no toISOString errors');
    console.log('\n✨ Everything is configured correctly!');
    process.exit(0);
  } else {
    console.log('\n⚠️  ISSUES FOUND!');
    console.log('\n❌ Required actions:');

    checks
      .filter(c => c.required && !c.present)
      .forEach(check => {
        console.log(`   • Set ${check.name} in .env`);
      });

    if (warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      warnings.forEach(warning => {
        console.log(`   • ${warning}`);
      });
    }

    console.log('\n📖 See .env.example for reference');
    process.exit(1);
  }
}

// Run the check
checkEnvironment().catch(error => {
  console.error('❌ Environment check failed:', error);
  process.exit(1);
});
