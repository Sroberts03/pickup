export default class User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    isPublic: boolean;

    constructor(
        id: number,
        firstName: string,
        lastName: string,
        email: string,
        isPublic: boolean,
    ) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.isPublic = isPublic;
    }
}