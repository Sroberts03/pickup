import User from "@/objects/User";
import AuthFacade from "../AuthFacade";
import { MockDataStore } from "./MockDataStore";

export default class TestAuthFacade implements AuthFacade {
    constructor(private dataStore: MockDataStore) {}

    async getCurrentUser(): Promise<{ token: string, user: User } | null> {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (this.dataStore.currentUserId === null) {
                    resolve(null);
                    return;
                }

                const user = this.dataStore.users.get(this.dataStore.currentUserId);
                const token = this.dataStore.sessions.get(this.dataStore.currentUserId);

                if (user && token) {
                    resolve({ token, user });
                } else {
                    resolve(null);
                }
            }, 500);
        });
    }

    async login(email: string, password: string): Promise<{ token: string, user: User }> {
        const user = Array.from(this.dataStore.users.values()).find(u => u.email === email);
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (user) {
                    const token = "test-token-" + user.id;
                    this.dataStore.sessions.set(user.id, token);
                    this.dataStore.currentUserId = user.id;
                    resolve({ token, user });
                } else {
                    reject(new Error("Invalid email or password"));
                }
            }, 500);
        });
    }

    async signup(email: string, password: string, firstName: string, lastName: string): Promise<{ token: string, user: User }> {
        const newUser = new User(
            this.dataStore.users.size + 1,
            firstName,
            lastName,
            email
        );
        this.dataStore.users.set(newUser.id, newUser);
        const token = "new-token-" + newUser.id;
        this.dataStore.sessions.set(newUser.id, token);
        this.dataStore.currentUserId = newUser.id;

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ token, user: newUser });
            }, 500);
        });
    }

    async logout(): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (this.dataStore.currentUserId !== null) {
                    this.dataStore.sessions.delete(this.dataStore.currentUserId);
                    this.dataStore.currentUserId = null;
                }
                resolve();
            }, 500);
        });
    }
}
