namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;
    BETTER_AUTH_SECRET: string;
    NEXT_PUBLIC_BASE_URL: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    RESEND_API_KEY: string;
    EMAIL_FROM: string;
    FROM_EMAIL: string;
    FROM_NAME: string;
    PAYSTACK_PUBLIC_KEY: string;
    NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: string;
    PAYSTACK_SECRET_KEY: string;
    PAYSTACK_WEBHOOK_SECRET: string;
    NODE_ENV: 'development' | 'production' | 'test';
  }
}
