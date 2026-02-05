import User from "@/objects/User";
import ServerFacade from "./serverFacade";
import Group from "@/objects/Group";
import GroupMessage from "@/objects/GroupMessage";
import { Game, GameStatus, SkillLevel, GameFilter, GameWithDetails } from "@/objects/Game";
import Location from "@/objects/Location";
import Sport from "@/objects/Sport";
import { Float } from "react-native/Libraries/Types/CodegenTypes";

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


export default class TestServerFacade implements ServerFacade {
    users = new Map<number, User>();
    sessions = new Map<number, string>();
    currentUserId: number | null = null;
    groups = new Map<number, Group>();
    groupMessages = new Map<number, GroupMessage>();
    sports = new Map<number, Sport>();
    skillLevels = new Map<number, string>();
    games = new Map<number, Game>();
    locations = new Map<number, Location>();
    userFavoriteSports = new Map<number, Set<number>>();
    userGames = new Map<number, Set<number>>();
    userGroups = new Map<number, Set<number>>();

    constructor() {
        const currentYear = new Date().getFullYear();
        this.users.set(1, new User(1, "Test", "User", "test-user@example.com", true, currentYear - 2));
        this.users.set(2, new User(2, "Jane", "Doe", "jane.doe@example.com", true, currentYear - 1));

        this.groups.set(1, new Group(1, "Morning Joggers", "Group for early morning jogs", false, new Date(), 1, 1));
        this.groups.set(2, new Group(2, "Evening Cyclists", "Group for evening cycling sessions", true, new Date(), 2, null));
        this.groups.set(3, new Group(3, "Weekend Hikers", "Group for weekend hiking adventures", false, new Date(), 1, null));
        this.groups.set(4, new Group(4, "City Runners", "Group for urban running enthusiasts", true, new Date(), 2, 2));

        this.groupMessages.set(1, new GroupMessage(1, 1, 1, "Welcome to the Morning Joggers group!", new Date()));
        this.groupMessages.set(2, new GroupMessage(2, 2, 2, "Don't forget our ride tomorrow!", new Date()));

        this.sports.set(1, new Sport(1, "Soccer"));
        this.sports.set(2, new Sport(2, "Basketball"));
        this.sports.set(3, new Sport(3, "Football"));

        this.locations.set(1, new Location(1, "Central Park", "New York, NY", 40.785091, -73.968285));
        this.locations.set(2, new Location(2, "Golden Gate Park", "San Francisco, CA", 37.769420, -122.486214));

        this.games.set(1, new Game(
            1,
            "Sunday Soccer",
            "Casual soccer game",
            1,
            1,
            new Date(),
            new Date(Date.now() + 2 * 60 * 60 * 1000),
            1,
            10,
            GameStatus.Scheduled,
            SkillLevel.Beginner,
            true,
            "Normal soccer rules apply"
        ));
        this.games.set(2, new Game(
            2,
            "Friday Basketball",
            "Competitive basketball game",
            2,
            1,
            new Date(),
            new Date(Date.now() + 2 * 60 * 60 * 1000),
            2,
            8,
            GameStatus.Scheduled,
            SkillLevel.Intermediate,
            false,
            "Normal basketball rules apply"
        ));
        this.games.set(3, new Game(
            3,
            "Saturday Football",
            "Touch football game",
            3,
            2,
            new Date(),
            new Date(Date.now() + 2 * 60 * 60 * 1000),
            2,
            12,
            GameStatus.Scheduled,
            SkillLevel.Advanced,
            true,
            "Normal football rules apply"
        ));

        this.userFavoriteSports.set(1, new Set([1, 2]));
        this.userFavoriteSports.set(2, new Set([2, 3]));

        this.userGames.set(1, new Set([1]));
        this.userGames.set(2, new Set([2]));

        this.userGroups.set(1, new Set([1, 3]));
        this.userGroups.set(2, new Set([2, 4]));

        this.skillLevels.set(1, "Beginner");
        this.skillLevels.set(2, "Intermediate");
        this.skillLevels.set(3, "Advanced");
        this.skillLevels.set(4, "Expert");
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

    async signup(email: string, password: string, firstName: string, lastName: string): Promise<{ token: string, user: User }> {
        const newUser = new User(
            this.users.size + 1,
            email,
            firstName,
            lastName,
            true
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

    async getGames(filters?: GameFilter): Promise<Game[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const now = new Date();
                let games = Array.from(this.games.values()).filter(game => game.endTime > now);
                const currentUserId = this.currentUserId;
                if (currentUserId !== null) {
                    const joinedGames = this.userGames.get(currentUserId);
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
                        const sportName = this.sports.get(game.sportId)?.name;
                        return sportName && filters.sport?.includes(sportName);
                    });
                }
                if (filters.location) {
                    games = games.filter(game => this.locations.get(game.locationId)?.address === filters.location);
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
                        const location = this.locations.get(game.locationId);
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

                return {
                    ...game,
                    sportName: sport.name,
                    currentPlayers: currentPlayers,
                };
            })
        );

        return gamesWithDetails;
    }

    async getSport(sportId: number): Promise<Sport> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const sport = this.sports.get(sportId);
                if (sport) {
                    resolve(sport);
                } else {
                    reject(new Error("Sport not found"));
                }
            }, 500);
        });
    }

    async getGamePlayerCount(gameId: number): Promise<number> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const playerCount = Array.from(this.userGames.values()).filter(gamesSet => gamesSet.has(gameId)).length;
                if (playerCount !== undefined) {
                    resolve(playerCount);
                } else {
                    reject(new Error("Game not found"));
                }
            }, 500);
        });
    }

    async getAllSports(): Promise<Sport[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(Array.from(this.sports.values()));
            }, 500);
        });
    }

    async getPossibleSports(): Promise<string[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(Array.from(this.sports.values()).map(sport => sport.name));
            }, 500);
        });
    }

    async getPossibleSkillLevels(): Promise<string[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(Array.from(this.skillLevels.values()));
            }, 500);
        });
    }

    async searchGames(query: string): Promise<GameWithDetails[]> {
        return new Promise((resolve) => {
            setTimeout(async () => {
                const lowerQuery = query.toLowerCase();
                const allGames = Array.from(this.games.values());

                const filteredGames = allGames.filter(game => {
                    const creator = this.users.get(game.creatorId);
                    const creatorName = creator ? `${creator.firstName} ${creator.lastName}`.toLowerCase() : "";

                    return game.name.toLowerCase().includes(lowerQuery) ||
                        creatorName.includes(lowerQuery);
                });

                const gamesWithDetails = await Promise.all(
                    filteredGames.map(async (game) => {
                        const sport = await this.getSport(game.sportId);
                        const currentPlayers = await this.getGamePlayerCount(game.id);

                        // Mock check if user 1 is joined
                        const userId = 1;
                        const isJoined = this.userGames.get(userId)?.has(game.id) ?? false;

                        return {
                            ...game,
                            sportName: sport.name,
                            currentPlayers: currentPlayers,
                            isJoined: isJoined
                        };
                    })
                );

                resolve(gamesWithDetails);
            }, 500);
        });
    }

    async searchUsers(query: string): Promise<User[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const lowerQuery = query.toLowerCase();
                const allUsers = Array.from(this.users.values());

                const filteredUsers = allUsers.filter(user => {
                    if (!user.isPublic) return false;

                    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
                    return fullName.includes(lowerQuery) ||
                        user.email.toLowerCase().includes(lowerQuery);
                });

                resolve(filteredUsers);
            }, 500);
        });
    }

    async getUser(userId: number): Promise<User | undefined> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(this.users.get(userId));
            }, 500);
        });
    }

    async updateUser(userId: number, userData: Partial<{
        firstName: string;
        lastName: string;
        email: string;
        password: string;
        isPublic: boolean;
    }>): Promise<User> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const user = this.users.get(userId);
                if (!user) {
                    reject(new Error('User not found'));
                    return;
                }

                // Update user properties
                if (userData.firstName !== undefined) user.firstName = userData.firstName;
                if (userData.lastName !== undefined) user.lastName = userData.lastName;
                if (userData.email !== undefined) user.email = userData.email;
                if (userData.isPublic !== undefined) user.isPublic = userData.isPublic;
                // Note: In real implementation, password would be hashed

                this.users.set(userId, user);
                resolve(user);
            }, 500);
        });
    }

    async getGamePlayers(gameId: number): Promise<User[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const playerIds: number[] = [];
                this.userGames.forEach((games, userId) => {
                    if (games.has(gameId)) {
                        playerIds.push(userId);
                    }
                });

                const players = playerIds
                    .map(id => this.users.get(id))
                    .filter((user): user is User => user !== undefined);

                resolve(players);
            }, 500);
        });
    }

    async joinGame(gameId: number): Promise<void> {
        return new Promise((resolve, reject) => {
            setTimeout(async () => {
                const userId = this.currentUserId;

                if (!userId) {
                    reject(new Error("User not found"));
                    return;
                }

                if (!this.games.has(gameId)) {
                    reject(new Error("Game not found"));
                    return;
                }

                if (!this.userGames.has(userId)) {
                    this.userGames.set(userId, new Set());
                }

                this.userGames.get(userId)?.add(gameId);
                resolve();
            }, 500);
        });
    }

    async leaveGame(gameId: number): Promise<void> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const userId = this.currentUserId;

                if (!userId) {
                    reject(new Error("User not found"));
                    return;
                }

                if (!this.games.has(gameId)) {
                    reject(new Error("Game not found"));
                    return;
                }

                if (this.userGames.has(userId)) {
                    this.userGames.get(userId)?.delete(gameId);
                }
                resolve();
            }, 500);
        });
    }

    async getFavouriteSports(userId: number): Promise<Sport[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const sports = this.userFavoriteSports.get(userId);
                if (sports) {
                    resolve(Array.from(sports).map(id => this.sports.get(id)).filter((sport): sport is Sport => sport !== undefined));
                } else {
                    resolve([]);
                }
            }, 500);
        });
    }

    async updateFavouriteSports(userId: number, sportIds: number[]): Promise<Sport[]> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const user = this.users.get(userId);
                if (!user) {
                    reject(new Error("User not found"));
                    return;
                }

                const validIds = sportIds.filter((id) => this.sports.has(id));
                this.userFavoriteSports.set(userId, new Set(validIds));

                const updatedSports = validIds
                    .map((id) => this.sports.get(id))
                    .filter((sport): sport is Sport => sport !== undefined);

                resolve(updatedSports);
            }, 500);
        });
    }

    async getUserGames(userId: number): Promise<GameWithDetails[]> {
        return new Promise(async (resolve) => {
            setTimeout(async () => {
                const userGameIds = this.userGames.get(userId);
                if (!userGameIds) {
                    resolve([]);
                    return;
                }

                const userGames = Array.from(userGameIds)
                    .map(gameId => this.games.get(gameId))
                    .filter((game): game is Game => game !== undefined);

                const gamesWithDetails = await Promise.all(
                    userGames.map(async (game) => {
                        const sport = await this.getSport(game.sportId);
                        const currentPlayers = await this.getGamePlayerCount(game.id);

                        return {
                            ...game,
                            sportName: sport.name,
                            currentPlayers: currentPlayers,
                        };
                    })
                );

                resolve(gamesWithDetails);
            }, 500);
        });
    }

    async getUserStats(userId: number): Promise<{ gamesPlayed: number; gamesOrganized: number }> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const gamesPlayed = this.userGames.get(userId)?.size || 0;
                const gamesOrganized = Array.from(this.games.values()).filter(g => g.creatorId === userId).length;
                
                resolve({ gamesPlayed, gamesOrganized });
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
        isPrivate: boolean;
        rules: string;
        address: string;
        placeId: string;
        lat: Float | null;
        lng: Float | null;
    }): Promise<Game> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (!this.currentUserId) {
                    reject(new Error("User not logged in"));
                    return;
                }
                if (gameData.lat === null || gameData.lng === null) {
                    reject(new Error("Invalid location data"));
                    return;
                }

                const locationId = this.locations.size + 1;
                const newLocation = new Location(
                    locationId,
                    gameData.placeId,
                    gameData.address,
                    gameData.lat,
                    gameData.lng
                );

                const newGameId = this.games.size + 1;
                const newGame = new Game(
                    newGameId,
                    gameData.name,
                    gameData.description,
                    gameData.sportId,
                    this.currentUserId,
                    gameData.startTime,
                    gameData.endTime,
                    locationId,
                    gameData.maxPlayers,
                    GameStatus.Scheduled,
                    gameData.skillLevel as SkillLevel,
                    gameData.isPrivate,
                    gameData.rules
                );

                this.games.set(newGameId, newGame);
                this.locations.set(locationId, newLocation);
                
                // Auto-join the creator to the game
                if (!this.userGames.has(this.currentUserId)) {
                    this.userGames.set(this.currentUserId, new Set());
                }
                this.userGames.get(this.currentUserId)?.add(newGameId);

                resolve(newGame);
            }, 500);
        });
    }

    async getLocationById(locationId: number): Promise<Location> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const location = this.locations.get(locationId);
                if (location) {
                    resolve(location);
                } else {
                    reject(new Error("Location not found"));
                }
            }, 500);
        });
    }
}