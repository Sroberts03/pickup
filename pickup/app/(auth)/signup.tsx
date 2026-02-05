import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@react-navigation/native";
import { useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, TouchableOpacity, Image } from "react-native";
import { useRouter } from 'expo-router';
import logo from '@/assets/images/pickup.png';

export default function SignupPage() {
    const { signup } = useAuth();
    const { colors } = useTheme();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleSignup = async () => {
        if (!email || !password || !firstName || !lastName) {
            setError("Please fill in all required fields");
            return;
        }
        try {
            setError(null);
            await signup(email, password, firstName, lastName);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            setError("Signup failed. Please try again.");
        }
    };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
            <View>
                <Text style={[styles.title, { color: colors.text }]}>Sign Up</Text>
            </View>
            <View style={styles.logoContainer}>
                <Image source={logo} style={styles.logo} />
            </View>
            <View style={styles.form}>
                <TextInput 
                    placeholder="First Name" 
                    value={firstName} 
                    onChangeText={setFirstName}
                    style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                    placeholderTextColor={colors.text}
                />
                <TextInput 
                    placeholder="Last Name" 
                    value={lastName} 
                    onChangeText={setLastName}
                    style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                    placeholderTextColor={colors.text}
                />
                <TextInput 
                    placeholder="Email" 
                    value={email} 
                    onChangeText={setEmail}
                    style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                    placeholderTextColor={colors.text}
                    keyboardType="email-address"
                />
                <TextInput 
                    placeholder="Password" 
                    value={password} 
                    onChangeText={setPassword}
                    secureTextEntry
                    style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                    placeholderTextColor={colors.text}
                />
            </View>
            <View style={styles.loginTextContainer}>
                <Text style={[styles.loginText, { color: colors.text }]}>
                    Already have an account?
                </Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                    <Text style={[styles.loginLink, { color: '#007AFF' }]}>
                        Login.
                    </Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.button} onPress={handleSignup}>
                <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
            {error && <Text style={styles.error}>{error}</Text>}
            <View style={styles.termsContainer}>
                <Text style={[styles.termsText, { color: colors.text }]}>
                    By signing up, you agree to our{' '}
                    <Text style={styles.termsLink}>Terms and Conditions</Text>
                    {' '}and{' '}
                    <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
            </View>
        </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center'
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
  form: {
    marginVertical: 15,
  },
  imagePickerButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#007AFF',
    borderRadius: 100,
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    alignSelf: 'center',
  },
  profileImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  imagePickerText: {
    fontSize: 16,
    fontWeight: '600',
    alignSelf: 'center',
  },
  input: {
    borderWidth: 1,
    padding: 12,
    marginVertical: 8,
    borderRadius: 5,
  },
  toggleContainer: {
    marginVertical: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  toggleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
  loginTextContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    marginVertical: 15,
  },
  loginText: {
    textAlign: 'center',
  },
  loginLink: {
    fontWeight: 'bold',
  },
  termsContainer: {
    marginTop: 20,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  termsText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: '#007AFF',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});