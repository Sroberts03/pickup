import User from "@/objects/User";
import Sport from "@/objects/Sport";
import { GameWithDetails } from "@/objects/Game";
import UserFacade from "../UserFacade";
import { MockDataStore } from "./MockDataStore";

export default class TestUserFacade implements UserFacade {
    constructor(private dataStore: MockDataStore) {}

    async getUser(userId: number): Promise<User | undefined> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(this.dataStore.users.get(userId));
            }, 500);
        });
    }

    async getCreatorInfo(userId: number): Promise<{id: number, firstName: string}> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const user = this.dataStore.users.get(userId);
                if (user) {
                    resolve({ id: user.id, firstName: user.firstName });
                } else {
                    reject(new Error("User not found"));
                }
            }, 500);
        });
    }

    async updateUser(userId: number, userData: Partial<{
        firstName: string;
        lastName: string;
        email: string;
        password: string;
    }>): Promise<User> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const user = this.dataStore.users.get(userId);
                if (!user) {
                    reject(new Error('User not found'));
                    return;
                }

                if (userData.firstName !== undefined) user.firstName = userData.firstName;
                if (userData.lastName !== undefined) user.lastName = userData.lastName;
                if (userData.email !== undefined) user.email = userData.email;

                this.dataStore.users.set(userId, user);
                resolve(user);
            }, 500);
        });
    }

    async searchUsers(query: string): Promise<User[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const lowerQuery = query.toLowerCase();
                const allUsers = Array.from(this.dataStore.users.values());

                const filteredUsers = allUsers.filter(user => {
                    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
                    return fullName.includes(lowerQuery) ||
                        user.email.toLowerCase().includes(lowerQuery);
                });

                resolve(filteredUsers);
            }, 500);
        });
    }

    async reportUser(userId: number, reason: string): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`User ${userId} reported for: ${reason}`);
                resolve();
            }, 500);
        });
    }

    async getFavouriteSports(userId: number): Promise<Sport[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const sports = this.dataStore.userFavoriteSports.get(userId);
                if (sports) {
                    resolve(Array.from(sports).map(id => this.dataStore.sports.get(id)).filter((sport): sport is Sport => sport !== undefined));
                } else {
                    resolve([]);
                }
            }, 500);
        });
    }

    async updateFavouriteSports(userId: number, sportIds: number[]): Promise<Sport[]> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const user = this.dataStore.users.get(userId);
                if (!user) {
                    reject(new Error("User not found"));
                    return;
                }

                const validIds = sportIds.filter((id) => this.dataStore.sports.has(id));
                this.dataStore.userFavoriteSports.set(userId, new Set(validIds));

                const updatedSports = validIds
                    .map((id) => this.dataStore.sports.get(id))
                    .filter((sport): sport is Sport => sport !== undefined);

                resolve(updatedSports);
            }, 500);
        });
    }

    async getUserGames(userId: number): Promise<GameWithDetails[]> {
        return new Promise(async (resolve) => {
            setTimeout(async () => {
                const userGameIds = this.dataStore.userGames.get(userId);
                if (!userGameIds) {
                    resolve([]);
                    return;
                }

                const twoDaysAgo = new Date();
                twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
                twoDaysAgo.setHours(0, 0, 0, 0);

                const userGames = Array.from(userGameIds)
                    .map(gameId => this.dataStore.games.get(gameId))
                    .filter((game): game is import("@/objects/Game").Game => game !== undefined)
                    .filter(game => new Date(game.startTime) >= twoDaysAgo);

                const gamesWithDetails = await Promise.all(
                    userGames.map(async (game) => {
                        const sport = this.dataStore.sports.get(game.sportId);
                        const currentPlayers = Array.from(this.dataStore.userGames.values()).filter(gamesSet => gamesSet.has(game.id)).length;

                        return {
                            ...game,
                            sportName: sport?.name || "Unknown",
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
                const gamesPlayed = this.dataStore.userGames.get(userId)?.size || 0;
                const gamesOrganized = Array.from(this.dataStore.games.values()).filter(g => g.creatorId === userId).length;
                
                resolve({ gamesPlayed, gamesOrganized });
            }, 500);
        });
    }
}
