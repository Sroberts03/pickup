export default class User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    isPublic: boolean;
    joinedAt: Date;

    constructor(
        id: number,
        firstName: string,
        lastName: string,
        email: string,
        isPublic: boolean,
        joinedAt: Date = new Date()
    ) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.isPublic = isPublic;
        this.joinedAt = joinedAt;
    }
}