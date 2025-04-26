'use client';

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import SlackApiSettings from '@/components/SlackApiSettings';

export default function Home() {
  const [userId] = useState('user_1745622288134_obwfjjg');
  const [activeTab, setActiveTab] = useState<'home' | 'settings'>('home');
  const [slackStatus, setSlackStatus] = useState<{
    connected: boolean;
    error?: string;
    debug?: boolean;
  }>({ connected: false });
  
  useEffect(() => {
    // Check URL parameters for Slack connection status
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.get('slack_connected') === 'true') {
      setSlackStatus({ 
        connected: true,
        debug: urlParams.get('debug') === 'true'
      });
      // Move to the settings tab to show the success message
      setActiveTab('settings');
    } else if (urlParams.get('error')) {
      setSlackStatus({
        connected: false,
        error: urlParams.get('error') || 'Unknown error'
      });
      // Move to the settings tab to show the error
      setActiveTab('settings');
    }
  }, []);

  return (
    <main className="flex min-h-screen flex-col bg-white text-gray-900">
      {/* Header */}
      <header className="bg-blue-700 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-white">AdSora</h1>
            <span className="text-xs bg-blue-500 px-2 py-1 rounded text-white">MVP</span>
          </div>
          
          <nav className="space-x-4">
            <button 
              onClick={() => setActiveTab('home')}
              className={`hover:underline text-white ${activeTab === 'home' ? 'underline font-bold' : ''}`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`hover:underline text-white ${activeTab === 'settings' ? 'underline font-bold' : ''}`}
            >
              Settings
            </button>
          </nav>
        </div>
      </header>

      {/* Debug Banner for Slack Integration */}
      {slackStatus.connected && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4" role="alert">
          <div className="flex">
            <div className="py-1">
              <svg className="h-6 w-6 text-green-500 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-bold">Slack Integration Successful!</p>
              <p className="text-sm">Your Slack workspace has been successfully connected to AdSora.</p>
              {slackStatus.debug && (
                <p className="text-xs mt-1">Debug mode: Connection verified with authorization flow.</p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {slackStatus.error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
          <div className="flex">
            <div className="py-1">
              <svg className="h-6 w-6 text-red-500 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <p className="font-bold">Slack Integration Error</p>
              <p className="text-sm">Error: {slackStatus.error}</p>
              <p className="text-xs mt-1">Please check your Slack app configuration and try again.</p>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto p-6">
        {activeTab === 'home' && (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-4 text-gray-900">Welcome to AdSora</h2>
              <p className="text-gray-600">
                Your AI-powered advertising management platform
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div className="bg-white shadow-md rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Database Connection</h3>
                <p className="text-gray-600 mb-4">
                  Test connection to the D1 database
                </p>
                <Link 
                  href="/api/db-test" 
                  target="_blank"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Test Database
                </Link>
              </div>

              <div className="bg-white shadow-md rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Slack Integration</h3>
                <p className="text-gray-600 mb-4">
                  Configure your Slack integration settings
                </p>
                <button 
                  onClick={() => setActiveTab('settings')}
                  className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
                >
                  Go to Settings
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white shadow-md rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Users</h3>
                <p className="text-gray-600 mb-4">
                  View and manage users
                </p>
                <Link 
                  href={`/api/users?userId=${userId}`}
                  target="_blank" 
                  className="text-blue-600 hover:text-blue-800"
                >
                  View Users API
                </Link>
              </div>
            </div>
          </>
        )}

        {activeTab === 'settings' && (
          <div>
            <h1 className="text-3xl font-bold mb-8 text-gray-900">Settings</h1>
            <SlackApiSettings userId={userId} />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 py-4 mt-auto">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} AdSora - AI-powered ad management
        </div>
      </footer>
    </main>
  );
}
