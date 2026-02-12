import Group from "@/objects/Group";
import User from "@/objects/User";
import GroupMessage from "@/objects/GroupMessage";

export default interface GroupFacade {
    getUserGroups(userId: number): Promise<Group[]>;
    getLastGroupMessage(groupId: number): Promise<GroupMessage | null>;
    getGroupMessages(groupId: number): Promise<GroupMessage[]>;
    getGroupMembers(groupId: number): Promise<User[]>;
    sendGroupMessage(groupId: number, content: string): Promise<GroupMessage>;
    getGroupUnreadStatus(groupId: number): Promise<boolean>;
    getLastReadMessageId(groupId: number): Promise<number | null>;
    lastMessageRead(groupId: number, lastReadMessageId?: number | null): Promise<void>;
}