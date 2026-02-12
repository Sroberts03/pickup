# Maestro Quick Reference

## Most Used Commands

```yaml
# 🚀 Launch
- launchApp

# 👆 Tap
- tapOn: "Button Text"
- tapOn: { id: "button-id" }

# ⌨️ Input
- inputText: "text to type"
- eraseText

# ✅ Assert
- assertVisible: "Expected Text"
- assertVisible: { id: "element-id" }
- assertNotVisible: "Should Not See This"

# 📜 Scroll
- scroll
- scrollUntilVisible: "Element To Find"

# 👈 Swipe
- swipe:
    direction: UP  # UP, DOWN, LEFT, RIGHT

# ⏮️ Navigate
- back

# ⏸️ Wait
- tapOn:
    text: "Submit"
    waitForAnimationToEnd: true

# 📸 Screenshot
- takeScreenshot: screenshots/name.png

# 🔗 Run Other Flow
- runFlow: login.yaml
```

## Terminal Commands

```bash
# Run all tests
npm run maestro

# Run specific test
maestro test .maestro/login-flow.yaml

# Interactive builder
npm run maestro:studio

# Record video
maestro record .maestro/login-flow.yaml

# Run with platform
maestro test --platform=ios .maestro/

# Run with env vars
maestro test --env EMAIL=test@example.com flow.yaml
```

## testID Examples

```tsx
// Button
<TouchableOpacity testID="login-button">

// Input
<TextInput testID="email-input" />

// Tab
tabBarTestID: "home-tab"

// List Item
testID={`game-${item.id}`}
```

## Selectors

```yaml
# By text
- tapOn: "Login"

# By ID
- tapOn: { id: "login-button" }

# By position
- tapOn:
    text: "Join"
    below: "Basketball"

# By index (when multiple)
- tapOn:
    text: "Join"
    index: 1
```

## Pro Tips

✅ Use `maestro studio` to explore your app  
✅ Add testIDs for reliability  
✅ Keep flows simple and focused  
✅ Use descriptive flow names  
✅ Run tests frequently during development  

## Links

- [Maestro Docs](https://maestro.mobile.dev/)
- [Commands](https://maestro.mobile.dev/api-reference/commands)
- Your guides: `MAESTRO_GUIDE.md`, `TESTID_GUIDE.md`
