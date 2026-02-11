import { Game, GameFilter, GameWithDetails } from "@/objects/Game";
import Sport from "@/objects/Sport";
import User from "@/objects/User";
import Location from "@/objects/Location";
import Group from "@/objects/Group";
import GroupMessage from "@/objects/GroupMessage";
import { Float } from "react-native/Libraries/Types/CodegenTypes";

export default interface ServerFacade {
    getCurrentUser(): Promise<{ token: string, user: User } | null>;
    login(email: string, password: string): Promise<{ token: string, user: User }>;
    signup(email: string, password: string, firstName: string, lastName: string): Promise<{ token: string, user: User }>;
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
    reportUser(userId: number, reason: string): Promise<void>;

    getUser(userId: number): Promise<User | undefined>;
    updateUser(userId: number, userData: Partial<{
        firstName: string;
        lastName: string;
        email: string;
        password: string;
    }>): Promise<User>;
    getGamePlayers(gameId: number): Promise<User[]>;
    joinGame(gameId: number): Promise<void>;
    leaveame(gameId: number): Promise<void>;

    getFavouriteSports(userId: number): Promise<Sport[]>;
    updateFavouriteSports(userId: number, sportIds: number[]): Promise<Sport[]>;
    getUserGames(userId: number): Promise<GameWithDetails[]>;
    getUserStats(userId: number): Promise<{ gamesPlayed: number; gamesOrganized: number }>;
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

    getLocationById(locationId: number): Promise<Location>;

    getUserGroups(userId: number): Promise<Group[]>;
    getLastGroupMessage(groupId: number): Promise<GroupMessage | null>;
    getGroupMessages(groupId: number): Promise<GroupMessage[]>;
    getGroupMembers(groupId: number): Promise<User[]>;
    sendGroupMessage(groupId: number, content: string): Promise<GroupMessage>;
    getGroupUnreadStatus(groupId: number): Promise<boolean>;
    getLastReadMessageId(groupId: number): Promise<number | null>;
    lastMessageRead(groupId: number, lastReadMessageId?: number | null): Promise<void>;
}