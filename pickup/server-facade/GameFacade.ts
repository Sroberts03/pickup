import { Game, GameFilter, GameWithDetails } from "@/objects/Game";
import Sport from "@/objects/Sport";
import User from "@/objects/User";
import { Float } from "react-native/Libraries/Types/CodegenTypesNamespace";

export default interface GameFacade {
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

    getSport(sportId: number): Promise<Sport>;
    getAllSports(): Promise<Sport[]>;
    getPossibleSports(): Promise<string[]>;
    getPossibleSkillLevels(): Promise<string[]>;
}