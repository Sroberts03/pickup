import User from "@/objects/User";
import AuthFacade from "../AuthFacade";
import * as SecureStore from 'expo-secure-store';

export default class ProdAuthFacade implements AuthFacade {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }
    
    async getCurrentUser(): Promise<{ token: string; user: User; } | null> {
        const token = await SecureStore.getItemAsync("authToken");
        if (!token) return null;
        const response = await fetch(`${this.baseUrl}/auth/currentUser`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) return null;
        const data = await response.json();
        if (!data.user) return null;
        return { token, user: new User(data.user) };
    }

    async login(email: string, password: string): Promise<{ token: string; user: User; }> {
        const response = await fetch(`${this.baseUrl}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        if (!response.ok) {
            throw new Error("Login failed");
        }
        const data = await response.json();
        if (!data.token || !data.user) throw new Error("Invalid login response");
        await SecureStore.setItemAsync("authToken", data.token);
        return { token: data.token, user: new User(data.user) };
    }

    async signup(email: string, password: string, firstName: string, lastName: string): Promise<{ token: string; user: User; }> {
        const response = await fetch(`${this.baseUrl}/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, firstName, lastName })
        });
        if (!response.ok) {
            throw new Error("Signup failed");
        }
        const data = await response.json();
        if (!data.token || !data.user) throw new Error("Invalid signup response");
        await SecureStore.setItemAsync("authToken", data.token);
        return { token: data.token, user: new User(data.user) };
    }

    async logout(): Promise<void> {
        const token = await SecureStore.getItemAsync("authToken");
        if (token) {
            await fetch(`${this.baseUrl}/auth/logout`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            await SecureStore.deleteItemAsync("authToken");
        }
    }
}