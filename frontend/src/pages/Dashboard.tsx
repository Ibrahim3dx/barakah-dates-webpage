import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
        queryKey: ['dashboardStats'],
        queryFn: async () => {
            try {
                const response = await api.get('/api/dashboard/stats');
                return response.data;
            } catch (error: any) {
                if (error.response?.status === 401) {
                    navigate('/login');
                }
                throw error;
            }
        },
        enabled: !!user,
    });

    const { data: revenue, isLoading: revenueLoading, error: revenueError } = useQuery({
        queryKey: ['dashboardRevenue'],
        queryFn: async () => {
            try {
                const response = await api.get('/api/dashboard/revenue');
                return response.data;
            } catch (error: any) {
                if (error.response?.status === 401) {
                    navigate('/login');
                }
                throw error;
            }
        },
        enabled: !!user,
    });

    if (!user) {
        navigate('/login');
        return null;
    }

    if (statsLoading || revenueLoading) {
        return <div>Loading...</div>;
    }

    if (statsError || revenueError) {
        return <div>Error loading dashboard data</div>;
    }

    return (
        <div>
            <h1>Dashboard</h1>
            <div>
                <h2>Stats</h2>
                <pre>{JSON.stringify(stats, null, 2)}</pre>
            </div>
            <div>
                <h2>Revenue</h2>
                <pre>{JSON.stringify(revenue, null, 2)}</pre>
            </div>
        </div>
    );
};

export default Dashboard; 