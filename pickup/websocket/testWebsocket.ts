import { SocketState, WebSocketFacade } from './websocket';
import GroupMessage from '../objects/GroupMessage';
import ServerFacade from '@/serverFacade/serverFacade';
import TestServerFacade from '@/serverFacade/testServerFacade';

export default class TestWebSocket implements WebSocketFacade {
    readyState: SocketState = SocketState.CLOSED;
    url: string;
    private serverFacade: ServerFacade;

    // Event Handlers
    onopen: (() => void) | null = null;
    onclose: ((event: { code: number; reason: string }) => void) | null = null;
    onmessage: ((event: { data: any }) => void) | null = null;
    onerror: ((error: any) => void) | null = null;

    private groupMessageListeners: Map<number, Set<(message: GroupMessage) => void>> = new Map();

    constructor(url: string, serverFacade: ServerFacade) {
        this.url = url;
        this.serverFacade = serverFacade || new TestServerFacade();
    }

    connect() {
        console.log(`[TestWebSocket] Connecting to ${this.url}...`);
        this.readyState = SocketState.CONNECTING;

        // Simulate connection delay
        setTimeout(() => {
            this.readyState = SocketState.OPEN;
            console.log('[TestWebSocket] Connected');
            if (this.onopen) {
                this.onopen();
            }
        }, 500);
    }

    close(code: number = 1000, reason: string = 'Normal Closure') {
        console.log(`[TestWebSocket] Closing: ${code} - ${reason}`);
        this.readyState = SocketState.CLOSING;

        setTimeout(() => {
            this.readyState = SocketState.CLOSED;
            console.log('[TestWebSocket] Closed');
            if (this.onclose) {
                this.onclose({ code, reason });
            }
        }, 200);
    }

    async send(data: string | ArrayBuffer | Blob) {
        console.log('[TestWebSocket] Sending data:', data);

        if (typeof data === 'string') {
            try {
                const parsedRequest = JSON.parse(data);

                if (parsedRequest.type === 'SEND_GROUP_MESSAGE') {
                    const savedMessage = await this.serverFacade.sendGroupMessage(
                        parsedRequest.groupId, 
                        parsedRequest.content
                    );

                    // B. BROADCAST the result back
                    // Now we echo the *actual* saved database object (with ID and real timestamp)
                    setTimeout(() => {
                        console.log('[TestWebSocket] Simulating incoming message:', JSON.stringify(savedMessage));
                        this.simulateMessage(JSON.stringify(savedMessage));
                    }, 100);
                }
            } catch (e) {
                console.error('[TestWebSocket] Failed to handle send:', e);
            }
        }
    }

    ping() {
        console.log('[TestWebSocket] Ping');
    }

    /**
     * Helper method to simulate receiving a message from the server.
     * Call this from your test code or debug UI to trigger an incoming message.
     */
    simulateMessage(data: any) {
        console.log('[TestWebSocket] Simulating incoming message:', data);
        if (this.readyState === SocketState.OPEN) {
            console.log('[TestWebSocket] Dispatching message to onmessage handler');
            // Ensure we are passing a string to the onmessage handler
            // (The UI code parses JSON.parse(event.data), so we must pass a string)
            const stringData = typeof data === 'string' ? data : JSON.stringify(data);

            if (this.onmessage) {
                console.log('[TestWebSocket] Simulating incoming message:', stringData);
                this.onmessage({ data: stringData });
            }

            // Dispatch to internal listeners (if you use them elsewhere)
            this.dispatchToListeners(stringData);
        }
    }

    private dispatchToListeners(rawData: any) {
        try {
            const data = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
            // Handle different message structures
            const payload = (data.type === 'NEW_MESSAGE' && data.message) ? data.message : data;

            // Check if it looks like a GroupMessage
            if (payload && payload.groupId && payload.content) {
                const message = new GroupMessage(
                    payload.id,
                    payload.groupId,
                    payload.userId,
                    payload.content,
                    new Date(payload.sentAt)
                );

                const listeners = this.groupMessageListeners.get(payload.groupId);
                if (listeners) {
                    listeners.forEach(handler => handler(message));
                }
            }
        } catch (e) {
            console.error('[TestWebSocket] Error dispatching message:', e);
        }
    }

    simulateError(error: any) {
        console.log('[TestWebSocket] Simulating error:', error);
        if (this.onerror) {
            this.onerror(error);
        }
    }
}
