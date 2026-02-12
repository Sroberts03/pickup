# Adding testIDs for Maestro Testing

## Why testIDs?

testIDs make your Maestro tests more reliable by providing stable identifiers for UI elements, independent of changing text or labels.

## Example: Login Screen

### Before (less reliable)
```tsx
<TouchableOpacity onPress={handleLogin}>
  <Text>Login</Text>
</TouchableOpacity>
```

Maestro test:
```yaml
- tapOn: "Login"  # Breaks if text changes to "Log In" or "Sign In"
```

### After (more reliable)
```tsx
<TouchableOpacity testID="login-button" onPress={handleLogin}>
  <Text>Login</Text>
</TouchableOpacity>
```

Maestro test:
```yaml
- tapOn: { id: "login-button" }  # Stable, won't break
```

## Common Patterns

### Buttons
```tsx
<TouchableOpacity testID="create-game-button">
  <Text>Create Game</Text>
</TouchableOpacity>
```

### Text Inputs
```tsx
<TextInput 
  testID="email-input"
  placeholder="Email"
  value={email}
  onChangeText={setEmail}
/>
```

### Tab Bar Items
```tsx
<Tabs.Screen
  name="index"
  options={{
    title: "Play",
    tabBarTestID: "home-tab",
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="basketball-outline" size={size} color={color} />
    ),
  }}
/>
```

### Lists & Items
```tsx
<FlatList
  testID="games-list"
  data={games}
  renderItem={({ item }) => (
    <TouchableOpacity testID={`game-item-${item.id}`}>
      <Text>{item.title}</Text>
    </TouchableOpacity>
  )}
/>
```

### Modals
```tsx
<Modal visible={isVisible} testID="game-details-modal">
  <View>
    <Text testID="modal-title">Game Details</Text>
    <TouchableOpacity testID="close-modal-button">
      <Text>Close</Text>
    </TouchableOpacity>
  </View>
</Modal>
```

## Naming Conventions

Use kebab-case and descriptive names:
- ✅ `login-button`, `email-input`, `game-list`
- ❌ `btn1`, `input`, `list`

Be specific:
- ✅ `create-game-button`, `join-game-button`
- ❌ `button`, `submit`

For dynamic items, use IDs:
- ✅ `game-item-${gameId}`, `user-${userId}`
- ❌ `item-0`, `item-1`

## Where to Add testIDs

Add testIDs to:
1. **Buttons & Touchables** - All clickable elements
2. **Inputs** - TextInput fields
3. **Navigation** - Tab items, header buttons
4. **Lists** - FlatList/ScrollView and their items
5. **Modals** - Modal containers and key modal elements
6. **Key Text** - Important labels, titles, error messages

## Example: Updated Tab Layout

```tsx
<Tabs.Screen
  name="index"
  options={{
    title: "Play",
    tabBarTestID: "home-tab",
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="basketball-outline" size={size} color={color} />
    ),
  }}
/>
<Tabs.Screen
  name="map"
  options={{
    title: "Map",
    tabBarTestID: "map-tab",
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="map-outline" size={size} color={color} />
    ),
  }}
/>
```

## Using in Maestro

Once you have testIDs, use them in your flows:

```yaml
# Tap by ID (preferred)
- tapOn: { id: "login-button" }

# Assert visibility
- assertVisible: { id: "home-tab" }

# Input text
- tapOn: { id: "email-input" }
- inputText: "test@example.com"

# Dynamic IDs
- tapOn: { id: "game-item-123" }
```

## Pro Tips

1. **Add testIDs incrementally** - Start with your main user flows
2. **Use Maestro Studio** - See what IDs are available: `maestro studio`
3. **Keep IDs stable** - Don't change testIDs unless necessary
4. **Document IDs** - Keep a list of important testIDs for your team
5. **Combine with text** - Use text matching for labels that won't change

## Testing Your testIDs

1. Add a testID to a component
2. Rebuild your app: `npm run test_ios`
3. Open Maestro Studio: `npm run maestro:studio`
4. Click on the element to verify the testID appears
