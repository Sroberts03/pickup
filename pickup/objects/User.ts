export default class User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    isPublic: boolean;
    profilePicUrl: string | null;

    constructor(
        id: number,
        firstName: string,
        lastName: string,
        email: string,
        isPublic: boolean,
        profilePicUrl: string | null = null
    ) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.isPublic = isPublic;
        this.profilePicUrl = profilePicUrl;
    }
}