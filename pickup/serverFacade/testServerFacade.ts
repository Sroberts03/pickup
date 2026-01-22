import User from "@/objects/User";
import ServerFacade from "./serverFacade";
import Group from "@/objects/Group";
import GroupMessage from "@/objects/GroupMessage";
import { Game, GameStatus, SkillLevel, GameFilter } from "@/objects/Game";
import Achievement from "@/objects/Achievement";
import Location from "@/objects/Location";
import Sport from "@/objects/Sport";



export default class TestServerFacade implements ServerFacade {
    users = new Map<number, User>();
    sessions = new Map<number, string>();
    currentUserId: number | null = null;
    groups = new Map<number, Group>();
    groupMessages = new Map<number, GroupMessage>();
    sports = new Map<number, Sport>();
    skillLevels = new Map<number, string>();
    games = new Map<number, Game>();
    achievements = new Map<number, Achievement>();
    locations = new Map<number, Location>();
    userFavoriteSports = new Map<number, Set<number>>();
    userGames = new Map<number, Set<number>>();
    userAchievements = new Map<number, Set<number>>();
    userGroups = new Map<number, Set<number>>();

    constructor() {
        this.users.set(1, new User(1, "Test", "User", "test-user@example.com", true, null));
        this.users.set(2, new User(2, "Jane", "Doe", "jane.doe@example.com", true, null));

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

        this.achievements.set(1, new Achievement(1, "First Game", "Created your first game", "icon1.png"));
        this.achievements.set(2, new Achievement(2, "Social Butterfly", "Joined 5 groups", "icon2.png"));

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
            true
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
            false
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
            true
        ));

        this.userFavoriteSports.set(1, new Set([1, 2]));
        this.userFavoriteSports.set(2, new Set([2, 3]));

        this.userGames.set(1, new Set([1]));
        this.userGames.set(2, new Set([2]));

        this.userAchievements.set(1, new Set([1]));
        this.userAchievements.set(2, new Set([2]));

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
        console.log(this.users)
        console.log("Logging in user:", email);
        console.log("Found user:", user);
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

    async signup(email: string, password: string, firstName: string, lastName: string, profilePicUrl: string): Promise<{ token: string, user: User }> {
        const newUser = new User(
            this.users.size + 1,
            email,
            firstName,
            lastName,
            true,
            profilePicUrl || null
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
                let games = Array.from(this.games.values());
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

                resolve(games);
            }, 500);
        });
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
}