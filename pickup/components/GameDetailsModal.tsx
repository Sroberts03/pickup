import React, { useState, useEffect } from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from "react-native";
import { Feather } from '@expo/vector-icons';
import { useTheme } from "@react-navigation/native";
import { useServer } from "@/contexts/ServerContext";
import { GameWithDetails } from "@/objects/Game";
import User from "@/objects/User";

interface GameDetailsModalProps {
    visible: boolean;
    game: GameWithDetails | null;
    onClose: () => void;
}

const GameDetailsModal: React.FC<GameDetailsModalProps> = ({ visible, game, onClose }) => {
    const { colors } = useTheme();
    const server = useServer();
    const [creator, setCreator] = useState<User | undefined>(undefined);
    const [players, setPlayers] = useState<User[]>([]);
    const [hasJoined, setHasJoined] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            if (game) {
                setIsLoading(true);
                try {
                    const [fetchedCreator, fetchedPlayers, currentUser] = await Promise.all([
                        server.getUser(game.createrId),
                        server.getGamePlayers(game.id),
                        server.getCurrentUser()
                    ]);
                    setCreator(fetchedCreator);
                    setPlayers(fetchedPlayers);

                    if (currentUser) {
                        setHasJoined(fetchedPlayers.some(p => p.id === currentUser.user.id));
                    }
                } catch (error) {
                    console.error("Failed to fetch game details:", error);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        if (visible) {
            fetchDetails();
        }
    }, [visible, game, server]);

    const handleJoinLeave = async () => {
        if (!game) return;
        setIsActionLoading(true);
        try {
            if (hasJoined) {
                await server.leaveGame(game.id);
                setHasJoined(false);
                setPlayers(prev => prev.filter(p => !p.id)); // Optimistic update: ideally we filter by ID but we don't have current user ID handy without refetching or storing it 
                // Let's refetch to be safe and simple
                const fetchedPlayers = await server.getGamePlayers(game.id);
                setPlayers(fetchedPlayers);
            } else {
                await server.joinGame(game.id);
                setHasJoined(true);
                const fetchedPlayers = await server.getGamePlayers(game.id);
                setPlayers(fetchedPlayers);
            }
        } catch (error) {
            Alert.alert("Error", "Failed to update game participation.");
            console.error(error);
        } finally {
            setIsActionLoading(false);
        }
    };

    if (!game) return null;

    function getSportImage(sportName: string) {
        const key = sportName.toLowerCase();
        if (key.includes("basketball")) return require("../assets/images/basketball.png");
        if (key.includes("soccer")) return require("../assets/images/soccer.png");
        if (key.includes("football")) return require("../assets/images/football.png");
        return require("../assets/images/football.png");
    }

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.backButton}>
                        <Feather name="chevron-left" size={30} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>{game.sportName.toUpperCase()}</Text>
                    <View style={{ width: 30 }} />
                </View>

                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                ) : (
                    <ScrollView style={styles.content}>
                        <Text style={[styles.dateText, { color: colors.text }]}>
                            {new Date(game.startTime).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </Text>

                        <Image source={getSportImage(game.sportName)} style={styles.mainImage} />

                        <Text style={[styles.title, { color: colors.text }]}>{game.name}</Text>
                        <Text style={[styles.description, { color: colors.text }]}>{game.description}</Text>

                        <View style={styles.mapContainer}>
                            <Text style={{ color: '#888' }}>MAP</Text>
                        </View>
                        <Text style={[styles.locationText, { color: colors.text }]}>Location ID: {game.locationId}</Text>

                        <View style={styles.section}>
                            <View style={styles.rulesContainer}>
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>RULES</Text>
                                <View style={[styles.rulesBox, { backgroundColor: colors.card }]}>
                                    <Text style={{ color: colors.text }}>{game.rules || "No specific rules."}</Text>
                                </View>
                            </View>

                            <View style={styles.spotsContainer}>
                                <View style={styles.playerAvatars}>
                                    {/* Simple piles of circles */}
                                    {players.slice(0, 3).map((p, i) => (
                                        <View key={i} style={[styles.playerCircle, { backgroundColor: '#555', left: i * 20, zIndex: 10 - i }]} />
                                    ))}
                                </View>
                                <Text style={[styles.spotsText, { color: colors.text }]}>{game.maxPlayers - players.length} SPOTS LEFT</Text>

                                {creator && (
                                    <View style={styles.creatorContainer}>
                                        <View style={[styles.creatorAvatar, { backgroundColor: '#ccc' }]}>
                                            {creator.profilePicUrl ? <Image source={{ uri: creator.profilePicUrl }} style={styles.avatarImage} /> : null}
                                        </View>
                                        <Text style={[styles.creatorName, { color: colors.text }]}>{creator.firstName}</Text>
                                        <Text style={[styles.creatorLabel, { color: colors.text }]}>CREATOR</Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        <View style={{ height: 100 }} />
                    </ScrollView>
                )}

                <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: hasJoined ? '#FF3B30' : '#007AFF' }]}
                        onPress={handleJoinLeave}
                        disabled={isActionLoading}
                    >
                        {isActionLoading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.actionButtonText}>{hasJoined ? "LEAVE" : "JOIN"}</Text>
                        )}
                    </TouchableOpacity>
                </View>
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
        paddingHorizontal: 15,
        paddingTop: 20,
        paddingBottom: 10,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    dateText: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 15,
        textAlign: 'center',
        opacity: 0.6,
    },
    mainImage: {
        width: '100%',
        height: 200,
        borderRadius: 15,
        marginBottom: 20,
        backgroundColor: '#e0e0e0',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    description: {
        fontSize: 16,
        marginBottom: 20,
        opacity: 0.8,
    },
    mapContainer: {
        width: '100%',
        height: 150,
        backgroundColor: '#e0e0e0',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    locationText: {
        fontSize: 14,
        marginBottom: 30,
        opacity: 0.6,
    },
    section: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 10,
        opacity: 0.6,
    },
    rulesContainer: {
        flex: 1,
        marginRight: 15,
    },
    rulesBox: {
        padding: 15,
        borderRadius: 10,
        minHeight: 100,
    },
    spotsContainer: {
        flex: 1,
        alignItems: 'flex-end',
    },
    playerAvatars: {
        flexDirection: 'row',
        height: 40,
        marginBottom: 5,
        width: 80, // Ensure space for overlapping
    },
    playerCircle: {
        width: 35,
        height: 35,
        borderRadius: 17.5,
        position: 'absolute',
        borderWidth: 2,
        borderColor: 'white',
    },
    spotsText: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    creatorContainer: {
        alignItems: 'center',
    },
    creatorAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginBottom: 5,
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    creatorName: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    creatorLabel: {
        fontSize: 10,
        opacity: 0.6,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
    },
    actionButton: {
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    actionButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    }
});

export default GameDetailsModal;
