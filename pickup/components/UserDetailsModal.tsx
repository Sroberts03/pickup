import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, Image, ActivityIndicator, TouchableOpacity, ScrollView, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import User from '@/objects/User';
import { useServer } from '@/contexts/ServerContext';
import Sport from '@/objects/Sport';

interface UserDetailsModalProps {
    visible: boolean;
    user: User | null;
    onClose: () => void;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ visible, user, onClose }) => {
    const { colors } = useTheme();
    const server = useServer();
    const [stats, setStats] = useState<{ gamesPlayed: number; gamesOrganized: number } | null>(null);
    const [favoriteSports, setFavoriteSports] = useState<Sport[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Reporting state
    const [isReporting, setIsReporting] = useState(false);
    const [reportReason, setReportReason] = useState("");
    const [isSubmittingReport, setIsSubmittingReport] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            if (user && visible) {
                setLoading(true);
                setIsReporting(false);
                setReportReason("");
                try {
                    const [fetchedStats, fetchedSports] = await Promise.all([
                        server.getUserStats(user.id),
                        server.getFavouriteSports(user.id)
                    ]);
                    setStats(fetchedStats);
                    setFavoriteSports(fetchedSports);
                } catch (error) {
                    console.error("Failed to fetch user details:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchDetails();
    }, [user, visible, server]);

    const handleReport = async () => {
        if (!reportReason.trim()) {
            Alert.alert("Error", "Please provide a reason for reporting.");
            return;
        }
        
        if (user) {
            setIsSubmittingReport(true);
            try {
                await server.reportUser(user.id, reportReason);
                Alert.alert("Report Submitted", "Thank you for your report. We will review it shortly.", [
                   { text: "OK", onPress: () => setIsReporting(false) } 
                ]);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error) {
                Alert.alert("Error", "Failed to submit report. Please try again.");
            } finally {
                setIsSubmittingReport(false);
            }
        }
    };

    if (!user) return null;

    const userAvatar = `https://api.dicebear.com/7.x/fun-emoji/png?seed=${user.id}`;

    const getSportIcon = (sportName: string) => {
        const lowerName = sportName.toLowerCase();
        switch (lowerName) {
          case "basketball": return "basketball-outline";
          case "football": return "american-football-outline";
          case "soccer": return "football-outline";
          case "tennis": return "tennisball-outline";
          case "baseball": return "baseball-outline";
          case "volleyball": return "basketball-outline";
          default: return "ellipse-outline";
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>User Profile</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                         <Feather name="x" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                ) : (
                    <KeyboardAvoidingView 
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={{ flex: 1 }}
                    >
                    <ScrollView contentContainerStyle={styles.content}>
                        <View style={styles.profileSection}>
                            <View style={styles.avatarContainer}>
                                <Image source={{ uri: userAvatar }} style={styles.avatar} />
                            </View>
                            <Text style={[styles.name, { color: colors.text }]}>{user.firstName} {user.lastName}</Text>
                            <Text style={[styles.email, { color: colors.text }]}>{user.email}</Text>
                        </View>

                        {/* Favorite Sports */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>favorite sports</Text>
                            <View style={styles.pillsContainer}>
                                {favoriteSports.length > 0 ? favoriteSports.map((sport) => (
                                <View key={sport.id} style={styles.pill}>
                                    <Ionicons name={getSportIcon(sport.name) as any} size={16} color="#000" style={styles.pillIcon} />
                                    <Text style={styles.pillText}>{sport.name}</Text>
                                </View>
                                )) : (
                                    <Text style={{ color: colors.text, opacity: 0.6 }}>No favorite sports listed</Text>
                                )}
                            </View>
                        </View>

                        {/* Stats */}
                        {stats && (
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>quick stats</Text>
                            <View style={styles.statsContainer}>
                                <View style={styles.statItem}>
                                    <Text style={[styles.statValue, { color: colors.text }]}>{stats.gamesPlayed}</Text>
                                    <Text style={[styles.statLabel, { color: colors.text, opacity: 0.7 }]}>Games Joined</Text>
                                </View>
                                <View style={[styles.statItem, styles.statBorder]}>
                                    <Text style={[styles.statValue, { color: colors.text }]}>{stats.gamesOrganized}</Text>
                                    <Text style={[styles.statLabel, { color: colors.text, opacity: 0.7 }]}>Games Organized</Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text style={[styles.statValue, { color: colors.text }]}>{user.joinedYear}</Text>
                                    <Text style={[styles.statLabel, { color: colors.text, opacity: 0.7 }]}>Member Since</Text>
                                </View>
                            </View>
                        </View>
                        )}

                        {/* Report Section */}
                        <View style={[styles.section, { marginTop: 30 }]}>
                            {isReporting ? (
                                <View style={[styles.reportForm, { backgroundColor: colors.card }]}>
                                    <Text style={[styles.reportTitle, { color: colors.text }]}>Report User</Text>
                                    <TextInput 
                                        style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                                        placeholder="Reason for reporting..."
                                        placeholderTextColor={colors.text + '80'}
                                        multiline
                                        numberOfLines={3}
                                        value={reportReason}
                                        onChangeText={setReportReason}
                                    />
                                    <View style={styles.reportButtons}>
                                        <TouchableOpacity 
                                            style={[styles.button, styles.cancelButton]} 
                                            onPress={() => setIsReporting(false)}
                                        >
                                            <Text style={styles.cancelButtonText}>Cancel</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity 
                                            style={[styles.button, styles.submitButton]} 
                                            onPress={handleReport}
                                            disabled={isSubmittingReport}
                                        >
                                            {isSubmittingReport ? (
                                                <ActivityIndicator size="small" color="#fff" />
                                            ) : (
                                                <Text style={styles.submitButtonText}>Submit Report</Text>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ) : (
                                <TouchableOpacity 
                                    style={styles.reportButton}
                                    onPress={() => setIsReporting(true)}
                                >
                                    <Feather name="flag" size={18} color="#FF3B30" />
                                    <Text style={styles.reportButtonText}>Report User</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </ScrollView>
                    </KeyboardAvoidingView>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 4,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 20,
    },
    profileSection: {
        alignItems: 'center',
        marginBottom: 30,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        overflow: 'hidden',
        marginBottom: 16,
        elevation: 2,
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        opacity: 0.6,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        textTransform: 'lowercase',
    },
    pillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#006eff64',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    pillIcon: {
        marginRight: 6,
    },
    pillText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#000',
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: '#F5F5F5', // Light gray background
        borderRadius: 12,
        padding: 16,
        justifyContent: 'space-between',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statBorder: {
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: '#E0E0E0',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 10,
        textAlign: 'center',
    },
    reportButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        gap: 8,
    },
    reportButtonText: {
        color: '#FF3B30',
        fontWeight: '600',
    },
    reportForm: {
        padding: 16,
        borderRadius: 12,
        marginTop: 10,
    },
    reportTitle: {
        fontWeight: 'bold',
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        minHeight: 80,
        textAlignVertical: 'top',
        marginBottom: 10,
    },
    reportButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
    },
    button: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    cancelButton: {
        backgroundColor: '#E0E0E0',
    },
    cancelButtonText: {
        color: '#333',
    },
    submitButton: {
        backgroundColor: '#FF3B30',
    },
    submitButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
});

export default UserDetailsModal;
