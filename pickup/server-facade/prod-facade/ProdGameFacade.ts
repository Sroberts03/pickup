import { GameFilter, Game, GameWithDetails } from "@/objects/Game";
import Sport from "@/objects/Sport";
import User from "@/objects/User";
import { Float } from "react-native/Libraries/Types/CodegenTypesNamespace";
import GameFacade from "../GameFacade";
import * as SecureStore from 'expo-secure-store';

export default class ProdGameFacade implements GameFacade {
    private readonly baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = `${baseUrl}/game`;
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

    private buildQueryParams(filters?: GameFilter): string {
        if (!filters) return "";
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value === undefined || value === null) return;

            if (Array.isArray(value)) {
                // NestJS @IsArray expects multiple entries for the same key
                value.forEach(item => params.append(key, item.toString()));
            } else if (value instanceof Date) {
                params.append(key, value.toISOString());
            } else {
                params.append(key, value.toString());
            }
        });

        const queryString = params.toString();
        return queryString ? `?${queryString}` : "";
    }

    async getGames(filters?: GameFilter): Promise<Game[]> {
        const data = await this.request<{ games: Game[] }>(`/games${this.buildQueryParams(filters)}`);
        return data.games;
    }

    async getGamesWithDetails(filters?: GameFilter): Promise<GameWithDetails[]> {
        const data = await this.request<{ games: GameWithDetails[] }>(`/games/details${this.buildQueryParams(filters)}`);
        return data.games;
    }

    async getGamePlayerCount(gameId: number): Promise<number> {
        const data = await this.request<{ playerCount: number }>(`/playerCount/${gameId}`);
        return data.playerCount;
    }

    async getGamePlayers(gameId: number): Promise<User[]> {
        const data = await this.request<{ players: User[] }>(`/players/${gameId}`);
        return data.players;
    }

    async searchGames(query: string): Promise<GameWithDetails[]> {
        const data = await this.request<{ games: GameWithDetails[] }>(`/search?query=${encodeURIComponent(query)}`);
        return data.games;
    }

    async joinGame(gameId: number): Promise<void> {
        await this.request<void>(`/join`, {
            method: "POST",
            body: JSON.stringify({ gameId })
        });
    }

    async leaveGame(gameId: number): Promise<void> {
        await this.request<void>(`/leave`, {
            method: "PUT",
            body: JSON.stringify({ gameId })
        });
    }

    async createGame(gameData: { 
        name: string; description: string; sportId: number; startTime: Date; 
        endTime: Date; maxPlayers: number; skillLevel: string; rules: string; 
        address: string; placeId: string; lat: Float | null; lng: Float | null; 
    }): Promise<Game> {
        const data = await this.request<{ game: Game }>(`/create`, {
            method: "POST",
            body: JSON.stringify({
                ...gameData,
                startTime: gameData.startTime.toISOString(),
                endTime: gameData.endTime.toISOString(),
                latitude: gameData.lat,
                longitude: gameData.lng
            })
        });
        return data.game;
    }

    async getSport(sportId: number): Promise<Sport> {
        const data = await this.request<{ sport: Sport }>(`/sport/${sportId}`);
        return data.sport;
    }

    async getAllSports(): Promise<Sport[]> {
        const data = await this.request<{ sports: Sport[] }>(`/sports/all`);
        return data.sports;
    }

    async getPossibleSports(): Promise<string[]> {
        const data = await this.request<{ sportNames: string[] }>(`/sports/all/names`);
        return data.sportNames;
    }

    async getPossibleSkillLevels(): Promise<string[]> {
        const data = await this.request<{ skillLevels: string[] }>(`/skillLevels`);
        return data.skillLevels;
    }
}