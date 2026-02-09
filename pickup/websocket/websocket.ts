export enum SocketState {
    CONNECTING = 0,
    OPEN = 1,
    CLOSING = 2,
    CLOSED = 3
}

export interface WebSocketFacade {
    // Connection Management
    connect: () => void;
    close: (code?: number, reason?: string) => void;
    send: (data: string | ArrayBuffer | Blob) => void;
    ping: () => void;

    // State
    readonly readyState: SocketState; 
    readonly url: string;

    // Event Handlers
    onopen: (() => void) | null;
    onclose: ((event: { code: number; reason: string }) => void) | null;
    onmessage: ((event: { data: any }) => void) | null;
    onerror: ((error: any) => void) | null;
}