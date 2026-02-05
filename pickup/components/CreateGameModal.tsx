import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  Alert,
  Platform
} from "react-native";
import { Feather } from '@expo/vector-icons';
import { useTheme } from "@react-navigation/native";
import { useServer } from "@/contexts/ServerContext";
import { useAuth } from "@/contexts/AuthContext";
import User from "@/objects/User";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Float } from "react-native/Libraries/Types/CodegenTypes";
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import MapView, { Marker } from "react-native-maps";

interface CreateGameModalProps {
  visible: boolean;
  onClose: () => void;
  onGameCreated: () => void;
}

const CreateGameModal: React.FC<CreateGameModalProps> = ({ visible, onClose, onGameCreated }) => {
  const { colors } = useTheme();
  const server = useServer();
  const user = useAuth().user as User;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date(Date.now() + 2 * 60 * 60 * 1000)); // 2 hours from now
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState<Float | null>(null);
  const [lng, setLng] = useState<Float | null>(null);
  const [maxPlayers, setMaxPlayers] = useState("");
  const [skillLevel, setSkillLevel] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [rules, setRules] = useState("");
  const [selectedSport, setSelectedSport] = useState("");
  const [sports, setSports] = useState<string[]>([]);
  const [skillLevels, setSkillLevels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [showSportPicker, setShowSportPicker] = useState(false);
  const [showSkillLevelPicker, setShowSkillLevelPicker] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [availableSports, availableSkillLevels] = await Promise.all([
          server.getPossibleSports(),
          server.getPossibleSkillLevels()
        ]);
        setSports(availableSports);
        setSkillLevels(availableSkillLevels);
        if (availableSports.length > 0) setSelectedSport(availableSports[0]);
        if (availableSkillLevels.length > 0) setSkillLevel(availableSkillLevels[0]);
      } catch (error) {
        console.error("Failed to fetch game options:", error);
      }
    };

    if (visible) {
      fetchOptions();
    }
  }, [visible, server]);

  const handleCreateGame = async () => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to create a game");
      return;
    }

    if (!name.trim()) {
      Alert.alert("Error", "Game name is required");
      return;
    }

    if (!maxPlayers || isNaN(Number(maxPlayers)) || Number(maxPlayers) < 1) {
      Alert.alert("Error", "Please enter a valid number for max players");
      return;
    }

    setIsLoading(true);
    try {
      // Find sport ID by name
      const sportIndex = sports.indexOf(selectedSport);
      const sportId = sportIndex !== -1 ? sportIndex + 1 : 1; // Default to first sport

      // Create a default location (in a real app, this would be based on the address)
      const locationId = 1; // Default location

      await server.createGame({
        name: name.trim(),
        description: description.trim(),
        sportId,
        startTime,
        endTime,
        locationId,
        maxPlayers: Number(maxPlayers),
        skillLevel: skillLevel as any,
        isPrivate,
        rules: rules.trim()
      });

      Alert.alert("Success", "Game created successfully!", [
        {
          text: "OK", onPress: () => {
            onGameCreated();
            onClose();
            resetForm();
          }
        }
      ]);
    } catch (error) {
      console.error("Failed to create game:", error);
      Alert.alert("Error", "Failed to create game. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setStartTime(new Date());
    setEndTime(new Date(Date.now() + 2 * 60 * 60 * 1000));
    setAddress("");
    setMaxPlayers("");
    setRules("");
    setIsPrivate(false);
  };

  const onStartTimeChange = (event: any, selectedDate?: Date) => {
    setShowStartTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setStartTime(selectedDate);
      // Auto-adjust end time to be 2 hours after start time
      setEndTime(new Date(selectedDate.getTime() + 2 * 60 * 60 * 1000));
    }
  };

  const onEndTimeChange = (event: any, selectedDate?: Date) => {
    setShowEndTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setEndTime(selectedDate);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Feather name="x" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>CREATE GAME</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: '#E5E5E5', color: '#333' }]}
              value={name}
              onChangeText={setName}
              placeholder="Enter game name"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Description</Text>
            <TextInput
              style={[styles.input, { backgroundColor: '#E5E5E5', color: '#333' }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter game description"
              placeholderTextColor="#999"
              multiline
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Start Time</Text>
            <TouchableOpacity
              style={[styles.input, { backgroundColor: '#E5E5E5' }]}
              onPress={() => setShowStartTimePicker(true)}
            >
              <Text style={{ color: '#333' }}>
                {startTime.toLocaleDateString()} {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>End Time</Text>
            <TouchableOpacity
              style={[styles.input, { backgroundColor: '#E5E5E5' }]}
              onPress={() => setShowEndTimePicker(true)}
            >
              <Text style={{ color: '#333' }}>
                {endTime.toLocaleDateString()} {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Address</Text>
            <GooglePlacesAutocomplete
              placeholder='Search for a court or park'
              onPress={(data, details = null) => {
                setAddress(data.description);
                if (details) {
                  setLat(details.geometry.location.lat as Float);
                  setLng(details.geometry.location.lng as Float);
                }
              }}
              query={{
                key: 'YOUR_GOOGLE_API_KEY',
                language: 'en',
                types: 'geocode',
              }}
              fetchDetails={true}
              styles={{
                textInput: [styles.input, { backgroundColor: '#E5E5E5', color: '#333' }],
                container: { flex: 0 }, // Prevents the search bar from taking over the screen
                listView: { backgroundColor: 'white', zIndex: 1000 }, // Ensures list stays on top
              }}
            />
          </View>

          <View style={styles.mapPlaceholder}>
            {lat && lng ? (
              <MapView
                style={StyleSheet.absoluteFillObject}
                region={{
                  latitude: lat,
                  longitude: lng,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }}
              >
                <Marker coordinate={{ latitude: lat, longitude: lng }} />
              </MapView>
            ) : (
              <Text style={[styles.mapText, { color: '#666' }]}>Select an address to see the map</Text>
            )}
          </View>

          <View style={[styles.mapPlaceholder, { backgroundColor: '#E5E5E5' }]}>
            <Text style={[styles.mapText, { color: '#666' }]}>MAP</Text>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={[styles.label, { color: colors.text }]}>Max Players</Text>
              <TextInput
                style={[styles.input, { backgroundColor: '#E5E5E5', color: '#333' }]}
                value={maxPlayers}
                onChangeText={setMaxPlayers}
                placeholder="8"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 2, marginLeft: 8 }]}>
              <Text style={[styles.label, { color: colors.text }]}>Skill Level</Text>
              <TouchableOpacity
                style={[styles.input, { backgroundColor: '#E5E5E5' }]}
                onPress={() => setShowSkillLevelPicker(true)}
              >
                <Text style={{ color: '#333' }}>{skillLevel || 'Select skill level'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.switchRow, { borderBottomColor: colors.border }]}>
            <View style={styles.switchInfo}>
              <Feather name="info" size={16} color={colors.text} />
              <Text style={[styles.switchLabel, { color: colors.text }]}>Private Game</Text>
            </View>
            <Switch
              value={isPrivate}
              onValueChange={setIsPrivate}
              trackColor={{ false: '#767577', true: '#4CAF50' }}
              thumbColor={isPrivate ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Rules</Text>
            <TextInput
              style={[styles.largeInput, { backgroundColor: '#E5E5E5', color: '#333' }]}
              value={rules}
              onChangeText={setRules}
              placeholder="Enter game rules"
              placeholderTextColor="#999"
              multiline
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Sport</Text>
            <TouchableOpacity
              style={[styles.input, { backgroundColor: '#E5E5E5' }]}
              onPress={() => setShowSportPicker(true)}
            >
              <Text style={{ color: '#333' }}>{selectedSport || 'Select sport'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.createButton, { opacity: isLoading ? 0.5 : 1 }]}
            onPress={handleCreateGame}
            disabled={isLoading}
          >
            <Text style={styles.createButtonText}>
              {isLoading ? "Creating..." : "Create Game"}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Centered Start Time Picker */}
        {showStartTimePicker && (
          <View style={styles.datePickerOverlay}>
            <View style={[styles.datePickerContainer, { backgroundColor: colors.background }]}>
              <Text style={[styles.datePickerTitle, { color: colors.text }]}>Select Start Time</Text>
              <DateTimePicker
                value={startTime}
                mode="datetime"
                display="spinner"
                onChange={onStartTimeChange}
                textColor={colors.text}
                themeVariant={colors.background === '#000000' ? 'dark' : 'light'}
              />
              <View style={styles.datePickerButtons}>
                <TouchableOpacity
                  style={[styles.datePickerButton, styles.cancelButton]}
                  onPress={() => setShowStartTimePicker(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.datePickerButton, styles.confirmButton]}
                  onPress={() => setShowStartTimePicker(false)}
                >
                  <Text style={styles.confirmButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Centered End Time Picker */}
        {showEndTimePicker && (
          <View style={styles.datePickerOverlay}>
            <View style={[styles.datePickerContainer, { backgroundColor: colors.background }]}>
              <Text style={[styles.datePickerTitle, { color: colors.text }]}>Select End Time</Text>
              <DateTimePicker
                value={endTime}
                mode="datetime"
                display="spinner"
                onChange={onEndTimeChange}
                textColor={colors.text}
                themeVariant={colors.background === '#000000' ? 'dark' : 'light'}
              />
              <View style={styles.datePickerButtons}>
                <TouchableOpacity
                  style={[styles.datePickerButton, styles.cancelButton]}
                  onPress={() => setShowEndTimePicker(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.datePickerButton, styles.confirmButton]}
                  onPress={() => setShowEndTimePicker(false)}
                >
                  <Text style={styles.confirmButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Centered Sport Picker */}
        {showSportPicker && (
          <View style={styles.datePickerOverlay}>
            <View style={[styles.pickerContainer, { backgroundColor: colors.background }]}>
              <Text style={[styles.pickerTitle, { color: colors.text }]}>Select Sport</Text>
              <ScrollView style={styles.pickerScrollView} showsVerticalScrollIndicator={false}>
                {sports.map((sport, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.pickerOption,
                      selectedSport === sport && { backgroundColor: '#007AFF20' }
                    ]}
                    onPress={() => {
                      setSelectedSport(sport);
                      setShowSportPicker(false);
                    }}
                  >
                    <Text style={[
                      styles.pickerOptionText,
                      { color: selectedSport === sport ? '#007AFF' : colors.text }
                    ]}>
                      {sport}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={[styles.datePickerButton, styles.cancelButton]}
                onPress={() => setShowSportPicker(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Centered Skill Level Picker */}
        {showSkillLevelPicker && (
          <View style={styles.datePickerOverlay}>
            <View style={[styles.pickerContainer, { backgroundColor: colors.background }]}>
              <Text style={[styles.pickerTitle, { color: colors.text }]}>Select Skill Level</Text>
              <ScrollView style={styles.pickerScrollView} showsVerticalScrollIndicator={false}>
                {skillLevels.map((level, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.pickerOption,
                      skillLevel === level && { backgroundColor: '#007AFF20' }
                    ]}
                    onPress={() => {
                      setSkillLevel(level);
                      setShowSkillLevelPicker(false);
                    }}
                  >
                    <Text style={[
                      styles.pickerOptionText,
                      { color: skillLevel === level ? '#007AFF' : colors.text }
                    ]}>
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={[styles.datePickerButton, styles.cancelButton]}
                onPress={() => setShowSkillLevelPicker(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  largeInput: {
    height: 80,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    textAlignVertical: 'top',
  },
  mapPlaceholder: {
    height: 120,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  mapText: {
    fontSize: 16,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
  },
  switchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 16,
    marginLeft: 8,
  },
  createButton: {
    backgroundColor: '#007AFF',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  datePickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerContainer: {
    borderRadius: 12,
    padding: 20,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  datePickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 16,
  },
  datePickerButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F2F2F2',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  pickerContainer: {
    borderRadius: 12,
    padding: 20,
    margin: 20,
    maxHeight: '60%',
    width: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  pickerScrollView: {
    maxHeight: 200,
    marginBottom: 16,
  },
  pickerOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 2,
  },
  pickerOptionText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default CreateGameModal;