import { GameWithDetails } from "@/objects/Game";
import Sport from "@/objects/Sport";
import User from "@/objects/User";
import UserFacade from "../UserFacade";
import * as SecureStore from 'expo-secure-store';

export default class ProdUserFacade implements UserFacade {
    private readonly baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = `${baseUrl}/user`;
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const token = await SecureStore.getItemAsync("authToken");
        const headers: HeadersInit = {
            "Content-Type": "application/json",
            "Authorization": token ? `Bearer ${token}` : "",
            ...options.headers,
        };

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            throw new Error(errorBody.message || `Request failed: ${response.status}`);
        }

        return response.json();
    }

    async getUser(userId: number): Promise<User | undefined> {
        try {
            const data = await this.request<{ user: User }>(`/user/${userId}`);
            const u = data.user;
            return new User(u.id, u.firstName, u.lastName, u.email, u.joinedYear);
        } catch {
            return undefined;
        }
    }

    async getCreatorInfo(userId: number): Promise<{id: number, firstName: string}> {
        const data = await this.request<{ id: number; firstName: string }>(`/user/creatorInfo/${userId}`);
        return { id: data.id, firstName: data.firstName };
    }

    async updateUser(userId: number, userData: Partial<{ firstName: string; lastName: string; email: string; password: string; }>): Promise<User> {
        const data = await this.request<{ user: User }>(`/user/${userId}`, {
            method: "PUT",
            body: JSON.stringify(userData)
        });
        const u = data.user;
        return new User(u.id, u.firstName, u.lastName, u.email, u.joinedYear);
    }

    async searchUsers(query: string): Promise<User[]> {
        const data = await this.request<{ users: User[] }>(`/search?query=${encodeURIComponent(query)}`);
        return data.users.map(u => new User(u.id, u.firstName, u.lastName, u.email, u.joinedYear));
    }

    async reportUser(userId: number, reason: string): Promise<void> {
        await this.request<void>(`/report`, {
            method: "POST",
            body: JSON.stringify({ reportedUserId: userId, reason })
        });
    }

    async getFavouriteSports(userId: number): Promise<Sport[]> {
        const data = await this.request<{ sports: Sport[] }>(`/user/sports/${userId}`);
        return data.sports;
    }

    async updateFavouriteSports(userId: number, sportIds: number[]): Promise<Sport[]> {
        const data = await this.request<{ sports: Sport[] }>(`/user/sports/${userId}`, {
            method: "PUT",
            body: JSON.stringify({ sportIds })
        });
        return data.sports;
    }

    async getUserGames(userId: number): Promise<GameWithDetails[]> {
        const data = await this.request<{ games: GameWithDetails[] }>(`/user/games/${userId}`);
        return data.games;
    }

    async getUserStats(userId: number): Promise<{ gamesPlayed: number; gamesOrganized: number; yearJoined?: number }> {
        const data = await this.request<{ totalGamesPlayed: number; totalGamesHosted: number; yearJoined: number }>(`/user/stats/${userId}`);
        return { 
            gamesPlayed: data.totalGamesPlayed, 
            gamesOrganized: data.totalGamesHosted,
            yearJoined: data.yearJoined
        };
    }
}