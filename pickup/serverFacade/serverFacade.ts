import { Game, GameFilter } from "@/objects/Game";
import Sport from "@/objects/Sport";
import User from "@/objects/User";

export default interface ServerFacade {
    getCurrentUser(): Promise<{ token: string, user: User } | null>;
    login(email: string, password: string): Promise<{ token: string, user: User }>;
    signup(email: string, password: string, firstName: string, lastName: string, profilePicUrl: string): Promise<{ token: string, user: User }>;
    logout(): Promise<void>;

    getGames(filters?: GameFilter): Promise<Game[]>;
    getSport(sportId: number): Promise<Sport>;
    getGamePlayerCount(gameId: number): Promise<number>;
    getPossibleSports(): Promise<string[]>;
    getPossibleSkillLevels(): Promise<string[]>;
}