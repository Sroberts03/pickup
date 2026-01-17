export default class GroupMessage {
    id: number;
    groupId: number;
    userId: number;
    content: string;
    sentAt: Date;

    constructor(
        id: number,
        groupId: number,
        userId: number,
        content: string,
        sentAt: Date
    ) {
        this.id = id;
        this.groupId = groupId;
        this.userId = userId;
        this.content = content;
        this.sentAt = sentAt;
    }
}