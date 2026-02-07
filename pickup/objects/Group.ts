export default class Group {
    id: number;
    name: string;
    description: string;
    gameId: number;
    createdAt: Date;
    expiresAt: Date;
    

    constructor(
        id: number,
        name: string,
        description: string,
        gameId: number,
        createdAt: Date,
        expiresAt: Date
    ) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.gameId = gameId;
        this.createdAt = createdAt;
        this.expiresAt = expiresAt;
    }
}