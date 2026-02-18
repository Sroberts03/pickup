import { GameFilter, Game, GameWithDetails } from "@/objects/Game";
import Sport from "@/objects/Sport";
import User from "@/objects/User";
import { Float } from "react-native/Libraries/Types/CodegenTypesNamespace";
import GameFacade from "../GameFacade";
import * as SecureStore from 'expo-secure-store';

export default class ProdGameFacade implements GameFacade {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }
    
    async getGames(filters?: GameFilter): Promise<Game[]> {
        const token = await SecureStore.getItemAsync("authToken");
        const params = new URLSearchParams();
        if (filters) {
            if (filters.sport) params.append('sport', filters.sport.join(','));
            if (filters.skillLevel) params.append('skillLevel', filters.skillLevel.join(','));
            if (filters.maxPlayers) params.append('maxPlayers', filters.maxPlayers.toString());
            if (filters.latitude) params.append('latitude', filters.latitude.toString());
            if (filters.longitude) params.append('longitude', filters.longitude.toString());
            if (filters.radiusKm) params.append('radiusKm', filters.radiusKm.toString());
            if (filters.favoriteOnly) params.append('favoriteOnly', filters.favoriteOnly.toString());
            if (filters.happeningToday) params.append('happeningToday', filters.happeningToday.toString());
        }
        const response = await fetch(`${this.baseUrl}/game/games?${params.toString()}`, {
            method: "GET",
            headers: {
                "Authorization": token ? `Bearer ${token}` : "",
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) throw new Error("Failed to fetch games");
        const data = await response.json();
        return data.games.map((g: any) => g as Game);
    }

    async getGamesWithDetails(filters?: GameFilter): Promise<GameWithDetails[]> {
        const token = await SecureStore.getItemAsync("authToken");
        const params = new URLSearchParams();
        if (filters) {
            if (filters.sport) params.append('sport', filters.sport.join(','));
            if (filters.skillLevel) params.append('skillLevel', filters.skillLevel.join(','));
            if (filters.maxPlayers) params.append('maxPlayers', filters.maxPlayers.toString());
            if (filters.latitude) params.append('latitude', filters.latitude.toString());
            if (filters.longitude) params.append('longitude', filters.longitude.toString());
            if (filters.radiusKm) params.append('radiusKm', filters.radiusKm.toString());
            if (filters.favoriteOnly) params.append('favoriteOnly', filters.favoriteOnly.toString());
            if (filters.happeningToday) params.append('happeningToday', filters.happeningToday.toString());
        }
        const response = await fetch(`${this.baseUrl}/game/games/details?${params.toString()}`, {
            method: "GET",
            headers: {
                "Authorization": token ? `Bearer ${token}` : "",
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) throw new Error("Failed to fetch games with details");
        const data = await response.json();
        return data.games.map((g: any) => g as GameWithDetails);
    }

    async getGamePlayerCount(gameId: number): Promise<number> {
        const token = await SecureStore.getItemAsync("authToken");
        const response = await fetch(`${this.baseUrl}/game/playerCount/${gameId}`, {
            method: "GET",
            headers: {
                "Authorization": token ? `Bearer ${token}` : "",
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) throw new Error("Failed to fetch player count");
        const data = await response.json();
        return data.playerCount;
    }

    async getGamePlayers(gameId: number): Promise<User[]> {
        const token = await SecureStore.getItemAsync("authToken");
        const response = await fetch(`${this.baseUrl}/game/players/${gameId}`, {
            method: "GET",
            headers: {
                "Authorization": token ? `Bearer ${token}` : "",
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) throw new Error("Failed to fetch game players");
        const data = await response.json();
        return data.players.map((u: any) => u as User);
    }

    async searchGames(query: string): Promise<GameWithDetails[]> {
        const token = await SecureStore.getItemAsync("authToken");
        const response = await fetch(`${this.baseUrl}/game/search?query=${encodeURIComponent(query)}`, {
            method: "GET",
            headers: {
                "Authorization": token ? `Bearer ${token}` : "",
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) throw new Error("Failed to search games");
        const data = await response.json();
        return data.games.map((g: any) => g as GameWithDetails);
    }

    async joinGame(gameId: number): Promise<void> {
        const token = await SecureStore.getItemAsync("authToken");
        const response = await fetch(`${this.baseUrl}/game/join`, {
            method: "POST",
            headers: {
                "Authorization": token ? `Bearer ${token}` : "",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ gameId })
        });
        if (!response.ok) throw new Error("Failed to join game");
    }

    async leaveGame(gameId: number): Promise<void> {
        const token = await SecureStore.getItemAsync("authToken");
        const response = await fetch(`${this.baseUrl}/game/leave`, {
            method: "PUT",
            headers: {
                "Authorization": token ? `Bearer ${token}` : "",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ gameId })
        });
        if (!response.ok) throw new Error("Failed to leave game");
    }

    async createGame(gameData: { name: string; description: string; sportId: number; startTime: Date; endTime: Date; maxPlayers: number; skillLevel: string; rules: string; address: string; placeId: string; lat: Float | null; lng: Float | null; }): Promise<Game> {
        const token = await SecureStore.getItemAsync("authToken");
        const response = await fetch(`${this.baseUrl}/game/create`, {
            method: "POST",
            headers: {
                "Authorization": token ? `Bearer ${token}` : "",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: gameData.name,
                description: gameData.description,
                sportId: gameData.sportId,
                startTime: gameData.startTime.toISOString(),
                endTime: gameData.endTime.toISOString(),
                maxPlayers: gameData.maxPlayers,
                skillLevel: gameData.skillLevel,
                rules: gameData.rules,
                address: gameData.address,
                placeId: gameData.placeId,
                latitude: gameData.lat,
                longitude: gameData.lng
            })
        });
        if (!response.ok) throw new Error("Failed to create game");
        const data = await response.json();
        return data.game as Game;
    }

    async getSport(sportId: number): Promise<Sport> {
        const token = await SecureStore.getItemAsync("authToken");
        const response = await fetch(`${this.baseUrl}/game/sport/${sportId}`, {
            method: "GET",
            headers: {
                "Authorization": token ? `Bearer ${token}` : "",
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) throw new Error("Failed to fetch sport");
        const data = await response.json();
        return data.sport as Sport;
    }

    async getAllSports(): Promise<Sport[]> {
        const token = await SecureStore.getItemAsync("authToken");
        const response = await fetch(`${this.baseUrl}/game/sports/all`, {
            method: "GET",
            headers: {
                "Authorization": token ? `Bearer ${token}` : "",
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) throw new Error("Failed to fetch sports");
        const data = await response.json();
        return data.sports.map((s: any) => s as Sport);
    }

    async getPossibleSports(): Promise<string[]> {
        const token = await SecureStore.getItemAsync("authToken");
        const response = await fetch(`${this.baseUrl}/game/sports/all/names`, {
            method: "GET",
            headers: {
                "Authorization": token ? `Bearer ${token}` : "",
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) throw new Error("Failed to fetch possible sports");
        const data = await response.json();
        return data.sportNames;
    }

    async getPossibleSkillLevels(): Promise<string[]> {
        const token = await SecureStore.getItemAsync("authToken");
        const response = await fetch(`${this.baseUrl}/game/skillLevels`, {
            method: "GET",
            headers: {
                "Authorization": token ? `Bearer ${token}` : "",
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) throw new Error("Failed to fetch possible skill levels");
        const data = await response.json();
        return data.skillLevels;
    }
}