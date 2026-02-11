/**
 * Example: How to use the Socket.io client in a React component
 * 
 * This demonstrates all the WebSocket functionality matching your backend gateway
 */

import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import { useSocket } from '../contexts/SocketContext';
import { GroupMessage, TypingStatus } from '../websocket/websocket';

interface GroupChatExampleProps {
  groupId: number;
  currentUserId: number;
}

export const GroupChatExample: React.FC<GroupChatExampleProps> = ({ groupId, currentUserId }) => {
  const socket = useSocket();
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!socket) return;

    // Set up event listeners
    socket.setEventListeners({
      onConnected: () => {
        console.log('Socket connected!');
        setIsConnected(true);
        // Join the group when connected
        socket.joinGroup(groupId);
      },

      onDisconnected: () => {
        console.log('Socket disconnected!');
        setIsConnected(false);
      },

      onJoinedGroup: (response) => {
        console.log(`Joined group ${response.groupId}: ${response.message}`);
        // You could load initial messages here if needed
      },

      onLeftGroup: (response) => {
        console.log(`Left group ${response.groupId}: ${response.message}`);
      },

      onNewMessage: (message) => {
        console.log('New message received:', message);
        setMessages((prev) => [...prev, message]);
        
        // Mark the message as read (you might want to do this conditionally)
        // Example: if the chat is currently visible
        // serverFacade.lastMessageRead(groupId, message.id);
      },

      onUserTyping: (status: TypingStatus) => {
        console.log(`User ${status.userId} typing:`, status.isTyping);
        
        // Don't show typing indicator for current user
        if (status.userId === currentUserId) return;
        
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          if (status.isTyping) {
            newSet.add(status.userId);
          } else {
            newSet.delete(status.userId);
          }
          return newSet;
        });
      },

      onError: (error) => {
        console.error('Socket error:', error.message);
        // You might want to show this to the user
        alert(`Error: ${error.message}`);
      },
    });

    // Cleanup: leave group when component unmounts
    return () => {
      socket.leaveGroup(groupId);
      socket.removeEventListeners();
    };
  }, [socket, groupId, currentUserId]);

  // Handle typing indicator
  useEffect(() => {
    if (!socket || !messageText) return;

    // Send typing started
    socket.sendTyping(groupId, true);

    // Set a timer to send typing stopped
    const timer = setTimeout(() => {
      socket.sendTyping(groupId, false);
    }, 3000);

    return () => {
      clearTimeout(timer);
      socket.sendTyping(groupId, false);
    };
  }, [messageText, socket, groupId]);

  const handleSendMessage = () => {
    if (!socket || !messageText.trim()) return;

    socket.sendMessage(groupId, messageText.trim());
    setMessageText('');
  };

  return (
    <View style={styles.container}>
      {/* Connection status */}
      <View style={styles.statusBar}>
        <Text style={[styles.statusText, isConnected ? styles.connected : styles.disconnected]}>
          {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </Text>
      </View>

      {/* Messages list */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageContainer,
              item.userId === currentUserId ? styles.myMessage : styles.otherMessage,
            ]}
          >
            <Text style={styles.messageUser}>User {item.userId}</Text>
            <Text style={styles.messageContent}>{item.content}</Text>
            <Text style={styles.messageTime}>
              {new Date(item.sentAt).toLocaleTimeString()}
            </Text>
          </View>
        )}
      />

      {/* Typing indicator */}
      {typingUsers.size > 0 && (
        <View style={styles.typingIndicator}>
          <Text style={styles.typingText}>
            {typingUsers.size === 1
              ? `User ${Array.from(typingUsers)[0]} is typing...`
              : `${typingUsers.size} users are typing...`}
          </Text>
        </View>
      )}

      {/* Message input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Type a message..."
          editable={isConnected}
        />
        <Button
          title="Send"
          onPress={handleSendMessage}
          disabled={!isConnected || !messageText.trim()}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  statusBar: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  connected: {
    color: 'green',
  },
  disconnected: {
    color: 'red',
  },
  messageContainer: {
    padding: 10,
    margin: 10,
    borderRadius: 10,
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E5EA',
  },
  messageUser: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  messageContent: {
    fontSize: 16,
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 10,
    opacity: 0.7,
  },
  typingIndicator: {
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  typingText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    fontSize: 16,
  },
});

/**
 * SIMPLE USAGE EXAMPLE:
 * 
 * // In your component:
 * const socket = useSocket();
 * 
 * // Connect (usually done in SocketProvider)
 * socket.connect(token);
 * 
 * // Join a group
 * socket.joinGroup(123);
 * 
 * // Send a message
 * socket.sendMessage(123, "Hello everyone!");
 * 
 * // Send typing status
 * socket.sendTyping(123, true);  // Started typing
 * socket.sendTyping(123, false); // Stopped typing
 * 
 * // Leave a group
 * socket.leaveGroup(123);
 * 
 * // Disconnect
 * socket.disconnect();
 */
