import User from "@/objects/User";
import AuthFacade from "./AuthFacade";
import GameFacade from "./GameFacade";
import GroupFacade from "./GroupFacade";
import LocationFacade from "./LocationFacade";
import UserFacade from "./UserFacade";
import { Game, GameFilter, GameWithDetails } from "@/objects/Game";
import Sport from "@/objects/Sport";
import { Float } from "react-native/Libraries/Types/CodegenTypesNamespace";
import Location from "@/objects/Location";
import Group from "@/objects/Group";
import GroupMessage from "@/objects/GroupMessage";

export default class ServerFacadeRouter {
    readonly auth: AuthFacade;
    readonly user: UserFacade;
    readonly game: GameFacade;
    readonly group: GroupFacade;
    readonly location: LocationFacade;

    constructor(auth: AuthFacade, user: UserFacade, game: GameFacade, group: GroupFacade, location: LocationFacade) {
        this.auth = auth;
        this.user = user;
        this.game = game;
        this.group = group;
        this.location = location;
    }

    //auth
    getCurrentUser(): Promise<{ token: string, user: User } | null> {
        return this.auth.getCurrentUser();
    }

    login(email: string, password: string): Promise<{ token: string, user: User }> {
        return this.auth.login(email, password);
    }

    signup(email: string, password: string, firstName: string, lastName: string): Promise<{ token: string, user: User }> {
        return this.auth.signup(email, password, firstName, lastName);
    }

    logout(): Promise<void> {
        return this.auth.logout();
    }

    //user
    getUser(userId: number): Promise<User | undefined> {
        return this.user.getUser(userId);
    }

    getCreatorInfo(userId: number): Promise<User> {
        return this.user.getCreatorInfo(userId);
    }

    updateUser(userId: number, userData: Partial<{
        firstName: string;
        lastName: string;
        email: string;
        password: string;
    }>): Promise<User> {
        return this.user.updateUser(userId, userData);
    }

    searchUsers(query: string): Promise<User[]> {
        return this.user.searchUsers(query);
    }

    reportUser(userId: number, reason: string): Promise<void> {
        return this.user.reportUser(userId, reason);
    }

    getFavouriteSports(userId: number): Promise<Sport[]> {
        return this.user.getFavouriteSports(userId);
    }

    updateFavouriteSports(userId: number, sportIds: number[]): Promise<Sport[]> {
        return this.user.updateFavouriteSports(userId, sportIds);
    }

    getUserGames(userId: number): Promise<GameWithDetails[]> {
        return this.user.getUserGames(userId);
    }

    getUserStats(userId: number): Promise<{ gamesPlayed: number; gamesOrganized: number }> {
        return this.user.getUserStats(userId);
    }

    //game and sport
    getGames(filters?: GameFilter): Promise<Game[]> {
        return this.game.getGames(filters);
    }

    getGamesWithDetails(filters?: GameFilter): Promise<GameWithDetails[]> {
        return this.game.getGamesWithDetails(filters);
    }

    getGamePlayerCount(gameId: number): Promise<number> {
        return this.game.getGamePlayerCount(gameId);
    }

    getGamePlayers(gameId: number): Promise<User[]> {
        return this.game.getGamePlayers(gameId);
    }

    searchGames(query: string): Promise<GameWithDetails[]> {
        return this.game.searchGames(query);
    }

    joinGame(gameId: number): Promise<void> {
        return this.game.joinGame(gameId);
    }

    leaveGame(gameId: number): Promise<void> {
        return this.game.leaveGame(gameId);
    }

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
    }): Promise<Game> {
        return this.game.createGame(gameData);
    }

    getSport(sportId: number): Promise<Sport> {
        return this.game.getSport(sportId);
    }


    getAllSports(): Promise<Sport[]> {
        return this.game.getAllSports();
    }

    getPossibleSports(): Promise<string[]> {
        return this.game.getPossibleSports();
    }

    getPossibleSkillLevels(): Promise<string[]> {
        return this.game.getPossibleSkillLevels();
    }

    //location
    getLocationById(locationId: number): Promise<Location> {
        return this.location.getLocationById(locationId);
    }

    //group
    getUserGroups(userId: number): Promise<Group[]> {
        return this.group.getUserGroups(userId);
    }

    getLastGroupMessage(groupId: number): Promise<GroupMessage | null> {
        return this.group.getLastGroupMessage(groupId);
    }

    getGroupMessages(groupId: number): Promise<GroupMessage[]> {
        return this.group.getGroupMessages(groupId);
    }

    getGroupMembers(groupId: number): Promise<User[]> {
        return this.group.getGroupMembers(groupId);
    }

    sendGroupMessage(groupId: number, content: string): Promise<GroupMessage> {
        return this.group.sendGroupMessage(groupId, content);
    }

    getGroupUnreadStatus(groupId: number): Promise<boolean> {
        return this.group.getGroupUnreadStatus(groupId);
    }

    getLastReadMessageId(groupId: number): Promise<number | null> {
        return this.group.getLastReadMessageId(groupId);
    }

    lastMessageRead(groupId: number, lastReadMessageId?: number | null): Promise<void> {
        return this.group.lastMessageRead(groupId, lastReadMessageId);
    }
}