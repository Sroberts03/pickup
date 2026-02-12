# Maestro Tests for Pickup

This directory contains Maestro test flows for the Pickup app.

## Running Tests

### Run all tests
```bash
npm run maestro
```

### Run a specific flow
```bash
maestro test .maestro/login-flow.yaml
```

### Run with iOS Simulator
```bash
maestro test --platform=ios .maestro/login-flow.yaml
```

### Record a test execution
```bash
maestro record .maestro/login-flow.yaml
```

## Test Flows

- `login-flow.yaml` - Tests user login functionality
- `signup-flow.yaml` - Tests user signup functionality  
- `navigation-flow.yaml` - Tests navigation between app tabs

## Writing New Tests

Maestro uses YAML files to define test flows. Each flow contains a series of commands:

- `launchApp` - Launches the app
- `tapOn` - Taps on an element (by text or id)
- `assertVisible` - Verifies an element is visible
- `inputText` - Inputs text into a field
- `swipe` - Swipes in a direction
- `scroll` - Scrolls to find an element

### Example Pattern

```yaml
appId: host.exp.Exponent
---
- launchApp
- tapOn: "Button Text"
- assertVisible: "Expected Result"
```

## Tips

1. Use `testID` props in your React Native components for reliable element selection
2. Use `maestro studio` for interactive test development
3. Tests run on the iOS Simulator or Android Emulator
4. For Expo apps, the appId is typically `host.exp.Exponent`

## Documentation

- [Maestro Documentation](https://maestro.mobile.dev/)
- [Command Reference](https://maestro.mobile.dev/api-reference/commands)
