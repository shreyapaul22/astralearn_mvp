# Quick Setup Guide

Follow these steps to get the BrainLeap MVP app running:

## 1. Install Dependencies

```bash
npm install
```

or if you prefer yarn:

```bash
yarn install
```

## 2. Configure Your API Key

**IMPORTANT**: You must set up your Gemini API key before running the app.

1. Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Open `config.js` in the root directory
3. Replace the placeholder with your actual API key:

```javascript
export const GEMINI_API_KEY = 'your_actual_gemini_api_key_here';
```

**⚠️ Security Note**: Never commit `config.js` with your actual API key to version control. The file is already in `.gitignore`.

## 3. Start the Development Server

```bash
npm start
```

or

```bash
expo start
```

## 4. Run on Your Device

### Option A: Physical Device (Recommended for drawing)

1. Install **Expo Go** from:
   - [App Store (iOS)](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play (Android)](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Scan the QR code shown in your terminal/browser with:
   - **iOS**: Use the Camera app
   - **Android**: Use the Expo Go app

### Option B: Emulator/Simulator

**Android Emulator**:
```bash
npm run android
```

**iOS Simulator** (macOS only):
```bash
npm run ios
```

## 5. Test the App

1. Select "Maths" as the subject
2. Choose a class (8, 9, or 10)
3. Click "Start Learning"
4. Draw your solution on the whiteboard
5. Submit and get AI feedback!

## Troubleshooting

### Issue: "GEMINI_API_KEY is not defined"

**Solution**: Make sure you've updated `config.js` with your actual API key.

### Issue: Drawing doesn't work

**Solution**: 
- Try on a physical device instead of an emulator
- Ensure all dependencies are installed: `npm install`
- Clear cache: `expo start -c`

### Issue: "Failed to generate question"

**Solution**:
- Check your internet connection
- Verify your API key is correct and active
- Check if you have API quota remaining

## Next Steps

- Explore the codebase in the `src/` directory
- Customize questions by modifying `src/services/geminiService.js`
- Adjust the UI in the screen components
- Add more subjects by updating `config.js`

## Need Help?

Check the main [README.md](README.md) for detailed documentation.

