# Maestro Testing Quick Start Guide

## What is Maestro?

Maestro is a mobile UI testing framework that's simple to use and reliable. It uses YAML files to describe test flows in a human-readable format.

## Getting Started

### 1. Ensure Maestro is installed
Maestro is already installed! The command is available at `~/.maestro/bin/maestro`

### 2. Start your app
In one terminal, run your app with mock data mode:
```bash
npm run test_ios
```

### 3. Run tests
In another terminal, run Maestro tests:
```bash
npm run maestro
```

## Available Commands

- `npm run maestro` - Run all test flows
- `npm run maestro:ios` - Run all tests explicitly on iOS
- `npm run maestro:login` - Run just the login test
- `npm run maestro:studio` - Open Maestro Studio (interactive test builder)

## Maestro Studio (Recommended for Beginners!)

Maestro Studio is an interactive tool that helps you write tests:

1. Start your app: `npm run test_ios`
2. In another terminal: `npm run maestro:studio`
3. Click on elements in the preview to generate test commands
4. Copy the generated YAML to your test files

## Test Flow Structure

Each test is a YAML file in the `.maestro/` folder:

```yaml
appId: host.exp.Exponent
---
# Your test commands go here
- launchApp
- tapOn: "Button Text"
- assertVisible: "Expected Text"
```

## Common Commands

### Navigation
- `tapOn: "Text"` - Tap on element with specific text
- `tapOn: { id: "element-id" }` - Tap using testID
- `swipe: { direction: UP }` - Swipe up/down/left/right
- `scroll` - Scroll to find element

### Input
- `inputText: "text to type"` - Type text
- `eraseText` - Clear text field

### Assertions
- `assertVisible: "Text"` - Check if text is visible
- `assertNotVisible: "Text"` - Check if text is NOT visible

### Waits
- `tapOn: { id: "button", waitForAnimationToEnd: true }` - Wait for animations
- `runFlow: auth-flow.yaml` - Run another flow

## Adding testIDs to Components

For reliable tests, add `testID` props to your React Native components:

```tsx
<TouchableOpacity testID="login-button">
  <Text>Login</Text>
</TouchableOpacity>
```

Then in Maestro:
```yaml
- tapOn: { id: "login-button" }
```

## Tips

1. **Start with Studio** - Use `maestro studio` to explore your app
2. **Use testIDs** - They're more reliable than text matching
3. **Keep flows simple** - Break complex tests into smaller flows
4. **Use descriptive names** - Name flows like `login-flow.yaml`, `create-game-flow.yaml`
5. **Run frequently** - Run tests as you develop to catch issues early

## Next Steps

1. Open Maestro Studio: `npm run maestro:studio`
2. Explore your app and see how Maestro identifies elements
3. Update the provided test flows with your actual screen text/IDs
4. Create new test flows for your key user journeys

## Troubleshooting

### "No devices found"
- Make sure your iOS Simulator is running
- Run: `xcrun simctl list devices`

### "App not found"
- For Expo apps in development, the appId is `host.exp.Exponent`
- For production builds, use your actual bundle ID

### Test fails to find element
- Use `maestro studio` to verify element text/IDs
- Add `testID` props to your components
- Use more specific selectors

## Documentation

- [Maestro Documentation](https://maestro.mobile.dev/)
- [Command Reference](https://maestro.mobile.dev/api-reference/commands)
- [Best Practices](https://maestro.mobile.dev/platform-support/best-practices)
