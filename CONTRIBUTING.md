# Contributing to BrainLeap MVP

Thank you for your interest in contributing to BrainLeap MVP!

## Development Setup

1. Fork the repository
2. Clone your fork
3. Install dependencies: `npm install`
4. Set up your Gemini API key in `config.js`
5. Start development server: `npm start`

## Code Style

- Use functional components with hooks
- Follow ESLint rules
- Use meaningful variable and function names
- Add comments for complex logic
- Keep components focused and single-purpose

## Adding Features

### Adding New Subjects

To add support for Physics or Chemistry:

1. Update `config.js`:
   ```javascript
   activeSubjects: ['Maths', 'Physics', 'Chemistry']
   ```

2. Modify `src/services/geminiService.js`:
   - Update the `generateQuestion` function to handle different subjects
   - Add subject-specific prompts

### Adding New Question Types

1. Create question templates in the Gemini service
2. Update the verification logic if needed
3. Test thoroughly with various inputs

## Testing

Before submitting:

1. Test on both iOS and Android
2. Test with various question types
3. Test drawing and submission flow
4. Test error handling (network issues, invalid API key, etc.)

## Pull Request Process

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request with a clear description
5. Wait for review

## Questions?

Open an issue for any questions or clarifications.

