import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@react-navigation/native";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useRouter } from "expo-router";

export default function SignupScreen() {
  const { colors } = useTheme();
  const { signup } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async () => {
    try {
      setLoading(true);
      setError("");
      await signup(email, password, name);
      // Navigation happens automatically when user state updates
    } catch (err) {
      setError("Signup failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>Join us today</Text>

        {error && <Text style={[styles.error, { color: "red" }]}>{error}</Text>}

        <TextInput
          style={[
            styles.input,
            {
              borderColor: colors.border || "#ccc",
              color: colors.text,
              backgroundColor: colors.card,
            },
          ]}
          placeholder="Full Name"
          placeholderTextColor={colors.text + "80"}
          value={name}
          onChangeText={setName}
          editable={!loading}
        />

        <TextInput
          style={[
            styles.input,
            {
              borderColor: colors.border || "#ccc",
              color: colors.text,
              backgroundColor: colors.card,
            },
          ]}
          placeholder="Email"
          placeholderTextColor={colors.text + "80"}
          value={email}
          onChangeText={setEmail}
          editable={!loading}
        />

        <TextInput
          style={[
            styles.input,
            {
              borderColor: colors.border || "#ccc",
              color: colors.text,
              backgroundColor: colors.card,
            },
          ]}
          placeholder="Password"
          placeholderTextColor={colors.text + "80"}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleSignup}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? "Creating Account..." : "Sign Up"}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/login")}>
          <Text style={[styles.link, { color: colors.primary }]}>
            Already have an account? Sign In
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.6,
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  link: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 14,
  },
  error: {
    marginBottom: 12,
    fontSize: 14,
  },
});
