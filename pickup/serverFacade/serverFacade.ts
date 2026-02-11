import { Game, GameFilter, GameWithDetails } from "@/objects/Game";
import Sport from "@/objects/Sport";
import User from "@/objects/User";
import Location from "@/objects/Location";
import Group from "@/objects/Group";
import GroupMessage from "@/objects/GroupMessage";
import { Float } from "react-native/Libraries/Types/CodegenTypes";

export default interface ServerFacade {
    // Auth
    getCurrentUser(): Promise<{ token: string, user: User } | null>;
    login(email: string, password: string): Promise<{ token: string, user: User }>;
    signup(email: string, password: string, firstName: string, lastName: string): Promise<{ token: string, user: User }>;
    logout(): Promise<void>;

    // User
    getUser(userId: number): Promise<User | undefined>;
    updateUser(userId: number, userData: Partial<{
        firstName: string;
        lastName: string;
        email: string;
        password: string;
    }>): Promise<User>;
    searchUsers(query: string): Promise<User[]>;
    reportUser(userId: number, reason: string): Promise<void>;
    getFavouriteSports(userId: number): Promise<Sport[]>;
    updateFavouriteSports(userId: number, sportIds: number[]): Promise<Sport[]>;
    getUserGames(userId: number): Promise<GameWithDetails[]>;
    getUserStats(userId: number): Promise<{ gamesPlayed: number; gamesOrganized: number }>;

    // Game
    getGames(filters?: GameFilter): Promise<Game[]>;
    getGamesWithDetails(filters?: GameFilter): Promise<GameWithDetails[]>;
    getGamePlayerCount(gameId: number): Promise<number>;
    getGamePlayers(gameId: number): Promise<User[]>;
    searchGames(query: string): Promise<GameWithDetails[]>;
    joinGame(gameId: number): Promise<void>;
    leaveGame(gameId: number): Promise<void>;
    createGame(gameData: {
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
    }): Promise<Game>;

    // Sport
    getSport(sportId: number): Promise<Sport>;
    getAllSports(): Promise<Sport[]>;
    getPossibleSports(): Promise<string[]>;
    getPossibleSkillLevels(): Promise<string[]>;

    // Location
    getLocationById(locationId: number): Promise<Location>;

    // Group
    getUserGroups(userId: number): Promise<Group[]>;
    getLastGroupMessage(groupId: number): Promise<GroupMessage | null>;
    getGroupMessages(groupId: number): Promise<GroupMessage[]>;
    getGroupMembers(groupId: number): Promise<User[]>;
    sendGroupMessage(groupId: number, content: string): Promise<GroupMessage>;
    getGroupUnreadStatus(groupId: number): Promise<boolean>;
    getLastReadMessageId(groupId: number): Promise<number | null>;
    lastMessageRead(groupId: number, lastReadMessageId?: number | null): Promise<void>;
}