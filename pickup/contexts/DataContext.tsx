
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useServer } from './ServerContext';
import { useAuth } from './AuthContext';
import { GameWithDetails, GameFilter } from '@/objects/Game';
import Sport from '@/objects/Sport';

interface UserStats {
    gamesPlayed: number;
    gamesOrganized: number;
}

interface DataContextType {
    userGames: GameWithDetails[];
    favoriteSports: Sport[];
    userStats: UserStats | null;
    loading: boolean;
    refreshData: () => Promise<void>;
    sharedFilters: GameFilter | null;
    setSharedFilters: (filters: GameFilter | null) => void;
}

const DataContext = createContext<DataContextType | null>(null);

export function useData() {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
}

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const server = useServer();
    const { user } = useAuth();
    
    const [userGames, setUserGames] = useState<GameWithDetails[]>([]);
    const [favoriteSports, setFavoriteSports] = useState<Sport[]>([]);
    const [userStats, setUserStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [sharedFilters, setSharedFilters] = useState<GameFilter | null>(null);

    const refreshData = useCallback(async () => {
        if (!user) {
            setUserGames([]);
            setFavoriteSports([]);
            setUserStats(null);
            return;
        }

        // Don't set global loading to true for background refreshes if we already have data
        // This prevents the UI from flashing a spinner on every small update
        // We only set loading if we have NO data yet.
        const isFirstLoad = userGames.length === 0 && !userStats;
        if (isFirstLoad) setLoading(true);

        try {
            const [games, sports, stats] = await Promise.all([
                server.getUserGames(user.id),
                server.getFavouriteSports(user.id),
                server.getUserStats(user.id)
            ]);
            
            setUserGames(games);
            setFavoriteSports(sports);
            setUserStats(stats);
        } catch (error) {
            console.error("Failed to refresh user data:", error);
        } finally {
            if (isFirstLoad) setLoading(false);
        }
    }, [user, userGames.length, userStats, server]);

    // Initial load when user changes
    useEffect(() => {
        refreshData();
    }, [refreshData]);

    return (
        <DataContext.Provider value={{ userGames, favoriteSports, userStats, loading, refreshData, sharedFilters, setSharedFilters }}>
            {children}
        </DataContext.Provider>
    );
};
