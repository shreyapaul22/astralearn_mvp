# Installation Guide - BrainLeap MVP

Complete step-by-step installation guide for the BrainLeap MVP app.

## Prerequisites

### 1. Install Node.js and npm

**Check if already installed**:
```bash
node --version  # Should be v16 or higher
npm --version
```

**If not installed**, download from [nodejs.org](https://nodejs.org/)

### 2. Install Expo CLI (Optional but recommended)

```bash
npm install -g expo-cli
```

Or use npx to run Expo commands without global installation.

### 3. Get Google Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key (keep it secure!)

## Step-by-Step Installation

### Step 1: Navigate to Project Directory

```bash
cd /media/brito/storage/projects/brainleap_mvp
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React Native
- Expo SDK
- React Navigation
- Skia for drawing
- Google Generative AI
- And more...

**Expected time**: 2-5 minutes depending on internet speed

### Step 3: Configure API Key

**CRITICAL STEP**: The app will not work without this!

1. Open `config.js` in your code editor:
   ```bash
   nano config.js
   # or use your preferred editor
   ```

2. Replace the placeholder with your actual Gemini API key:
   ```javascript
   export const GEMINI_API_KEY = 'AIzaSy...your_actual_key_here';
   ```

3. Save the file

**⚠️ Security Warning**: 
- Never commit this file with your real API key to public repositories
- The file is already in `.gitignore` for your protection
- Keep your API key confidential

### Step 4: Start the Development Server

```bash
npm start
```

Or:
```bash
expo start
```

You should see:
- QR code in the terminal
- Metro bundler starting
- Expo DevTools opening in your browser

### Step 5: Run on Your Device

#### Option A: Physical Device (Recommended)

**Why recommended**: Drawing works much better with touch on a real device.

1. **Install Expo Go**:
   - iOS: [Download from App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Download from Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Connect to the same WiFi** as your development machine

3. **Scan the QR code**:
   - iOS: Use the Camera app
   - Android: Use the Expo Go app's QR scanner

4. **Wait for app to load** (first time may take 1-2 minutes)

#### Option B: Emulator/Simulator

**Android Emulator**:
```bash
npm run android
```

Requirements:
- Android Studio installed
- Android emulator configured and running
- ADB (Android Debug Bridge) in PATH

**iOS Simulator** (macOS only):
```bash
npm run ios
```

Requirements:
- Xcode installed (macOS only)
- Xcode Command Line Tools
- iOS Simulator

### Step 6: Test the App

1. App should open showing the selection screen
2. Select "Maths" (only active subject currently)
3. Choose a class (8, 9, or 10)
4. Tap "Start Learning"
5. Wait for AI to generate a question
6. Draw your solution on the whiteboard
7. Submit and receive AI feedback!

## Troubleshooting

### Issue: `npm install` fails

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Network request failed" when generating questions

**Possible causes**:
1. No internet connection
2. Invalid API key
3. API quota exceeded

**Solution**:
- Check your internet connection
- Verify API key in `config.js`
- Check API quota in Google AI Studio

### Issue: Expo won't start

**Solution**:
```bash
# Clear Expo cache
expo start -c
```

### Issue: Can't connect to app on physical device

**Solution**:
1. Ensure both devices are on the same WiFi network
2. Try tunnel mode: `expo start --tunnel`
3. Check firewall settings

### Issue: Drawing doesn't work

**Solution**:
- Try on a physical device instead of emulator
- Update dependencies: `npm update`
- Clear cache: `expo start -c`

### Issue: "Module not found" errors

**Solution**:
```bash
# Reinstall dependencies
rm -rf node_modules
npm install

# Clear watchman cache (if using macOS/Linux)
watchman watch-del-all

# Restart with clear cache
expo start -c
```

## Building for Production

### Android APK (Using EAS Build)

1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```

2. Login to Expo:
   ```bash
   eas login
   ```

3. Configure build:
   ```bash
   eas build:configure
   ```

4. Build APK:
   ```bash
   eas build --platform android --profile preview
   ```

### iOS Build (Using EAS Build)

```bash
eas build --platform ios
```

**Note**: iOS builds require an Apple Developer account ($99/year)

## Development Tips

1. **Use a physical device** for testing drawing functionality
2. **Enable fast refresh** in Expo DevTools for quick iterations
3. **Check the console** for any errors or warnings
4. **Use React DevTools** for debugging component state

## Next Steps

- Read [README.md](README.md) for project overview
- Check [SETUP.md](SETUP.md) for quick setup
- See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines

## Getting Help

### Common Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Google Gemini API Docs](https://ai.google.dev/docs)

### Still Having Issues?

1. Check existing issues in the project
2. Create a detailed bug report including:
   - Error messages
   - Steps to reproduce
   - Your environment (OS, Node version, etc.)
   - Screenshots if applicable

---

**Happy Learning! 🚀**

