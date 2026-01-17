import User from "@/objects/User";
import ServerFacade from "./serverFacade";

export default class TestServerFacade implements ServerFacade {
    users = new Map<number, User>();
    sessions = new Map<number, string>();

    constructor() {
        this.users.set(1, new User(1, "test-user@example.com", "Test", "User", true, null));
        this.sessions.set(1, "test-token");
    }
    
    async login(email: string, password: string): Promise<{ token: string, user: User }> {
        const user = Array.from(this.users.values()).find(u => u.email === email);
        const token = this.sessions.get(user ? user.id : -1);
        
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ token: token!, user: user! });
            }, 500);
        });
    }

    async signup(email: string, password: string, firstName: string, lastName: string, profilePicUrl: string): Promise<{ token: string, user: User }> {
        const newUser = new User(
            this.users.size + 1,
            email,
            firstName,
            lastName,
            true,
            profilePicUrl || null
        );
        this.users.set(this.users.size + 1, newUser);
        this.sessions.set(newUser.id, "new-token");

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ token: "new-token", user: newUser });
            }, 500);
        });
    }

    async logout(): Promise<void> {
        this.sessions.clear();

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 500);
        });
    }
}