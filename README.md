# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Environment Variables

This project uses Firebase, Genkit for AI, and Nodemailer for emails. It requires several environment variables to function correctly. Create a `.env` file in the root of the project and add the following variables, replacing the placeholder values with your actual credentials.

### Firebase Credentials
You can find these values in your Firebase project settings.
```
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-auth-domain"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-messaging-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
```

### Google AI (Gemini) API Key
You can get a Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
```
SECRET_GEMINI_API_KEY="your-gemini-api-key"
```

### Email (SMTP) Credentials
These are required for the server to send emails. Use the credentials from your email provider (e.g., SendGrid, Mailgun, or a standard Gmail account).
```
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="your-email@example.com"
SMTP_PASS="your-email-password-or-app-password"
```

### Session Secret
This is a required secret for encrypting user sessions. It should be a long, random string.
```
SECRET_COOKIE_PASSWORD="complex_password_at_least_32_characters_long_for_session_encryption"
```
