import User from "@/objects/User";
import ServerFacade from "./serverFacade";

export default class TestServerFacade implements ServerFacade {
    users = new Map<number, User>();
    sessions = new Map<number, string>();
    currentUserId: number | null = null;

    constructor() {
        this.users.set(1, new User(1, "Test", "User", "test-user@example.com", true, null));
    }

    async getCurrentUser(): Promise<{ token: string, user: User } | null> {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (this.currentUserId === null) {
                    resolve(null);
                    return;
                }
                
                const user = this.users.get(this.currentUserId);
                const token = this.sessions.get(this.currentUserId);
                
                if (user && token) {
                    resolve({ token, user });
                } else {
                    resolve(null);
                }
            }, 500);
        });
    }
    
    async login(email: string, password: string): Promise<{ token: string, user: User }> {
        const user = Array.from(this.users.values()).find(u => u.email === email);
        console.log(this.users)
        console.log("Logging in user:", email);
        console.log("Found user:", user);
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (user) {
                    const token = "test-token-" + user.id;
                    this.sessions.set(user.id, token);
                    this.currentUserId = user.id;
                    resolve({ token, user });
                } else {
                    reject(new Error("Invalid email or password"));
                }
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
        this.users.set(newUser.id, newUser);
        const token = "new-token-" + newUser.id;
        this.sessions.set(newUser.id, token);
        this.currentUserId = newUser.id;

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ token, user: newUser });
            }, 500);
        });
    }

    async logout(): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (this.currentUserId !== null) {
                    this.sessions.delete(this.currentUserId);
                    this.currentUserId = null;
                }
                resolve();
            }, 500);
        });
    }
}