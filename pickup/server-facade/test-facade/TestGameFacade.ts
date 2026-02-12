import { Game, GameStatus, SkillLevel, GameFilter, GameWithDetails } from "@/objects/Game";
import Sport from "@/objects/Sport";
import User from "@/objects/User";
import { Float } from "react-native/Libraries/Types/CodegenTypesNamespace";
import GameFacade from "../GameFacade";
import { MockDataStore } from "./MockDataStore";
import Location from "@/objects/Location";

const toRadians = (value: number) => (value * Math.PI) / 180;

const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const earthRadiusKm = 6371;
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
};

export default class TestGameFacade implements GameFacade {
    constructor(private dataStore: MockDataStore) {}

    async getGames(filters?: GameFilter): Promise<Game[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const now = new Date();
                let games = Array.from(this.dataStore.games.values()).filter(game => game.endTime > now);
                const currentUserId = this.dataStore.currentUserId;
                
                if (currentUserId !== null) {
                    const joinedGames = this.dataStore.userGames.get(currentUserId);
                    if (joinedGames && joinedGames.size > 0) {
                        games = games.filter(game => !joinedGames.has(game.id));
                    }
                }
                
                if (!filters) {
                    resolve(games);
                    return;
                }
                
                if (filters.sport && filters.sport.length > 0) {
                    games = games.filter(game => {
                        const sportName = this.dataStore.sports.get(game.sportId)?.name;
                        return sportName && filters.sport?.includes(sportName);
                    });
                }
                
                if (filters.skillLevel && filters.skillLevel.length > 0) {
                    games = games.filter(game => filters.skillLevel?.includes(game.skillLevel));
                }
                
                if (filters.maxPlayers) {
                    games = games.filter(game => game.maxPlayers === filters.maxPlayers);
                }
                
                if (
                    filters.latitude !== undefined &&
                    filters.longitude !== undefined &&
                    filters.radiusKm !== undefined
                ) {
                    games = games.filter(game => {
                        const location = this.dataStore.locations.get(game.locationId);
                        if (!location) return false;
                        const distance = getDistanceKm(
                            filters.latitude as number,
                            filters.longitude as number,
                            Number(location.lat),
                            Number(location.lng)
                        );
                        return distance <= (filters.radiusKm as number);
                    });
                }
                
                if (filters.happeningToday) {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const tomorrow = new Date(today);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    
                    games = games.filter(game => {
                        const gameDate = new Date(game.startTime);
                        return gameDate >= today && gameDate < tomorrow;
                    });
                }

                resolve(games);
            }, 500);
        });
    }

    async getGamesWithDetails(filters?: GameFilter): Promise<GameWithDetails[]> {
        const games = await this.getGames(filters);

        const gamesWithDetails = await Promise.all(
            games.map(async (game) => {
                const sport = await this.getSport(game.sportId);
                const currentPlayers = await this.getGamePlayerCount(game.id);
                const location = this.dataStore.locations.get(game.locationId);

                return {
                    ...game,
                    sportName: sport.name,
                    currentPlayers: currentPlayers,
                    location: location,
                };
            })
        );

        return gamesWithDetails;
    }

    async getGamePlayerCount(gameId: number): Promise<number> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const playerCount = Array.from(this.dataStore.userGames.values()).filter(gamesSet => gamesSet.has(gameId)).length;
                if (playerCount !== undefined) {
                    resolve(playerCount);
                } else {
                    reject(new Error("Game not found"));
                }
            }, 500);
        });
    }

    async getGamePlayers(gameId: number): Promise<User[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const playerIds: number[] = [];
                this.dataStore.userGames.forEach((games, userId) => {
                    if (games.has(gameId)) {
                        playerIds.push(userId);
                    }
                });

                const players = playerIds
                    .map(id => this.dataStore.users.get(id))
                    .filter((user): user is User => user !== undefined);

                resolve(players);
            }, 500);
        });
    }

    async searchGames(query: string): Promise<GameWithDetails[]> {
        return new Promise((resolve) => {
            setTimeout(async () => {
                const lowerQuery = query.toLowerCase();
                const allGames = Array.from(this.dataStore.games.values());

                const filteredGames = allGames.filter(game => {
                    const creator = this.dataStore.users.get(game.creatorId);
                    const creatorName = creator ? `${creator.firstName} ${creator.lastName}`.toLowerCase() : "";

                    return game.name.toLowerCase().includes(lowerQuery) ||
                        creatorName.includes(lowerQuery);
                });

                const gamesWithDetails = await Promise.all(
                    filteredGames.map(async (game) => {
                        const sport = await this.getSport(game.sportId);
                        const currentPlayers = await this.getGamePlayerCount(game.id);
                        const location = this.dataStore.locations.get(game.locationId);

                        return {
                            ...game,
                            sportName: sport.name,
                            currentPlayers: currentPlayers,
                            location: location
                        };
                    })
                );

                resolve(gamesWithDetails);
            }, 500);
        });
    }

    async joinGame(gameId: number): Promise<void> {
        return new Promise((resolve, reject) => {
            setTimeout(async () => {
                const userId = this.dataStore.currentUserId;

                if (!userId) {
                    reject(new Error("User not found"));
                    return;
                }

                if (!this.dataStore.games.has(gameId)) {
                    reject(new Error("Game not found"));
                    return;
                }

                if (!this.dataStore.userGames.has(userId)) {
                    this.dataStore.userGames.set(userId, new Set());
                }

                this.dataStore.userGames.get(userId)?.add(gameId);
                resolve();
            }, 500);
        });
    }

    async leaveGame(gameId: number): Promise<void> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const userId = this.dataStore.currentUserId;

                if (!userId) {
                    reject(new Error("User not found"));
                    return;
                }

                if (!this.dataStore.games.has(gameId)) {
                    reject(new Error("Game not found"));
                    return;
                }

                if (this.dataStore.userGames.has(userId)) {
                    this.dataStore.userGames.get(userId)?.delete(gameId);
                }
                resolve();
            }, 500);
        });
    }

    async createGame(gameData: {
        name: string;
        description: string;
        sportId: number;
        startTime: Date;
        endTime: Date;
        maxPlayers: number;
        skillLevel: string;
        rules: string;
        address: string;
        placeId: string;
        lat: Float | null;
        lng: Float | null;
    }): Promise<Game> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (!this.dataStore.currentUserId) {
                    reject(new Error("User not logged in"));
                    return;
                }
                if (gameData.lat === null || gameData.lng === null) {
                    reject(new Error("Invalid location data"));
                    return;
                }

                const locationId = this.dataStore.locations.size + 1;
                const newLocation = new Location(
                    locationId,
                    gameData.placeId,
                    gameData.address,
                    gameData.lat,
                    gameData.lng
                );

                const newGameId = this.dataStore.games.size + 1;
                const newGame = new Game(
                    newGameId,
                    gameData.name,
                    gameData.description,
                    gameData.sportId,
                    this.dataStore.currentUserId,
                    gameData.startTime,
                    gameData.endTime,
                    locationId,
                    gameData.maxPlayers,
                    GameStatus.Scheduled,
                    gameData.skillLevel as SkillLevel,
                    gameData.rules
                );

                this.dataStore.games.set(newGameId, newGame);
                this.dataStore.locations.set(locationId, newLocation);
                
                // Auto-join the creator to the game
                if (!this.dataStore.userGames.has(this.dataStore.currentUserId)) {
                    this.dataStore.userGames.set(this.dataStore.currentUserId, new Set());
                }
                this.dataStore.userGames.get(this.dataStore.currentUserId)?.add(newGameId);

                resolve(newGame);
            }, 500);
        });
    }

    async getSport(sportId: number): Promise<Sport> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const sport = this.dataStore.sports.get(sportId);
                if (sport) {
                    resolve(sport);
                } else {
                    reject(new Error("Sport not found"));
                }
            }, 500);
        });
    }

    async getAllSports(): Promise<Sport[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(Array.from(this.dataStore.sports.values()));
            }, 500);
        });
    }

    async getPossibleSports(): Promise<string[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(Array.from(this.dataStore.sports.values()).map(sport => sport.name));
            }, 500);
        });
    }

    async getPossibleSkillLevels(): Promise<string[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(Array.from(this.dataStore.skillLevels.values()));
            }, 500);
        });
    }
}
