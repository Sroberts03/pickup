import Group from "@/objects/Group";
import GroupMessage from "@/objects/GroupMessage";
import User from "@/objects/User";
import GroupFacade from "../GroupFacade";
import * as SecureStore from 'expo-secure-store';

export default class ProdGroupFacade implements GroupFacade {
    private readonly baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = `${baseUrl}/group`;
    }

    private async request<T>(endpoint: string, options: RequestInit = {}, comingFrom?: string): Promise<T> {
        const token = await SecureStore.getItemAsync("authToken");

        const headers: HeadersInit = {
            "Content-Type": "application/json",
            "Authorization": token ? `Bearer ${token}` : "",
            ...options.headers,
        };

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            let errorBody: { message?: string } = {};
            try {
                errorBody = await response.json();
            } catch {}
            throw new Error((errorBody.message ? errorBody.message : "") || `Request failed: ${response.status}`);
        }

        // If response is 204 No Content or has no body, don't try to parse JSON
        if (response.status === 204) {
            return undefined as T;
        }
        const text = await response.text();
        if (!text) {
            return undefined as T;
        }
        return JSON.parse(text);
    }

    async getUserGroups(userId: number): Promise<Group[]> {
        const data = await this.request<{ groups: Group[] }>(`/user/${userId}`);
        return data.groups.map(g => new Group(g.id, g.name, g.description, g.gameId, g.createdAt, g.expiresAt));
    }

    async getLastGroupMessage(groupId: number): Promise<GroupMessage | null> {
        try {
            const data = await this.request<{ lastMessage: any | null }>(`/lastMessage/${groupId}`);
            return data.lastMessage ? new GroupMessage(
                data.lastMessage.id, 
                data.lastMessage.groupId, 
                data.lastMessage.userId, 
                data.lastMessage.content, 
                data.lastMessage.sentAt) : null;
        } catch {
            return null;
        }
    }

    async getGroupMessages(groupId: number): Promise<GroupMessage[]> {
        const data = await this.request<{ messages: any[] }>(`/messages/${groupId}`);
        return data.messages.map(m => new GroupMessage(m.id, m.groupId, m.userId, m.content, m.sentAt));
    }

    async getGroupMembers(groupId: number): Promise<User[]> {
        const data = await this.request<{ members: any[] }>(`/members/${groupId}`);
        return data.members.map(u => new User(u.id, u.firstName, u.lastName, u.email, u.joinedYear));
    }

    async sendGroupMessage(groupId: number, content: string): Promise<GroupMessage> {
        const data = await this.request<{ message: any }>(`/message/send`, {
            method: "POST",
            body: JSON.stringify({ groupId, content })
        });
        return new GroupMessage(data.message.id, data.message.groupId, data.message.userId, data.message.content, data.message.sentAt);
    }

    async getGroupUnreadStatus(groupId: number): Promise<boolean> {
        const data = await this.request<{ unread: boolean }>(`/unread/${groupId}`);
        return data.unread;
    }

    async getLastReadMessageId(groupId: number): Promise<number | null> {
        if (!groupId) return null;
        const data = await this.request<{ lastReadMessageId: number | null }>(`/lastReadMessage/${groupId}`);
        return data.lastReadMessageId ?? null;
    }

    async lastMessageRead(groupId: number, lastReadMessageId?: number | null): Promise<void> {
        if (!groupId) return;
        await this.request<void>(`/update/lastReadMessage`, {
            method: "PUT",
            body: JSON.stringify({ groupId, lastReadMessageId })
        });
    }
}