# WebSocket Client Documentation

This document explains how to use the Socket.io client that connects to your NestJS WebSocket gateway.

## Setup

### 1. Environment Configuration

Add the WebSocket server URL to your environment variables:

```bash
# .env or app.json
EXPO_PUBLIC_WEBSOCKET_URL=http://localhost:3000
# or for production:
# EXPO_PUBLIC_WEBSOCKET_URL=https://your-api-domain.com
```

### 2. Provider Setup

Wrap your app with the `SocketProvider` to make the socket available throughout your app:

```tsx
// app/_layout.tsx
import { SocketProvider } from '@/contexts/SocketProvider';
import { AuthProvider } from '@/auth/AuthProvider';
import { ServerProvider } from '@/contexts/ServerContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <ServerProvider>
        <SocketProvider>
          {/* Your app content */}
        </SocketProvider>
      </ServerProvider>
    </AuthProvider>
  );
}
```

**Important**: The `SocketProvider` should be inside `AuthProvider` and `ServerProvider` since it depends on the auth token.

## Usage

### Basic Connection

The `SocketProvider` automatically connects when a user is authenticated. You don't need to manually call `connect()` in most cases.

### Using the Socket in Components

```tsx
import { useSocket } from '@/contexts/SocketContext';

function MyComponent() {
  const socket = useSocket();
  
  // Use socket methods...
}
```

### Available Methods

#### Connection Management

```tsx
// Check connection status
const isConnected = socket.isConnected();

// Manually disconnect (usually not needed)
socket.disconnect();

// Manually connect with a token (usually handled by provider)
socket.connect(token);
```

#### Group Management

```tsx
// Join a group to receive messages
socket.joinGroup(groupId);

// Leave a group
socket.leaveGroup(groupId);
```

#### Messaging

```tsx
// Send a message
socket.sendMessage(groupId, "Hello everyone!");

// Send typing indicator
socket.sendTyping(groupId, true);  // Started typing
socket.sendTyping(groupId, false); // Stopped typing
```

### Event Listeners

Set up event listeners to receive real-time updates:

```tsx
useEffect(() => {
  if (!socket) return;

  socket.setEventListeners({
    onConnected: () => {
      console.log('Connected to server');
      // Auto-join groups when connected
      socket.joinGroup(groupId);
    },

    onDisconnected: () => {
      console.log('Disconnected from server');
    },

    onJoinedGroup: (response) => {
      console.log(`Joined group ${response.groupId}`);
    },

    onLeftGroup: (response) => {
      console.log(`Left group ${response.groupId}`);
    },

    onNewMessage: (message) => {
      // message: { id, groupId, userId, content, sentAt }
      setMessages(prev => [...prev, message]);
    },

    onUserTyping: (status) => {
      // status: { userId, groupId, isTyping }
      updateTypingIndicator(status);
    },

    onError: (error) => {
      console.error('Socket error:', error.message);
      alert(`Error: ${error.message}`);
    },
  });

  // Clean up when component unmounts
  return () => {
    socket.leaveGroup(groupId);
    socket.removeEventListeners();
  };
}, [socket, groupId]);
```

## Event Types

### Received Events (from server)

| Event | Payload | Description |
|-------|---------|-------------|
| `onConnected` | `void` | Socket connected to server |
| `onDisconnected` | `void` | Socket disconnected from server |
| `onJoinedGroup` | `{ groupId: number, message: string }` | Successfully joined a group |
| `onLeftGroup` | `{ groupId: number, message: string }` | Successfully left a group |
| `onNewMessage` | `{ id: number, groupId: number, userId: number, content: string, sentAt: string }` | New message in a group you've joined |
| `onUserTyping` | `{ userId: number, groupId: number, isTyping: boolean }` | Another user's typing status changed |
| `onError` | `{ message: string }` | An error occurred |

### Sent Events (to server)

| Method | Parameters | Description |
|--------|-----------|-------------|
| `joinGroup` | `groupId: number` | Join a group to receive messages |
| `leaveGroup` | `groupId: number` | Leave a group |
| `sendMessage` | `groupId: number, content: string` | Send a message to a group |
| `sendTyping` | `groupId: number, isTyping: boolean` | Broadcast typing status |

## Complete Example

See [GroupChatExample.tsx](../components/GroupChatExample.tsx) for a full working example with:
- Connection status display
- Message list
- Typing indicators
- Message input with auto-typing detection

## Testing

The client automatically uses a mock WebSocket implementation when running in test mode:

```bash
# Run in test mode
EXPO_PUBLIC_API_MODE=mock npm run start
```

The test WebSocket (`testWebsocket.ts`) simulates all the same functionality without requiring a real backend connection.

## Architecture

### Files

- `websocket/websocket.ts` - Socket.io client implementation and interfaces
- `websocket/testWebsocket.ts` - Mock WebSocket for testing
- `websocket/websocketFactory.ts` - Factory to create the appropriate client
- `contexts/SocketContext.ts` - React context for accessing the socket
- `contexts/SocketProvider.tsx` - Provider component that manages the socket connection
- `components/GroupChatExample.tsx` - Example usage component

### Flow

1. User logs in → Auth token is stored
2. `SocketProvider` detects token → Connects socket with token
3. Backend validates token → Connection established
4. Component calls `socket.joinGroup(groupId)` → Joins Socket.io room
5. Messages sent via `socket.sendMessage()` → Backend saves and broadcasts
6. Other clients in room receive via `onNewMessage` event

## Troubleshooting

### Socket won't connect

- Check that `EXPO_PUBLIC_WEBSOCKET_URL` is set correctly
- Verify the backend server is running
- Check console for authentication errors
- Ensure user is logged in and has a valid token

### Messages not received

- Verify you've called `socket.joinGroup(groupId)` 
- Check that event listeners are set up with `setEventListeners()`
- Confirm you're a member of the group (backend checks this)

### Typing indicator not working

- Typing indicators only broadcast to other users, not yourself
- Ensure you've joined the group before sending typing status
- Check network console for WebSocket events

## Best Practices

1. **Always clean up**: Call `leaveGroup()` and `removeEventListeners()` in cleanup functions
2. **Check connection status**: Use `isConnected()` before sending messages
3. **Handle errors**: Always provide an `onError` listener
4. **Auto-reconnect**: The client will automatically try to reconnect on disconnect
5. **Join on connect**: Re-join groups in the `onConnected` listener to handle reconnects
6. **Debounce typing**: Don't send typing status on every keystroke
