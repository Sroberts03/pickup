import User from "@/objects/User";
export default interface ServerFacade {
    login(email: string, password: string): Promise<{ token: string, user: User }>;
    signup(email: string, password: string, firstName: string, lastName: string, profilePicUrl: string): Promise<{ token: string, user: User }>;
    logout(): Promise<void>;
}