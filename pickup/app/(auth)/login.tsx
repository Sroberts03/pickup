import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, KeyboardAvoidingView, Platform} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const logo = require('@/assets/images/pickup.png'); 

export default function Login() {
  const { login } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      setError('');
      await login(email, password);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={styles.logoContainer}>
          <Image source={logo} style={styles.logo} />
        </View>
        <View style={styles.loginTextContainer}>
          <Text style={[styles.loginText, { color: colors.text }]}>
            Welcome back! Please login to your account.
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput 
            placeholder="Email" 
            value={email}
            testID='email-input' 
            onChangeText={setEmail} 
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            placeholderTextColor={colors.text}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <TextInput 
            placeholder="Password" 
            secureTextEntry 
            value={password}
            testID='password-input' 
            onChangeText={setPassword} 
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            placeholderTextColor={colors.text}
            autoCapitalize="none"
            autoComplete="password"
          />
        </View>
        <View style={styles.signUpTextContainer}>
          <Text style={[styles.signUpText, { color: colors.text }]}>
            Don&apos;t have an account?
          </Text>
          <TouchableOpacity onPress={() => router.push('/signup')}>
            <Text style={[styles.signUpText, {color: '#007AFF'}]}>
              Sign Up.
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleLogin} style={styles.button} testID='login-button'>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  loginTextContainer: {
    alignItems: 'center', 
    marginBottom: 20, 
  },
  loginText: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 20, 
  },
  container: { 
    flex: 1,
  },
  logoContainer: { 
    alignItems: 'center', 
    marginVertical: 20,
  },
  logo: { 
    width: 300, 
    height: 300, 
    resizeMode: 'contain' 
  },
  form: { 
    paddingHorizontal: 20
  },
  input: { 
    borderWidth: 1, 
    padding: 10, 
    marginVertical: 10, 
    borderRadius: 5 
  },
  signUpTextContainer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center',
    gap: 5 
  },
  signUpText: { 
    textAlign: 'center', 
    marginVertical: 10,
    paddingBottom: 10 
  },
  button: { 
    backgroundColor: '#007AFF', 
    padding: 15, 
    marginHorizontal: 20, 
    borderRadius: 5, 
    alignItems: 'center'
  },
  loginButtonText: { 
    color: 'white', 
    fontWeight: 'bold' 
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
    marginHorizontal: 20,
  },
});
