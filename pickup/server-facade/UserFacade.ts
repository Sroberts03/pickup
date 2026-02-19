import { GameWithDetails } from "@/objects/Game";
import Sport from "@/objects/Sport";
import User from "@/objects/User";

export default interface UserFacade {
    getUser(userId: number): Promise<User | undefined>;
    getCreatorInfo(userId: number): Promise<{id: number, firstName: string}>;
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
}