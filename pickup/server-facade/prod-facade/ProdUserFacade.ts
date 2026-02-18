import { GameWithDetails } from "@/objects/Game";
import Sport from "@/objects/Sport";
import User from "@/objects/User";
import UserFacade from "../UserFacade";
import * as SecureStore from 'expo-secure-store';

export default class ProdUserFacade implements UserFacade{
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    async getUser(userId: number): Promise<User | undefined> {
        const token = await SecureStore.getItemAsync("authToken");
        const response = await fetch(`${this.baseUrl}/user/user/${userId}`, {
            method: "GET",
            headers: {
                "Authorization": token ? `Bearer ${token}` : "",
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) return undefined;
        const data = await response.json();
        return data.user as User;
    }

    async updateUser(userId: number, userData: Partial<{ firstName: string; lastName: string; email: string; password: string; }>): Promise<User> {
        const token = await SecureStore.getItemAsync("authToken");
        const response = await fetch(`${this.baseUrl}/user/user/${userId}`, {
            method: "PUT",
            headers: {
                "Authorization": token ? `Bearer ${token}` : "",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userData)
        });
        if (!response.ok) throw new Error("Failed to update user");
        const data = await response.json();
        return data.user as User;
    }

    async searchUsers(query: string): Promise<User[]> {
        const token = await SecureStore.getItemAsync("authToken");
        const response = await fetch(`${this.baseUrl}/user/search?q=${encodeURIComponent(query)}`, {
            method: "GET",
            headers: {
                "Authorization": token ? `Bearer ${token}` : "",
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) throw new Error("Failed to search users");
        const data = await response.json();
        return data.users.map((u: any) => u as User);
    }

    async reportUser(userId: number, reason: string): Promise<void> {
        const token = await SecureStore.getItemAsync("authToken");
        const response = await fetch(`${this.baseUrl}/user/report`, {
            method: "POST",
            headers: {
                "Authorization": token ? `Bearer ${token}` : "",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ userId, reason })
        });
        if (!response.ok) throw new Error("Failed to report user");
    }

    async getFavouriteSports(userId: number): Promise<Sport[]> {
        const token = await SecureStore.getItemAsync("authToken");
        const response = await fetch(`${this.baseUrl}/user/user/sports/${userId}`, {
            method: "GET",
            headers: {
                "Authorization": token ? `Bearer ${token}` : "",
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) throw new Error("Failed to fetch favourite sports");
        const data = await response.json();
        return data.sports.map((s: any) => s as Sport);
    }

    async updateFavouriteSports(userId: number, sportIds: number[]): Promise<Sport[]> {
        const token = await SecureStore.getItemAsync("authToken");
        const response = await fetch(`${this.baseUrl}/user/user/sports/${userId}`, {
            method: "PUT",
            headers: {
                "Authorization": token ? `Bearer ${token}` : "",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ sportIds })
        });
        if (!response.ok) throw new Error("Failed to update favourite sports");
        const data = await response.json();
        return data.sports.map((s: any) => s as Sport);
    }

    async getUserGames(userId: number): Promise<GameWithDetails[]> {
        const token = await SecureStore.getItemAsync("authToken");
        const response = await fetch(`${this.baseUrl}/user/user/games/${userId}`, {
            method: "GET",
            headers: {
                "Authorization": token ? `Bearer ${token}` : "",
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) throw new Error("Failed to fetch user games");
        const data = await response.json();
        return data.games.map((g: GameWithDetails) => g);
    }

    async getUserStats(userId: number): Promise<{ gamesPlayed: number; gamesOrganized: number; }> {
        const token = await SecureStore.getItemAsync("authToken");
        const response = await fetch(`${this.baseUrl}/user/${userId}/stats`, {
            method: "GET",
            headers: {
                "Authorization": token ? `Bearer ${token}` : "",
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) throw new Error("Failed to fetch user stats");
        const data = await response.json();
        return { gamesPlayed: data.gamesPlayed, gamesOrganized: data.gamesOrganized };
    }
}