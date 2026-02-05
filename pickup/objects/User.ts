export default class User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    joinedYear: number;

    constructor(
        id: number,
        firstName: string,
        lastName: string,
        email: string,
        joinedYear: number = new Date().getFullYear()
    ) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.joinedYear = joinedYear;
    }
}