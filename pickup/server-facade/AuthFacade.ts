import User from "@/objects/User";

export default interface AuthFacade {
    getCurrentUser(): Promise<{ token: string, user: User } | null>;
    login(email: string, password: string): Promise<{ token: string, user: User }>;
    signup(email: string, password: string, firstName: string, lastName: string): Promise<{ token: string, user: User }>;
    logout(): Promise<void>;
}