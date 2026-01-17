import ServerFacade from "./serverFacade";

export default class TestServerFacade implements ServerFacade {
    async Login({username, password}: {username: string, password: string}): Promise<{ token: string, userId: string }> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ token: "test-token", userId: "test-user-id" });
            }, 500);
        });
    }
}