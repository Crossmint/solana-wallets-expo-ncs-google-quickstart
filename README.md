<div align="center">
<img width="200" alt="Image" src="https://github.com/user-attachments/assets/8b617791-cd37-4a5a-8695-a7c9018b7c70" />
<br>
<br>
<h1>Solana Wallets Expo NCS Google Quickstart</h1>

<div align="center">
<a href="https://solana-wallets.demos-crossmint.com/">Live Demo</a> | <a href="https://docs.crossmint.com/introduction/platform/wallets">Docs</a> | <a href="https://github.com/crossmint">See all quickstarts</a>
</div>

<br>
<br>
<img src="https://github.com/user-attachments/assets/76a983ab-499e-4d12-af7a-0ae17cb0b6cd" alt="Image" width="full">
</div>

## Introduction

Create and interact with Crossmint wallets in Solana using Crossmint Auth to handle user authentication.

**Learn how to:**

- Create a wallet
- View its balance for SOL and SPL tokens
- Send a transaction
- Add delegated signers to allow third parties to sign transactions on behalf of your wallet

## Setup

1. Clone the repository and navigate to the project folder:

```bash
git clone https://github.com/crossmint/solana-wallets-expo-quickstart.git && cd solana-wallets-expo-quickstart
```

2. Install all dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Set up the environment variables:

```bash
cp .env.template .env
```

4. Set up your Crossmint client API key:

   a. Generate a Crossmint client API key from [here](https://docs.crossmint.com/introduction/platform/api-keys/client-side).

   b. Make sure your API key has the following scopes: `users.create`, `users.read`, `wallets.read`, `wallets.create`, `wallets:transactions.create`, `wallets:transactions.sign`, `wallets:balance.read`, `wallets.fund`.

   c. To authenticate requests from your app, whitelist the app domain by selecting "Mobile" under "App type" and entering your iOS bundle ID and Android package name from `app.json` (by default this quickstart uses "com.crossmint.solana.wallets").

5. Add the API key to the `.env` file.

```bash
EXPO_PUBLIC_CLIENT_CROSSMINT_API_KEY=your_api_key
```

## Google Sign In Setup

This quickstart uses Google Sign In for user authentication. Follow these steps to configure Google Sign In:

### 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API for your project

### 2. Configure OAuth 2.0 Credentials

#### For Web Application (Required for both iOS and Android)

1. In the Google Cloud Console, go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client IDs**
3. Select **Web application** as the application type
4. Add your domain to **Authorized JavaScript origins** (for development, you can use `http://localhost`)
5. Note the **Client ID** - this will be your `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`

#### For iOS Application

1. Create another OAuth 2.0 Client ID
2. Select **iOS** as the application type
3. Enter your iOS bundle identifier: `com.crossmint.solana.wallets` (or your custom bundle ID from `app.json`)
4. Note the **Client ID** - this will be your `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`

#### For Android Application

1. Create another OAuth 2.0 Client ID
2. Select **Android** as the application type
3. Enter your Android package name: `com.crossmint.solana.wallets` (or your custom package name from `app.json`)
4. Generate the SHA-1 certificate fingerprint (see next step)

### 3. Generate SHA-1 Certificate Fingerprint

For Android configuration, you need to generate a SHA-1 certificate fingerprint:

1. First, build your project to generate the debug keystore:

   ```bash
   npx expo prebuild --clean
   npx expo run:android
   ```

2. Once the build is complete, generate the SHA-1 fingerprint:

   ```bash
   keytool -keystore ./android/app/debug.keystore -list -v
   ```

   When prompted for a password, use: `android`

3. Copy the SHA-1 fingerprint from the output and add it to your Android OAuth 2.0 Client ID in the Google Cloud Console

**Note:** For production builds, you'll need to generate the SHA-1 for your production keystore instead.

### 4. Update Environment Variables

Add the Google Client IDs to your `.env` file:

```bash
EXPO_PUBLIC_CLIENT_CROSSMINT_API_KEY=your_crossmint_api_key
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_web_client_id
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your_ios_client_id
```

### 5. Configure Crossmint JWT Authentication

To enable custom JWT authentication with Google tokens in Crossmint:

1. Go to your [Crossmint Console](https://staging.crossmint.com/console/projects/apiKeys)
2. Navigate to your project's API Keys section
3. In the JWT Authentication section, select **Custom tokens**
4. Configure the following settings:
   - **JWKS Endpoint**: `https://www.googleapis.com/oauth2/v3/certs`
   - **Issuer (iss field in JWT)**: `https://accounts.google.com`
5. Save your configuration

### 6. Update app.json (Already Configured)

You need to update the `app.json` file with the Google Sign In plugin configuration. The configuration follows the [non-Firebase setup guide](https://react-native-google-signin.github.io/docs/setting-up/expo#expo-without-firebase) and includes:

```json
{
  "plugins": [
    [
      "@react-native-google-signin/google-signin",
      {
        "iosUrlScheme": "com.googleusercontent.apps._some_id_here_"
      }
    ]
  ]
}
```

**Note:** The `iosUrlScheme` should match the reversed client ID from your iOS OAuth 2.0 Client ID.

### 7. Rebuild the App

After configuring all the above settings, rebuild your app:

```bash
npx expo prebuild --clean
npx expo run:android
npx expo run:ios
```

6. Run the development server:

```bash
npm run start
# or
yarn start
# or
pnpm start
# or
bun start
```

Note: When running an iOS development build, make sure you're running the latest version on the simulator (>iOS 18).

## Using in production

1. Create a [production API key](https://docs.crossmint.com/introduction/platform/api-keys/client-side).

## Errors when running in iOS simulator

If you encounter errors trying to run the expo app on iOS, try running:

```bash
npx expo install --fix
```
