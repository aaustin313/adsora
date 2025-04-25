'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import Chat from '@/components/Chat';
import Campaign from '@/components/Campaign';

type User = {
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
};

type UserResponse = {
  success: boolean;
  user: User;
  message?: string;
};

type UsersResponse = {
  success: boolean;
  users: User[];
};

type AgentSessionResponse = {
  success: boolean;
  session: {
    id: string;
    user_id: string;
    session_uuid: string;
    mcp_runner_url: string;
    status: string;
    created_at: string;
    updated_at: string;
  };
  message?: string;
};

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'campaign'>('chat');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !userName) return;
    
    setIsLoading(true);
    
    try {
      // Create a user
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          name: userName
        })
      });
      
      const data = await response.json() as UserResponse;
      
      if (data.success) {
        setUserId(data.user.id);
      } else {
        // If user already exists, try to fetch the user
        const usersResponse = await fetch('/api/users');
        const usersData = await usersResponse.json() as UsersResponse;
        
        if (usersData.success && usersData.users.length > 0) {
          // Find a user with matching email
          const existingUser = usersData.users.find((user) => user.email === email);
          
          if (existingUser) {
            setUserId(existingUser.id);
            setUserName(existingUser.name);
          }
        }
      }
    } catch (error) {
      console.error('Error during login:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const createAgentSession = useCallback(async () => {
    if (!userId) return '';
    
    try {
      const response = await fetch('/api/agent-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId
        })
      });
      
      const data = await response.json() as AgentSessionResponse;
      
      if (data.success) {
        return data.session.id;
      } else {
        throw new Error('Failed to create agent session');
      }
    } catch (error) {
      console.error('Error creating agent session:', error);
      return '';
    }
  }, [userId]);
  
  return (
    <main className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="bg-blue-700 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold">AdSora</h1>
            <span className="text-xs bg-blue-500 px-2 py-1 rounded">MVP</span>
          </div>
          
          {userId && (
            <div className="text-sm">
              Logged in as <span className="font-semibold">{userName}</span>
            </div>
          )}
        </div>
      </header>
      
      {/* Content */}
      <div className="flex-1 container mx-auto p-4">
        {!userId ? (
          <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
            <div className="flex justify-center mb-6">
              <Image
                src="/next.svg"
                alt="AdSora Logo"
                width={120}
                height={40}
                className="dark:invert"
                priority
              />
            </div>
            
            <h2 className="text-2xl font-semibold mb-6 text-center">Log in to AdSora</h2>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                />
              </div>
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                />
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? 'Loading...' : 'Continue'}
              </button>
            </form>
          </div>
        ) : (
          <div className="mt-6">
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-4">
              <nav className="flex space-x-8" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`${
                    activeTab === 'chat'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  AI Assistant
                </button>
                <button
                  onClick={() => setActiveTab('campaign')}
                  className={`${
                    activeTab === 'campaign'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Campaign Management
                </button>
              </nav>
            </div>
            
            {/* Tab content */}
            <div className="mt-4">
              {activeTab === 'chat' && (
                <div className="h-[600px]">
                  <Chat 
                    userId={userId} 
                    onCreateSession={createAgentSession} 
                  />
                </div>
              )}
              
              {activeTab === 'campaign' && (
                <Campaign userId={userId} />
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 py-4">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} AdSora - AI-powered ad management
        </div>
      </footer>
    </main>
  );
}
