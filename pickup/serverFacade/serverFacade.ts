export default interface ServerFacade {
    Login({username, password}: {username: string, password: string}): Promise<{ token: string, userId: string }>;
}