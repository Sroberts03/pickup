# 🎯 Getting Started with Maestro - Your Next Steps

## ✅ What's Been Set Up

You now have Maestro installed and configured with:
- ✅ Maestro CLI installed
- ✅ Sample test flows in `.maestro/` folder
- ✅ testIDs added to tab navigation
- ✅ npm scripts for easy test running
- ✅ Comprehensive guides and documentation

## 🚀 Start Here (5 Minutes)

### Step 1: Start Your App
Open a terminal and run:
```bash
cd /Users/samroberts/Documents/pickup/pickup
npm run test_ios
```
Wait for the app to fully load in the simulator.

### Step 2: Open Maestro Studio
Open a **second terminal** and run:
```bash
npm run maestro:studio
```

This opens an interactive tool where you can:
- See your app in a preview
- Click on elements to see their selectors
- Generate test commands automatically
- Test commands in real-time

### Step 3: Explore Your App
In Maestro Studio:
1. Click around your app
2. Notice how Maestro identifies elements (text, IDs, etc.)
3. Try clicking on the tab bar to see the testIDs you just added
4. Copy any generated commands to use in your tests

### Step 4: Run Your First Test
In a **third terminal**, run:
```bash
npm run maestro:login
```

Watch as Maestro automatically tests your login flow! (Note: you may need to update the test with your actual screen text/IDs)

## 📝 Update Your First Test

The sample tests need to be updated with your actual UI elements:

1. Open [`.maestro/login-flow.yaml`](.maestro/login-flow.yaml)
2. Update the text/IDs to match your actual app
3. Use Maestro Studio to find the correct selectors
4. Run the test: `maestro test .maestro/login-flow.yaml`
5. Iterate until it passes

## 🎨 Add More testIDs

For reliable tests, add testIDs to your key components:

1. Check [TESTID_GUIDE.md](TESTID_GUIDE.md) for examples
2. Add testIDs to buttons, inputs, and navigation elements
3. Rebuild your app: Stop and restart `npm run test_ios`
4. Verify testIDs in Maestro Studio

### Priority Components to Add testIDs:
- [ ] Login screen buttons and inputs
- [ ] Signup screen buttons and inputs
- [ ] Create game button and modal
- [ ] Game list items
- [ ] Filter/search buttons
- [ ] Profile action buttons

## 📚 Documentation Quick Links

- [MAESTRO_GUIDE.md](MAESTRO_GUIDE.md) - Complete getting started guide
- [TESTID_GUIDE.md](TESTID_GUIDE.md) - How to add testIDs to components
- [.maestro/QUICK_REFERENCE.md](.maestro/QUICK_REFERENCE.md) - Command cheat sheet
- [.maestro/advanced-patterns.yaml](.maestro/advanced-patterns.yaml) - Advanced examples

## 🧪 Recommended Test Coverage

Create flows for these key user journeys:

1. **Authentication**
   - [x] Login (template created)
   - [x] Signup (template created)
   - [ ] Logout
   - [ ] Password reset (if applicable)

2. **Core Features**
   - [ ] Create a game
   - [ ] Join a game
   - [ ] Browse available games
   - [ ] Filter games by sport/location
   - [ ] View game details

3. **Navigation**
   - [x] Tab navigation (template created)
   - [ ] Navigate to group details
   - [ ] Open profile settings
   - [ ] View my games

4. **Profile/Settings**
   - [ ] Edit profile
   - [ ] Update favorite sports
   - [ ] View own profile

## 🔄 Daily Workflow

1. **Develop a feature**
2. **Add testIDs** to new components
3. **Write/update test flow** in `.maestro/`
4. **Run test** with `maestro test .maestro/your-flow.yaml`
5. **Iterate** until test passes
6. **Run all tests** with `npm run maestro` before committing

## 💡 Tips for Success

1. **Start small** - Get one simple flow working first
2. **Use Studio** - It's the fastest way to learn
3. **Be explicit** - Use testIDs over text matching when possible
4. **Keep flows focused** - One flow = one user journey
5. **Run frequently** - Catch issues early
6. **Document non-obvious selectors** - Help your team

## 🆘 Troubleshooting

### "No devices found"
- Make sure your simulator is running: `npm run sim`
- Check available devices: `xcrun simctl list devices`

### Test can't find element
- Use `maestro studio` to verify the selector
- Add a testID to the component
- Try using text matching if testID isn't available
- Check if the element is in a modal or scrollable view

### App not launching
- Verify the appId in your flow: `appId: host.exp.Exponent`
- Make sure the app is built and installed in the simulator
- Try launching manually first: `npm run test_ios`

### Tests are flaky
- Add `waitForAnimationToEnd: true` to tap commands
- Use `assertVisible` before tapping to ensure element is ready
- Add explicit waits in ms: `- wait: 1000` (use sparingly)

## 📊 Next Level

Once you're comfortable:

1. **CI/CD Integration** - Run tests in GitHub Actions
2. **Maestro Cloud** - Run tests on real devices
3. **Record videos** - `maestro record` for bug reports
4. **Modular flows** - Create reusable flow components
5. **Data-driven tests** - Use env vars for different test scenarios

## 🎓 Learning Resources

- [Official Docs](https://maestro.mobile.dev/)
- [Command Reference](https://maestro.mobile.dev/api-reference/commands)
- [Best Practices](https://maestro.mobile.dev/platform-support/best-practices)
- [Example Flows](https://github.com/mobile-dev-inc/maestro/tree/main/maestro-test)

## 🎉 You're Ready!

You have everything you need to start testing with Maestro. Begin with `maestro studio` and experiment. Testing should be fun and give you confidence in your app!

Happy testing! 🚀
