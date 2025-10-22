# Assets Directory

This directory contains the app's visual assets.

## Required Assets

Place the following image files in this directory:

1. **icon.png** (1024x1024) - App icon for all platforms
2. **splash.png** (1242x2436) - Splash screen image
3. **adaptive-icon.png** (1024x1024) - Android adaptive icon foreground
4. **favicon.png** (48x48) - Web favicon

## Generating Assets

You can use the following tools to create your assets:

- [App Icon Generator](https://www.appicon.co/)
- [Expo Asset Generator](https://github.com/expo/expo-cli)
- Online tools like Canva or Figma

## Default Assets

For development purposes, Expo will use default placeholder assets if these files are not present. However, for production builds, you should replace them with custom branded assets.

## Design Guidelines

### App Icon
- Size: 1024x1024 px
- Format: PNG with transparency
- No rounded corners (platforms handle this)
- High contrast and simple design works best

### Splash Screen
- Size: 1242x2436 px (iPhone 12 Pro Max)
- Format: PNG
- Center your logo/brand element
- Use solid background color matching your theme

### Adaptive Icon (Android)
- Size: 1024x1024 px
- Format: PNG with transparency
- Design should work with circular masks
- Keep important elements in the center circle (diameter ~640px)

