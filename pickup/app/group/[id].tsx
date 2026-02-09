import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Image, Modal, ScrollView } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useServer } from '@/contexts/ServerContext';
import { useAuth } from '@/contexts/AuthContext';
import GroupMessage from '@/objects/GroupMessage';
import User from '@/objects/User';
import UserDetailsModal from '@/components/UserDetailsModal';
import { useWebsocket } from '@/contexts/SocketContext';
import { SocketState } from '@/websocket/websocket';

export default function GroupChatScreen() {
    const websocket = useWebsocket();
    const { id, name } = useLocalSearchParams();
    const groupId = Number(id);
    const { colors } = useTheme();
    const server = useServer();
    const { user } = useAuth();
    const insets = useSafeAreaInsets();

    const [messages, setMessages] = useState<GroupMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [inputText, setInputText] = useState("");
    const [messageUsers, setMessageUsers] = useState<Map<number, User>>(new Map());
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showMembers, setShowMembers] = useState(false);
    const [members, setMembers] = useState<User[]>([]);

    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        if (websocket && websocket.readyState === SocketState.CLOSED) {
            console.log("Socket was closed, initiating connection...");
            websocket.connect();
        }
    }, [websocket]);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const fetchedMessages = await server.getGroupMessages(groupId);
                setMessages(fetchedMessages);

                const senderIds = new Set(fetchedMessages.map(m => m.userId));
                const userMap = new Map<number, User>();

                await Promise.all(Array.from(senderIds).map(async (senderId) => {
                    if (senderId === user?.id) {
                        userMap.set(senderId, user!);
                    } else {
                        const sender = await server.getUser(senderId);
                        if (sender) userMap.set(senderId, sender);
                    }
                }));

                setMessageUsers(userMap);
                setLoading(false);
            } catch (error) {
                console.error("Failed to load messages:", error);
                setLoading(false);
            }
        };

        if (user) fetchMessages();

        server.getGroupMembers(groupId).then(fetchedMembers => {
            setMembers(fetchedMembers.filter(m => m.id !== user?.id));
        });

        if (websocket) {
            websocket.onmessage = (event: { data: any }) => {
                try {
                    // 1. Most WebSockets send strings; you must parse them
                    const rawData = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

                    // 2. Ensure the data matches your GroupMessage structure
                    const newMessage = rawData as GroupMessage;

                    if (newMessage.groupId === groupId) {
                        setMessages(prev => [...prev, newMessage]);

                        // 3. Use a functional update for the Map to avoid dependency loops
                        setMessageUsers(prevMap => {
                            if (!prevMap.has(newMessage.userId)) {
                                // Fetch the user in the background if missing
                                server.getUser(newMessage.userId).then(sender => {
                                    if (sender) {
                                        setMessageUsers(current => new Map(current).set(sender.id, sender));
                                    }
                                });
                            }
                            return prevMap;
                        });
                    }
                } catch (e) {
                    console.error("Error handling socket message:", e);
                }
            };

            return () => {
                websocket.onmessage = null;
            };
        }
        // REMOVED messageUsers from dependencies to prevent infinite loops
    }, [groupId, server, user, websocket]);

    const handleSend = async () => {
        if (!inputText.trim() || sending || !websocket) return;

        const messageContent = inputText.trim();

        // Prepare the payload based on what your server expects
        const payload = JSON.stringify({
            type: 'SEND_GROUP_MESSAGE',
            groupId: groupId,
            content: messageContent,
            userId: user?.id,
            sentAt: new Date().toISOString()
        });

        try {
            setSending(true);

            websocket.send(payload);

            setInputText("");
        } catch (error) {
            console.error("Failed to send socket message:", error);
        } finally {
            setSending(false);
        }
    };

    const renderMessage = ({ item, index }: { item: GroupMessage, index: number }) => {
        const isCurrentUser = item.userId === user?.id;
        const sender = messageUsers.get(item.userId);

        // Use fun-emoji style to match profile
        const avatarUrl = sender
            ? `https://api.dicebear.com/7.x/fun-emoji/png?seed=${sender.id}`
            : `https://api.dicebear.com/7.x/fun-emoji/png?seed=${item.userId}`;

        const showAvatar = !isCurrentUser && (
            index === messages.length - 1 ||
            messages[index + 1].userId !== item.userId
        );

        // Date separator logic
        const messageDate = new Date(item.sentAt);
        const prevMessageDate = index > 0 ? new Date(messages[index - 1].sentAt) : null;

        const showDateSeparator = !prevMessageDate ||
            messageDate.getDate() !== prevMessageDate.getDate() ||
            messageDate.getMonth() !== prevMessageDate.getMonth();

        let dateLabel = "";
        if (showDateSeparator) {
            const now = new Date();
            if (messageDate.getDate() === now.getDate() && messageDate.getMonth() === now.getMonth()) {
                dateLabel = `Today ${messageDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
            } else {
                dateLabel = `${messageDate.toLocaleDateString(undefined, { weekday: 'long' })} ${messageDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
            }
        }

        const showName = !isCurrentUser && (
            index === 0 ||
            messages[index - 1].userId !== item.userId ||
            showDateSeparator
        );

        return (
            <View>
                {showDateSeparator && (
                    <View style={styles.dateSeparator}>
                        <Text style={styles.dateLabel}>{dateLabel}</Text>
                    </View>
                )}
                <View style={[
                    styles.messageContainer,
                    isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
                ]}>
                    {!isCurrentUser && (
                        <View style={styles.avatarContainer}>
                            {showAvatar ? (
                                <TouchableOpacity onPress={() => sender && setSelectedUser(sender)}>
                                    <Image source={{ uri: avatarUrl! }} style={styles.avatar} />
                                </TouchableOpacity>
                            ) : <View style={styles.avatarSpacer} />}
                        </View>
                    )}

                    <View style={{ maxWidth: '75%' }}>
                        {showName && sender && (
                            <Text style={styles.senderName}>
                                {sender.firstName} {sender.lastName}
                            </Text>
                        )}
                        <View style={[
                            styles.bubble,
                            { maxWidth: '100%' }, // Override since wrapper handles width constraint if needed, but actually wrapper has 75%
                            isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble
                        ]}>
                            <Text style={[
                                styles.messageText,
                                isCurrentUser ? styles.currentUserText : styles.otherUserText
                            ]}>
                                {item.content}
                            </Text>
                        </View>
                    </View>
                </View>
                {/* Spacer for grouping */}
                <View style={{ height: 2 }} />
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTitle: name as string || "Group Chat",
                    headerBackTitle: "Groups",
                    headerTintColor: colors.primary,
                    headerTitleStyle: { color: colors.text },
                    headerStyle: { backgroundColor: colors.background },
                    headerShadowVisible: false,
                    headerRight: () => (
                        <TouchableOpacity
                            onPress={() => setShowMembers(true)}
                            style={{
                                width: 44,
                                height: 44,
                                justifyContent: 'center',
                                alignItems: 'center',
                                alignSelf: 'center',
                            }}
                        >
                            <Ionicons name="information-circle-outline" size={30} color={colors.primary} />
                        </TouchableOpacity>
                    ),
                }}
            />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
            >
                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={renderMessage}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={[styles.listContent, { paddingBottom: 10 }]}
                        style={{ flex: 1 }}
                        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
                        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
                    />
                )}

                <View style={[
                    styles.inputContainer,
                    {
                        borderTopColor: colors.border,
                        backgroundColor: colors.background,
                        paddingBottom: Math.max(insets.bottom, 8)
                    }
                ]}>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
                        placeholder="Message"
                        placeholderTextColor={colors.text + '80'}
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                    />

                    {inputText.length > 0 ? (
                        <TouchableOpacity onPress={handleSend} style={styles.sendButton} disabled={sending}>
                            <Ionicons name="arrow-up-circle" size={32} color={colors.primary} />
                        </TouchableOpacity>
                    ) : (
                        <View style={{ width: 32 }} /> // Spacer to keep layout if needed or could show mic/camera
                    )}
                </View>
            </KeyboardAvoidingView>

            <UserDetailsModal
                visible={!!selectedUser}
                user={selectedUser}
                onClose={() => setSelectedUser(null)}
            />

            {/* Group Members Modal */}
            <Modal
                visible={showMembers}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowMembers(false)}
            >
                <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Group Members</Text>
                        <TouchableOpacity onPress={() => setShowMembers(false)}>
                            <Text style={{ color: colors.primary, fontSize: 16 }}>Done</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={styles.membersList}>
                        {members.length === 0 ? (
                            <Text style={[styles.emptyText, { color: colors.text }]}>No other members yet.</Text>
                        ) : (
                            members.map(member => (
                                <TouchableOpacity
                                    key={member.id}
                                    style={[styles.memberItem, { borderBottomColor: colors.border }]}
                                    onPress={() => {
                                        setShowMembers(false);
                                        // Wait a bit for the first modal to close
                                        setTimeout(() => setSelectedUser(member), 500);
                                    }}
                                >
                                    <Image
                                        source={{ uri: `https://api.dicebear.com/7.x/fun-emoji/png?seed=${member.id}` }}
                                        style={styles.memberAvatar}
                                    />
                                    <View>
                                        <Text style={[styles.memberName, { color: colors.text }]}>
                                            {member.firstName} {member.lastName}
                                        </Text>
                                        {member.email && (
                                            <Text style={styles.memberEmail}>{member.email}</Text>
                                        )}
                                    </View>
                                    <View style={{ flex: 1 }} />
                                    <Ionicons name="chevron-forward" size={20} color={colors.text + '80'} />
                                </TouchableOpacity>
                            ))
                        )}
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingVertical: 10,
        paddingHorizontal: 10,
    },
    dateSeparator: {
        alignItems: 'center',
        marginVertical: 10,
    },
    dateLabel: {
        fontSize: 12,
        color: '#8e8e93',
        fontWeight: '500',
    },
    messageContainer: {
        flexDirection: 'row',
        marginVertical: 1,
        alignItems: 'flex-end',
    },
    currentUserMessage: {
        justifyContent: 'flex-end',
    },
    otherUserMessage: {
        justifyContent: 'flex-start',
    },
    avatarContainer: {
        width: 30,
        marginRight: 8,
        justifyContent: 'flex-end',
    },
    avatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
    },
    avatarSpacer: {
        width: 28,
    },
    bubble: {
        maxWidth: '75%',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
    },
    currentUserBubble: {
        backgroundColor: '#007AFF', // Blue
        borderBottomRightRadius: 4,
    },
    otherUserBubble: {
        backgroundColor: '#E9E9EB', // Gray
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 20,
    },
    currentUserText: {
        color: '#fff',
    },
    otherUserText: {
        color: '#000',
    },
    senderName: {
        fontSize: 12,
        color: '#8e8e93',
        marginBottom: 4,
        marginLeft: 12,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderTopWidth: 1,
    },
    attachButton: {
        padding: 5,
    },
    input: {
        flex: 1,
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 8,
        marginHorizontal: 10,
        fontSize: 16,
        maxHeight: 100,
        width: '100%',
    },
    sendButton: {
        padding: 5,
    },
    modalContainer: {
        flex: 1,
        paddingTop: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#ccc',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    membersList: {
        paddingHorizontal: 20,
    },
    memberItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    memberAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 15,
    },
    memberName: {
        fontSize: 16,
        fontWeight: '500',
    },
    memberEmail: {
        fontSize: 12,
        color: '#8e8e93',
        marginTop: 2,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 30,
        fontSize: 16,
        opacity: 0.6,
    },
});
