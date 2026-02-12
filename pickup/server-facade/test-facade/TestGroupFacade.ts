import Group from "@/objects/Group";
import GroupMessage from "@/objects/GroupMessage";
import User from "@/objects/User";
import GroupFacade from "../GroupFacade";
import { MockDataStore } from "./MockDataStore";

export default class TestGroupFacade implements GroupFacade {
    constructor(private dataStore: MockDataStore) {}

    async getUserGroups(userId: number): Promise<Group[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const groupIds = this.dataStore.userGroups.get(userId);
                if (groupIds) {
                    resolve(Array.from(groupIds).map(id => this.dataStore.groups.get(id)).filter((group): group is Group => group !== undefined));
                } else {
                    resolve([]);
                }
            }, 500);
        });
    }

    async getLastGroupMessage(groupId: number): Promise<GroupMessage | null> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const messages = Array.from(this.dataStore.groupMessages.values())
                    .filter(m => m.groupId === groupId)
                    .sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime());
                
                resolve(messages.length > 0 ? messages[0] : null);
            }, 300);
        });
    }

    async getGroupMessages(groupId: number): Promise<GroupMessage[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const messages = Array.from(this.dataStore.groupMessages.values())
                    .filter(m => m.groupId === groupId)
                    .sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime());
                resolve(messages);
            }, 300);
        });
    }

    async getGroupMembers(groupId: number): Promise<User[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const members: User[] = [];
                this.dataStore.userGroups.forEach((groups, userId) => {
                    if (groups.has(groupId)) {
                        const user = this.dataStore.users.get(userId);
                        if (user) members.push(user);
                    }
                });
                resolve(members);
            }, 300);
        });
    }

    async sendGroupMessage(groupId: number, content: string): Promise<GroupMessage> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (!this.dataStore.currentUserId) {
                    reject(new Error("User not logged in"));
                    return;
                }

                const newMessageId = this.dataStore.groupMessages.size + 1;
                const newMessage = new GroupMessage(
                    newMessageId,
                    groupId,
                    this.dataStore.currentUserId,
                    content,
                    new Date()
                );

                this.dataStore.groupMessages.set(newMessageId, newMessage);
                resolve(newMessage);
            }, 300);
        });
    }

    async getGroupUnreadStatus(groupId: number): Promise<boolean> {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (!this.dataStore.currentUserId) {
                    resolve(false);
                    return;
                }

                const messages = Array.from(this.dataStore.groupMessages.values())
                    .filter(m => m.groupId === groupId)
                    .sort((a, b) => b.id - a.id);

                if (messages.length === 0) {
                    resolve(false);
                    return;
                }

                const lastMessage = messages[0];
                if (lastMessage.userId === this.dataStore.currentUserId) {
                    resolve(false);
                    return;
                }

                const userReads = this.dataStore.groupLastRead.get(this.dataStore.currentUserId);
                const lastReadId = userReads?.get(groupId);

                if (!lastReadId) {
                    resolve(true);
                    return;
                }

                resolve(lastMessage.id > lastReadId);
            }, 150);
        });
    }

    async getLastReadMessageId(groupId: number): Promise<number | null> {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (!this.dataStore.currentUserId) {
                    resolve(null);
                    return;
                }

                const userReads = this.dataStore.groupLastRead.get(this.dataStore.currentUserId);
                const lastReadId = userReads?.get(groupId) ?? null;
                resolve(lastReadId ?? null);
            }, 150);
        });
    }

    async lastMessageRead(groupId: number, lastReadMessageId?: number | null): Promise<void> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (!this.dataStore.currentUserId) {
                    reject(new Error("User not logged in"));
                    return;
                }

                const lastReadId = typeof lastReadMessageId === "number"
                    ? lastReadMessageId
                    : 0;
                const userReads = this.dataStore.groupLastRead.get(this.dataStore.currentUserId) ?? new Map<number, number>();
                userReads.set(groupId, lastReadId);
                this.dataStore.groupLastRead.set(this.dataStore.currentUserId, userReads);
                resolve();
            }, 150);
        });
    }
}
