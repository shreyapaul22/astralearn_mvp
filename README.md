# BrainLeap MVP - AI-Powered Math Learning App

An interactive React Native app that helps students learn mathematics through AI-generated questions and intelligent answer verification using handwritten solutions.

## Features

- 📚 **Subject Selection**: Choose from Maths, Physics, or Chemistry (currently Maths only)
- 🎯 **Class-Based Questions**: Tailored questions for Class 8, 9, and 10
- 🤖 **AI Question Generation**: Questions generated using Google Gemini 2.5 Pro
- ✍️ **Whiteboard Drawing**: Solve problems by drawing on a digital canvas
- 🔍 **AI Vision Verification**: Answers verified using Gemini's vision capabilities
- 💡 **Intelligent Feedback**: Get detailed feedback and correct answers

## Technology Stack

- **Framework**: React Native (Expo)
- **Navigation**: React Navigation
- **Drawing**: @shopify/react-native-skia
- **AI Service**: Google Gemini 2.5 Pro API
- **Gestures**: react-native-gesture-handler
- **Image Capture**: react-native-view-shot

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- A Google Gemini API key (get it from [Google AI Studio](https://aistudio.google.com/app/apikey))

## Installation

1. **Clone or navigate to the project directory**:
   ```bash
   cd /media/brito/storage/projects/brainleap_mvp
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure your Gemini API Key**:
   - Open `config.js` in the root directory
   - Replace `YOUR_GEMINI_API_KEY_HERE` with your actual API key:
     ```javascript
     export const GEMINI_API_KEY = 'your_actual_api_key_here';
     ```

## Running the App

### Development Mode

Start the Expo development server:

```bash
npm start
```

This will open the Expo DevTools in your browser. From there, you can:

- Press `a` to open on Android emulator/device
- Press `i` to open on iOS simulator
- Scan the QR code with the Expo Go app on your physical device

### Platform-Specific Commands

**For Android**:
```bash
npm run android
```

**For iOS** (macOS only):
```bash
npm run ios
```

**For Web**:
```bash
npm run web
```

## Building for Production

### Android APK

```bash
expo build:android
```

### iOS IPA

```bash
expo build:ios
```

### Using EAS Build (Recommended)

1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```

2. Configure and build:
   ```bash
   eas build --platform android
   # or
   eas build --platform ios
   ```

## How to Use

1. **Launch the app** and you'll see the selection screen
2. **Choose a subject** (currently only Maths is available)
3. **Select your class** (8, 9, or 10)
4. **Tap "Start Learning"** to get your first question
5. **Draw your solution** on the whiteboard using your finger/stylus
6. **Submit** when you're done to get AI-powered feedback
7. **Get instant verification** and detailed feedback
8. **Try again** if incorrect, or move to the **next question**

## Project Structure

```
brainleap_mvp/
├── App.js                      # Main app entry point
├── config.js                   # Configuration (API keys)
├── package.json                # Dependencies
├── babel.config.js             # Babel configuration
├── app.json                    # Expo configuration
│
├── src/
│   ├── screens/
│   │   ├── SelectionScreen.js  # Subject and class selection
│   │   └── QuestionScreen.js   # Question display and solving
│   │
│   ├── components/
│   │   └── Whiteboard.js       # Drawing canvas component
│   │
│   ├── services/
│   │   └── geminiService.js    # AI integration (Gemini API)
│   │
│   └── utils/
│       └── canvasToImage.js    # Canvas to image conversion
│
└── assets/                     # App icons and images
```

## Configuration

### API Key Setup

The app requires a Google Gemini API key. You can get one for free from:
[Google AI Studio](https://aistudio.google.com/app/apikey)

Update the `config.js` file:

```javascript
export const GEMINI_API_KEY = 'YOUR_ACTUAL_API_KEY';
```

### App Configuration

You can modify the available subjects and classes in `config.js`:

```javascript
export const APP_CONFIG = {
  subjects: ['Maths', 'Physics', 'Chemistry'],
  classes: [8, 9, 10],
  activeSubjects: ['Maths'], // Currently active subjects
};
```

## Features in Development

- 🔬 Physics questions (Coming Soon)
- 🧪 Chemistry questions (Coming Soon)
- 📊 Score tracking and history
- 🎯 Difficulty levels
- 💡 Hints system
- 🏆 Achievements and badges

## Troubleshooting

### Common Issues

1. **"API key not valid" error**:
   - Ensure you've set the correct API key in `config.js`
   - Verify your API key is active in Google AI Studio

2. **Drawing not working**:
   - Make sure you've installed all dependencies
   - Try clearing the cache: `expo start -c`

3. **Build errors**:
   - Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
   - Clear Expo cache: `expo start -c`

4. **Canvas not capturing**:
   - Ensure `react-native-view-shot` is properly installed
   - On iOS, you may need to rebuild the app

## License

This project is private and proprietary.

## Support

For issues or questions, please contact the development team.

---

**Built with ❤️ using React Native and Google Gemini AI**

