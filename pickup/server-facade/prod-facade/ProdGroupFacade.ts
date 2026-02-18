import Group from "@/objects/Group";
import GroupMessage from "@/objects/GroupMessage";
import User from "@/objects/User";
import GroupFacade from "../GroupFacade";
import * as SecureStore from 'expo-secure-store';

export default class ProdGroupFacade implements GroupFacade {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }
    
    async getUserGroups(userId: number): Promise<Group[]> {
        const token = await SecureStore.getItemAsync("authToken");
        const response = await fetch(`${this.baseUrl}/group/user/${userId}`, {
            method: "GET",
            headers: {
                "Authorization": token ? `Bearer ${token}` : "",
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) throw new Error("Failed to fetch user groups");
        const data = await response.json();
        console.log("Fetched groups:", data.groups);
        return data.groups.map((g: any) => new Group(g));
    }

    async getLastGroupMessage(groupId: number): Promise<GroupMessage | null> {
        const token = await SecureStore.getItemAsync("authToken");
        const response = await fetch(`${this.baseUrl}/group/lastMessage/${groupId}`, {
            method: "GET",
            headers: {
                "Authorization": token ? `Bearer ${token}` : "",
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) return null;
        const data = await response.json();
        return data.lastMessage ? new GroupMessage(data.lastMessage) : null;
    }

    async getGroupMessages(groupId: number): Promise<GroupMessage[]> {
        const token = await SecureStore.getItemAsync("authToken");
        const response = await fetch(`${this.baseUrl}/group/messages/${groupId}`, {
            method: "GET",
            headers: {
                "Authorization": token ? `Bearer ${token}` : "",
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) throw new Error("Failed to fetch group messages");
        const data = await response.json();
        return data.messages.map((m: any) => new GroupMessage(m));
    }

    async getGroupMembers(groupId: number): Promise<User[]> {
        const token = await SecureStore.getItemAsync("authToken");
        const response = await fetch(`${this.baseUrl}/group/members/${groupId}`, {
            method: "GET",
            headers: {
                "Authorization": token ? `Bearer ${token}` : "",
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) throw new Error("Failed to fetch group members");
        const data = await response.json();
        return data.members.map((u: any) => new User(u));
    }

    async sendGroupMessage(groupId: number, content: string): Promise<GroupMessage> {
        const token = await SecureStore.getItemAsync("authToken");
        const response = await fetch(`${this.baseUrl}/group/message/send`, {
            method: "POST",
            headers: {
                "Authorization": token ? `Bearer ${token}` : "",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ groupId, content })
        });
        if (!response.ok) throw new Error("Failed to send group message");
        const data = await response.json();
        return new GroupMessage(data.message);
    }

    async getGroupUnreadStatus(groupId: number): Promise<boolean> {
        const token = await SecureStore.getItemAsync("authToken");
        const response = await fetch(`${this.baseUrl}/group/unread/${groupId}`, {
            method: "GET",
            headers: {
                "Authorization": token ? `Bearer ${token}` : "",
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) throw new Error("Failed to fetch unread status");
        const data = await response.json();
        return data.unread;
    }

    async getLastReadMessageId(groupId: number): Promise<number | null> {
        const token = await SecureStore.getItemAsync("authToken");
        const response = await fetch(`${this.baseUrl}/group/lastReadMessage/${groupId}`, {
            method: "GET",
            headers: {
                "Authorization": token ? `Bearer ${token}` : "",
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) return null;
        const data = await response.json();
        return data.lastReadMessageId ?? null;
    }

    async lastMessageRead(groupId: number, lastReadMessageId?: number | null): Promise<void> {
        const token = await SecureStore.getItemAsync("authToken");
        await fetch(`${this.baseUrl}/group/update/lastReadMessage`, {
            method: "PUT",
            headers: {
                "Authorization": token ? `Bearer ${token}` : "",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ groupId, lastReadMessageId })
        });
    }

    async getGroups(): Promise<Group[]> {
        const token = await SecureStore.getItemAsync("authToken");
        const response = await fetch(`${this.baseUrl}/groups`, {
            method: "GET",
            headers: {
                "Authorization": token ? `Bearer ${token}` : "",
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) throw new Error("Failed to fetch groups");
        const data = await response.json();
        return data.groups.map((g: any) => g as Group);
    }

    async getGroup(groupId: number): Promise<Group> {
        const token = await SecureStore.getItemAsync("authToken");
        const response = await fetch(`${this.baseUrl}/groups/${groupId}`, {
            method: "GET",
            headers: {
                "Authorization": token ? `Bearer ${token}` : "",
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) throw new Error("Failed to fetch group");
        const data = await response.json();
        return data.group as Group;
    }

    async createGroup(groupData: any): Promise<Group> {
        const token = await SecureStore.getItemAsync("authToken");
        const response = await fetch(`${this.baseUrl}/groups`, {
            method: "POST",
            headers: {
                "Authorization": token ? `Bearer ${token}` : "",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(groupData)
        });
        if (!response.ok) throw new Error("Failed to create group");
        const data = await response.json();
        return data.group as Group;
    }

    async updateGroup(groupId: number, groupData: any): Promise<Group> {
        const token = await SecureStore.getItemAsync("authToken");
        const response = await fetch(`${this.baseUrl}/groups/${groupId}`, {
            method: "PUT",
            headers: {
                "Authorization": token ? `Bearer ${token}` : "",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(groupData)
        });
        if (!response.ok) throw new Error("Failed to update group");
        const data = await response.json();
        return data.group as Group;
    }

    async deleteGroup(groupId: number): Promise<void> {
        const token = await SecureStore.getItemAsync("authToken");
        const response = await fetch(`${this.baseUrl}/groups/${groupId}`, {
            method: "DELETE",
            headers: {
                "Authorization": token ? `Bearer ${token}` : "",
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) throw new Error("Failed to delete group");
    }
}