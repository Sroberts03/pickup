import { StyleSheet, ScrollView, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@react-navigation/native";
import { Feather } from '@expo/vector-icons';
import React from "react";

export default function Index() {
  const { colors } = useTheme();
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.content}>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.filterButton}>
            <Feather name="filter" size={30} style={{ color: colors.text }} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.searchButton}>
            <Feather name="search" size={30} style={{ color: colors.text }} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: "center",
    marginBottom: 30,
  },
  filterButton: {
    marginLeft: 15,
  },
  searchButton: {
    marginRight: 15,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
});
