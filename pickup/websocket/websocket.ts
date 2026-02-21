import { io, Socket } from 'socket.io-client';

// Message types
export interface GroupMessage {
    id: number;
    groupId: number;
    userId: number;
    content: string;
    sentAt: string;
}

export interface TypingStatus {
    userId: number;
    groupId: number;
    isTyping: boolean;
}

export interface JoinedGroupResponse {
    groupId: number;
    message: string;
}

export interface LeftGroupResponse {
    groupId: number;
    message: string;
}

export interface ErrorResponse {
    message: string;
}

// Event listeners
export interface SocketEventListeners {
    onNewMessage?: (message: GroupMessage) => void;
    onUserTyping?: (status: TypingStatus) => void;
    onJoinedGroup?: (response: JoinedGroupResponse) => void;
    onLeftGroup?: (response: LeftGroupResponse) => void;
    onError?: (error: ErrorResponse) => void;
    onConnected?: () => void;
    onDisconnected?: () => void;
}

export interface WebSocketFacade {
    // Connection Management
    connect: (token: string) => void;
    disconnect: () => void;
    isConnected: () => boolean;

    // Group Management
    joinGroup: (groupId: number) => void;
    leaveGroup: (groupId: number) => void;

    // Messaging
    sendMessage: (groupId: number, content: string) => void;
    sendTyping: (groupId: number, isTyping: boolean) => void;

    // Event Listeners
    setEventListeners: (listeners: SocketEventListeners) => void;
    removeEventListeners: () => void;
}

class SocketIOClient implements WebSocketFacade {
    private socket: Socket | null = null;
    private serverUrl: string;
    private listeners: SocketEventListeners = {};

    constructor(serverUrl: string) {
        this.serverUrl = serverUrl;
    }

    connect(token: string): void {
        if (this.socket) {
            console.log('Reusing existing socket, updating auth token');
            this.socket.auth = { token };
            if (!this.socket.connected) {
                this.socket.connect();
            }
            return;
        }

        console.log('Creating new socket connection to:', this.serverUrl);
        this.socket = io(this.serverUrl, {
            auth: {
                token: token,
            },
            transports: ['websocket'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
            forceNew: true,
            multiplex: false,
        });

        this.setupSocketListeners();
    }

    disconnect(): void {
        if (this.socket) {
            console.log('Explicitly disconnecting socket');
            this.socket.disconnect();
            // We keep the socket instance so we can reuse it (with new auth) if connect() is called again
        }
    }

    isConnected(): boolean {
        return this.socket?.connected ?? false;
    }

    joinGroup(groupId: number): void {
        if (!this.socket?.connected) {
            console.error('Socket not connected');
            return;
        }

        this.socket.emit('joinGroup', { groupId });
    }

    leaveGroup(groupId: number): void {
        if (!this.socket?.connected) {
            console.error('Socket not connected');
            return;
        }

        this.socket.emit('leaveGroup', { groupId });
    }

    sendMessage(groupId: number, content: string): void {
        if (!this.socket?.connected) {
            console.error('Socket not connected');
            return;
        }

        this.socket.emit('sendMessage', { groupId, content });
    }

    sendTyping(groupId: number, isTyping: boolean): void {
        if (!this.socket?.connected) {
            console.error('Socket not connected');
            return;
        }

        this.socket.emit('typing', { groupId, isTyping });
    }

    setEventListeners(listeners: SocketEventListeners): void {
        this.listeners = listeners;
        
        // If socket exists, re-setup listeners to ensure they are bound to the current listeners object
        if (this.socket) {
            this.setupSocketListeners();
        }
    }

    removeEventListeners(): void {
        this.listeners = {};
        if (this.socket) {
            this.socket.off('connect');
            this.socket.off('disconnect');
            this.socket.off('newMessage');
            this.socket.off('userTyping');
            this.socket.off('joinedGroup');
            this.socket.off('leftGroup');
            this.socket.off('error');
        }
    }

    private setupSocketListeners(): void {
        if (!this.socket) return;

        // Clear existing listeners to prevent duplicates if this is called multiple times
        this.socket.off();

        // Connection events
        this.socket.on('connect', () => {
            console.log('Socket connected (ID:', this.socket?.id, ')');
            this.listeners.onConnected?.();
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Socket disconnected, reason:', reason);
            this.listeners.onDisconnected?.();
        });

        // Message events
        this.socket.on('newMessage', (message: GroupMessage) => {
            this.listeners.onNewMessage?.(message);
        });

        this.socket.on('userTyping', (status: TypingStatus) => {
            this.listeners.onUserTyping?.(status);
        });

        // Group events
        this.socket.on('joinedGroup', (response: JoinedGroupResponse) => {
            this.listeners.onJoinedGroup?.(response);
        });

        this.socket.on('leftGroup', (response: LeftGroupResponse) => {
            this.listeners.onLeftGroup?.(response);
        });

        // Error events
        this.socket.on('error', (error: ErrorResponse) => {
            console.error('Socket error:', error);
            this.listeners.onError?.(error);
        });
    }
}

// Factory function to create the socket client
export function createSocketClient(serverUrl: string): WebSocketFacade {
    return new SocketIOClient(serverUrl);
}