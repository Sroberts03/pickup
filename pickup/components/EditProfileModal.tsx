import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  SafeAreaView, 
  TextInput, 
  ScrollView,
  Image,
  Switch,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';

interface EditProfileModalProps {
  onClose: () => void;
}

export default function EditProfileModal({ onClose }: EditProfileModalProps) {
  const { colors } = useTheme();
  const { user, updateUser } = useAuth();
  
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [isPublic, setIsPublic] = useState(user?.isPublic || false);
  const [showPublicTooltip, setShowPublicTooltip] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveChanges = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    setIsSaving(true);
    try {
      const updateData: any = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        isPublic: isPublic,
      };

      if (password.trim()) {
        updateData.password = password;
      }

      await updateUser(updateData);
      Alert.alert('Success', 'Profile updated successfully!');
      onClose();
    } catch (error) {
      console.error('Failed to update profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePicture = () => {
    // TODO: Implement profile picture change functionality
    Alert.alert('Change Picture', 'Profile picture feature coming soon!');
  };

  const togglePublicProfile = () => {
    setIsPublic(!isPublic);
  };

  return (
    <Modal
      visible={true}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>EDIT PROFILE</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Profile Picture Section */}
          <View style={styles.profilePictureSection}>
            <View style={styles.avatarContainer}>
              {user?.profilePicUrl ? (
                <Image source={{ uri: user.profilePicUrl }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person-outline" size={60} color="#757575" />
                </View>
              )}
            </View>
            <TouchableOpacity onPress={handleChangePicture}>
              <Text style={styles.changePictureText}>CHANGE PICTURE</Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, { backgroundColor: '#F5F5F5', color: colors.text }]}
                placeholder="First Name"
                placeholderTextColor="#999"
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, { backgroundColor: '#F5F5F5', color: colors.text }]}
                placeholder="Last Name"
                placeholderTextColor="#999"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, { backgroundColor: '#F5F5F5', color: colors.text }]}
                placeholder="Email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, { backgroundColor: '#F5F5F5', color: colors.text }]}
                placeholder="Password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
              />
            </View>

            {/* Public Profile Toggle */}
            <View style={styles.publicProfileContainer}>
              <View style={styles.publicProfileRow}>
                <TouchableOpacity 
                  onPress={() => setShowPublicTooltip(!showPublicTooltip)}
                  style={styles.publicProfileLabelContainer}
                >
                  <Ionicons name="information-circle-outline" size={20} color="#999" />
                  <Text style={[styles.publicProfileLabel, { color: colors.text }]}>
                    Public Profile
                  </Text>
                </TouchableOpacity>
                <Switch
                  value={isPublic}
                  onValueChange={togglePublicProfile}
                  trackColor={{ false: '#E0E0E0', true: '#34C759' }}
                  thumbColor={isPublic ? '#fff' : '#fff'}
                />
              </View>
              
              {showPublicTooltip && (
                <View style={styles.tooltip}>
                  <Text style={styles.tooltipText}>
                    Description of what a public profile is
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Save Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]} 
            onPress={handleSaveChanges}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profilePictureSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePictureText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  formSection: {
    paddingVertical: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    height: 50,
    paddingHorizontal: 15,
    borderRadius: 8,
    fontSize: 16,
  },
  publicProfileContainer: {
    marginTop: 10,
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  publicProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  publicProfileLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  publicProfileLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  tooltip: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#FFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  tooltipText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});