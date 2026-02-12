import { WebSocketFacade, SocketEventListeners, GroupMessage as SocketGroupMessage } from './websocket';
import ServerFacade from '@/server-facade/serverFacade';

export default class TestWebSocket implements WebSocketFacade {
    private serverFacade: ServerFacade;
    private connected: boolean = false;
    private listeners: SocketEventListeners = {};
    private currentUserId?: number;
    
    // Map to store which groups the user has joined
    private joinedGroups: Set<number> = new Set();

    constructor(serverFacade: ServerFacade) {
        this.serverFacade = serverFacade;
    }

    connect(token: string) {
        console.log('[TestWebSocket] Connecting with token...');
        
        // Simulate connection delay
        setTimeout(() => {
            this.connected = true;
            console.log('[TestWebSocket] Connected');
            this.listeners.onConnected?.();
        }, 500);
    }

    disconnect() {
        console.log('[TestWebSocket] Disconnecting...');
        this.connected = false;
        this.joinedGroups.clear();
        this.listeners.onDisconnected?.();
    }

    isConnected(): boolean {
        return this.connected;
    }

    joinGroup(groupId: number) {
        console.log(`[TestWebSocket] Joining group ${groupId}`);
        
        if (!this.connected) {
            console.error('[TestWebSocket] Cannot join group - not connected');
            return;
        }

        // Simulate async join
        setTimeout(() => {
            this.joinedGroups.add(groupId);
            this.listeners.onJoinedGroup?.({
                groupId,
                message: 'Successfully joined group',
            });
        }, 200);
    }

    leaveGroup(groupId: number) {
        console.log(`[TestWebSocket] Leaving group ${groupId}`);
        
        if (!this.connected) {
            console.error('[TestWebSocket] Cannot leave group - not connected');
            return;
        }

        // Simulate async leave
        setTimeout(() => {
            this.joinedGroups.delete(groupId);
            this.listeners.onLeftGroup?.({
                groupId,
                message: 'Successfully left group',
            });
        }, 200);
    }

    async sendMessage(groupId: number, content: string) {
        console.log(`[TestWebSocket] Sending message to group ${groupId}:`, content);

        if (!this.connected) {
            console.error('[TestWebSocket] Cannot send message - not connected');
            this.listeners.onError?.({ message: 'Not connected' });
            return;
        }

        if (!this.joinedGroups.has(groupId)) {
            console.error('[TestWebSocket] Cannot send message - not in group');
            this.listeners.onError?.({ message: 'Not a member of this group' });
            return;
        }

        try {
            // Save message through server facade
            const savedMessage = await this.serverFacade.sendGroupMessage(groupId, content);

            // Simulate receiving the message back (as the server would broadcast it)
            setTimeout(() => {
                console.log('[TestWebSocket] Simulating incoming message:', savedMessage);
                this.listeners.onNewMessage?.({
                    id: savedMessage.id,
                    groupId: savedMessage.groupId,
                    userId: savedMessage.userId,
                    content: savedMessage.content,
                    sentAt: savedMessage.sentAt.toISOString(),
                });
            }, 100);
        } catch (error) {
            console.error('[TestWebSocket] Failed to send message:', error);
            const message = error instanceof Error ? error.message : 'Failed to send message';
            this.listeners.onError?.({ message });
        }
    }

    sendTyping(groupId: number, isTyping: boolean) {
        console.log(`[TestWebSocket] Sending typing status for group ${groupId}:`, isTyping);

        if (!this.connected) {
            console.error('[TestWebSocket] Cannot send typing - not connected');
            return;
        }

        if (!this.joinedGroups.has(groupId)) {
            console.error('[TestWebSocket] Cannot send typing - not in group');
            return;
        }

        // In test mode, we don't really broadcast typing to others
        // But we could simulate it if needed for testing
    }

    setEventListeners(listeners: SocketEventListeners) {
        console.log('[TestWebSocket] Setting event listeners');
        this.listeners = listeners;
    }

    removeEventListeners() {
        console.log('[TestWebSocket] Removing event listeners');
        this.listeners = {};
    }

    /**
     * Test helper method to simulate receiving a message from another user
     */
    simulateIncomingMessage(message: SocketGroupMessage) {
        console.log('[TestWebSocket] Simulating incoming message:', message);
        if (this.connected) {
            this.listeners.onNewMessage?.(message);
        }
    }

    /**
     * Test helper method to simulate typing from another user
     */
    simulateTyping(userId: number, groupId: number, isTyping: boolean) {
        console.log(`[TestWebSocket] Simulating typing from user ${userId} in group ${groupId}:`, isTyping);
        if (this.connected) {
            this.listeners.onUserTyping?.({ userId, groupId, isTyping });
        }
    }

    /**
     * Test helper method to simulate an error
     */
    simulateError(message: string) {
        console.log('[TestWebSocket] Simulating error:', message);
        this.listeners.onError?.({ message });
    }
}
