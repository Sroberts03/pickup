import User from "@/objects/User";
import Group from "@/objects/Group";
import GroupMessage from "@/objects/GroupMessage";
import { Game, GameStatus, SkillLevel } from "@/objects/Game";
import Location from "@/objects/Location";
import Sport from "@/objects/Sport";

/**
 * Centralized mock data store shared across all test facades
 */
export class MockDataStore {
    users = new Map<number, User>();
    sessions = new Map<number, string>();
    currentUserId: number | null = null;
    groups = new Map<number, Group>();
    groupMessages = new Map<number, GroupMessage>();
    groupLastRead = new Map<number, Map<number, number>>();
    sports = new Map<number, Sport>();
    skillLevels = new Map<number, string>();
    games = new Map<number, Game>();
    locations = new Map<number, Location>();
    userFavoriteSports = new Map<number, Set<number>>();
    userGames = new Map<number, Set<number>>();
    userGroups = new Map<number, Set<number>>();

    constructor() {
        this.initializeTestData();
    }

    private initializeTestData() {
        const currentYear = new Date().getFullYear();
        
        // Users
        this.users.set(1, new User(1, "Test", "User", "test-user@example.com", currentYear - 2));
        this.users.set(2, new User(2, "Jane", "Doe", "jane.doe@example.com", currentYear - 1));

        // Groups
        this.groups.set(1, new Group(1, "Morning Joggers", "Group for early morning jogs", 1, new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)));
        this.groups.set(2, new Group(2, "Evening Cyclists", "Group for evening cycling sessions", 2, new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)));
        this.groups.set(3, new Group(3, "Weekend Hikers", "Group for weekend hiking adventures", 1, new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)));
        this.groups.set(4, new Group(4, "City Runners", "Group for urban running enthusiasts", 2, new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)));

        // Group Messages
        this.groupMessages.set(1, new GroupMessage(1, 1, 1, "Welcome to the Morning Joggers group!", new Date()));
        this.groupMessages.set(2, new GroupMessage(2, 2, 2, "Don't forget our ride tomorrow!", new Date()));
        this.groupMessages.set(3, new GroupMessage(3, 3, 1, "Who's up for a hike this weekend?", new Date()));
        this.groupMessages.set(4, new GroupMessage(4, 1, 2, "Let's plan a city run for next week!", new Date()));

        // Sports
        this.sports.set(1, new Sport(1, "Soccer"));
        this.sports.set(2, new Sport(2, "Basketball"));
        this.sports.set(3, new Sport(3, "Football"));

        // Locations
        this.locations.set(1, new Location(1, "Central Park", "New York, NY", 40.785091, -73.968285));
        this.locations.set(2, new Location(2, "Golden Gate Park", "San Francisco, CA", 37.769420, -122.486214));

        // Games
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
            "Normal football rules apply"
        ));

        // User Relationships
        this.userFavoriteSports.set(1, new Set([1, 2]));
        this.userFavoriteSports.set(2, new Set([2, 3]));

        this.userGames.set(1, new Set([1]));
        this.userGames.set(2, new Set([2]));

        this.userGroups.set(1, new Set([1, 4]));
        this.userGroups.set(2, new Set([1, 2, 4]));

        // Skill Levels
        this.skillLevels.set(1, "Beginner");
        this.skillLevels.set(2, "Intermediate");
        this.skillLevels.set(3, "Advanced");
        this.skillLevels.set(4, "Expert");
    }
}
