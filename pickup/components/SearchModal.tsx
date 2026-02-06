import React, { useState, useEffect } from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image, ActivityIndicator } from "react-native";
import { Feather } from '@expo/vector-icons';
import { useTheme } from "@react-navigation/native";
import { useServer } from "@/contexts/ServerContext";
import { GameWithDetails } from "@/objects/Game";
import User from "@/objects/User";
import UserDetailsModal from "./UserDetailsModal";

interface SearchModalProps {
    visible: boolean;
    onClose: () => void;
    onGameSelect: (game: GameWithDetails) => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ visible, onClose, onGameSelect }) => {
    const { colors } = useTheme();
    const server = useServer();
    const [query, setQuery] = useState("");
    const [activeTab, setActiveTab] = useState<'Games' | 'Users'>('Games');
    const [gameResults, setGameResults] = useState<GameWithDetails[]>([]);
    const [userResults, setUserResults] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.length > 0) {
                setIsLoading(true);
                try {
                    if (activeTab === 'Games') {
                        const results = await server.searchGames(query);
                        setGameResults(results);
                    } else {
                        const results = await server.searchUsers(query);
                        setUserResults(results);
                    }
                } catch (error) {
                    console.error("Search failed:", error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setGameResults([]);
                setUserResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [query, activeTab, server]);

    useEffect(() => {
        // Clear results when switching tabs or closing
        if (!visible) {
            setQuery("");
            setGameResults([]);
            setUserResults([]);
        }
    }, [visible]);

    const handleTabChange = (tab: 'Games' | 'Users') => {
        setActiveTab(tab);
        // Trigger search again for new tab if query exists
        if (query.length > 0) {
            // The useEffect will handle this since activeTab is a dependency
        } else {
            setGameResults([]);
            setUserResults([]);
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
                <View style={styles.header}>
                    <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Feather name="search" size={20} color={colors.text} style={styles.searchIcon} />
                        <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder={`Search ${activeTab}...`}
                            placeholderTextColor={colors.text + '80'}
                            value={query}
                            onChangeText={setQuery}
                            autoFocus={true}
                        />
                        {query.length > 0 && (
                            <TouchableOpacity onPress={() => setQuery("")}>
                                <Feather name="x-circle" size={18} color={colors.text} />
                            </TouchableOpacity>
                        )}
                    </View>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Text style={[styles.closeText, { color: colors.primary }]}>Cancel</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.tabs}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'Games' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
                        onPress={() => handleTabChange('Games')}
                    >
                        <Text style={[styles.tabText, { color: activeTab === 'Games' ? colors.primary : colors.text }]}>Games</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'Users' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
                        onPress={() => handleTabChange('Users')}
                    >
                        <Text style={[styles.tabText, { color: activeTab === 'Users' ? colors.primary : colors.text }]}>Users</Text>
                    </TouchableOpacity>
                </View>

                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                ) : (
                    <ScrollView style={styles.resultsContainer}>
                        {activeTab === 'Games' ? (
                            gameResults.map(game => (
                                <TouchableOpacity
                                    key={game.id}
                                    style={[styles.resultItem, { borderBottomColor: colors.border }]}
                                    onPress={() => onGameSelect(game)}
                                >
                                    <View>
                                        <Text style={[styles.resultTitle, { color: colors.text }]}>{game.name}</Text>
                                        <Text style={[styles.resultSubtitle, { color: colors.text + '99' }]}>{game.sportName} • {game.startTime.toString().substring(0, 10)}</Text>
                                    </View>
                                    <Feather name="chevron-right" size={20} color={colors.text + '80'} />
                                </TouchableOpacity>
                            ))
                        ) : (
                            userResults.map(user => (
                                <TouchableOpacity 
                                    key={user.id} 
                                    style={[styles.resultItem, { borderBottomColor: colors.border }]}
                                    onPress={() => setSelectedUser(user)}
                                >
                                    <View style={styles.userRow}>
                                        <View style={[styles.avatar, { backgroundColor: colors.card }]}>
                                            {user.profilePicUrl ? (
                                                <Image source={{ uri: user.profilePicUrl }} style={styles.avatarImage} />
                                            ) : (
                                                <Feather name="user" size={20} color={colors.text} />
                                            )}
                                        </View>
                                        <View>
                                            <Text style={[styles.resultTitle, { color: colors.text }]}>{user.firstName} {user.lastName}</Text>
                                            <Text style={[styles.resultSubtitle, { color: colors.text + '99' }]}>{user.email}</Text>
                                        </View>
                                    </View>
                                    <Feather name="chevron-right" size={20} color={colors.text + '80'} />
                                </TouchableOpacity>
                            ))
                        )}
                        {query.length > 0 && ((activeTab === 'Games' && gameResults.length === 0) || (activeTab === 'Users' && userResults.length === 0)) && (
                            <Text style={[styles.noResults, { color: colors.text + '80' }]}>No results found</Text>
                        )}
                    </ScrollView>
                )}
                
                {selectedUser && (
                    <UserDetailsModal
                        visible={!!selectedUser}
                        user={selectedUser}
                        onClose={() => setSelectedUser(null)}
                    />
                )}
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        marginBottom: 15,
        gap: 10,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 10,
        borderWidth: 1,
        paddingHorizontal: 10,
        height: 40,
    },
    searchIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 5,
    },
    closeButton: {
        paddingVertical: 5,
    },
    closeText: {
        fontSize: 16,
    },
    tabs: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc', // fallback
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
    },
    tabText: {
        fontSize: 16,
        fontWeight: '600',
    },
    loadingContainer: {
        paddingTop: 50,
        alignItems: 'center',
    },
    resultsContainer: {
        flex: 1,
    },
    resultItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
    },
    resultTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    resultSubtitle: {
        fontSize: 14,
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    noResults: {
        textAlign: 'center',
        marginTop: 40,
        fontSize: 16,
    }
});

export default SearchModal;
