import { Game, GameFilter, GameWithDetails } from "@/objects/Game";
import Sport from "@/objects/Sport";
import User from "@/objects/User";
import Location from "@/objects/Location";
import { Float } from "react-native/Libraries/Types/CodegenTypes";

export default interface ServerFacade {
    getCurrentUser(): Promise<{ token: string, user: User } | null>;
    login(email: string, password: string): Promise<{ token: string, user: User }>;
    signup(email: string, password: string, firstName: string, lastName: string, profilePicUrl: string): Promise<{ token: string, user: User }>;
    logout(): Promise<void>;

    getGames(filters?: GameFilter): Promise<Game[]>;
    getGamesWithDetails(filters?: GameFilter): Promise<GameWithDetails[]>;
    getSport(sportId: number): Promise<Sport>;
    getGamePlayerCount(gameId: number): Promise<number>;
    getAllSports(): Promise<Sport[]>;
    getPossibleSports(): Promise<string[]>;
    getPossibleSkillLevels(): Promise<string[]>;

    searchGames(query: string): Promise<GameWithDetails[]>;
    searchUsers(query: string): Promise<User[]>;

    getUser(userId: number): Promise<User | undefined>;
    updateUser(userId: number, userData: Partial<{
        firstName: string;
        lastName: string;
        email: string;
        password: string;
        isPublic: boolean;
        profilePicUrl: string;
    }>): Promise<User>;
    getGamePlayers(gameId: number): Promise<User[]>;
    joinGame(gameId: number): Promise<void>;
    leaveGame(gameId: number): Promise<void>;

    getFavouriteSports(userId: number): Promise<Sport[]>;
    updateFavouriteSports(userId: number, sportIds: number[]): Promise<Sport[]>;
    getUserGames(userId: number): Promise<GameWithDetails[]>;
    createGame(gameData: {
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
    }): Promise<Game>;

    getLocationById(locationId: number): Promise<Location>;
}