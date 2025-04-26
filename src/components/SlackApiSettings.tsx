'use client';

import { useState, useEffect } from 'react';

interface SlackApiSettings {
  appId: string;
  clientId: string;
  installUrl: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  settings?: SlackApiSettings;
}

interface SlackApiSettingsProps {
  userId: string;
}

export default function SlackApiSettings({ userId }: SlackApiSettingsProps) {
  const [settings, setSettings] = useState<SlackApiSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    // Check if we have a successful Slack connection from URL params
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('slack_connected') === 'true') {
      setIsConnected(true);
    }
    
    async function fetchSettings() {
      try {
        const response = await fetch(`/api/slack/settings?userId=${userId}`);
        const data = await response.json() as ApiResponse;
        
        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch settings');
        }
        
        if (data.settings) {
          setSettings(data.settings);
        } else {
          // Fallback to static data if API doesn't return settings
          setSettings({
            appId: 'A08PW7NLAHG',
            clientId: '5511322808822.8812260690594',
            installUrl: `https://slack.com/oauth/v2/authorize?client_id=5511322808822.8812260690594&scope=channels:read,chat:write&user_scope=`
          });
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching settings:', err);
        setError('Failed to load Slack API settings');
        // Fallback to static data
        setSettings({
          appId: 'A08PW7NLAHG',
          clientId: '5511322808822.8812260690594',
          installUrl: `https://slack.com/oauth/v2/authorize?client_id=5511322808822.8812260690594&scope=channels:read,chat:write&user_scope=`
        });
        setLoading(false);
      }
    }
    
    fetchSettings();
  }, [userId]);

  // Build the Slack authorization URL
  const getAuthUrl = () => {
    if (!settings) return '#';
    
    // Always use the production URL
    const redirectUri = 'https://adsora.adsora.workers.dev/api/slack/oauth/callback';
    
    const scopes = [
      'channels:read',
      'chat:write',
      'files:read'
    ].join(',');
    
    return `https://slack.com/oauth/v2/authorize?client_id=${settings.clientId}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Slack Integration</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {isConnected && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Slack workspace successfully connected!
        </div>
      )}
      
      {loading ? (
        <div className="animate-pulse text-gray-800">Loading settings...</div>
      ) : settings ? (
        <div className="space-y-6">          
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">Connect Slack Workspace</h3>
            <p className="text-sm text-gray-600 mb-4">
              Connect your Slack workspace to AdSora to integrate with Slack channels and manage messaging.
            </p>
            <p className="text-sm text-gray-600 mb-6">
              After connecting, you&apos;ll be able to:
            </p>
            <ul className="list-disc pl-5 mb-6 text-sm text-gray-600 space-y-1">
              <li>Send messages from AdSora to Slack channels</li>
              <li>Configure campaigns based on Slack channel activity</li>
              <li>Receive notifications in Slack about AdSora events</li>
            </ul>
            <a 
              href={getAuthUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-purple-600 text-white font-bold py-2 px-4 rounded hover:bg-purple-700"
            >
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 15c-.83 0-1.5-.67-1.5-1.5v-3c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v3c0 .83-.67 1.5-1.5 1.5z" />
                  <path d="M12 15c-.83 0-1.5-.67-1.5-1.5v-3c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v3c0 .83-.67 1.5-1.5 1.5z" />
                  <path d="M18 15c-.83 0-1.5-.67-1.5-1.5v-3c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v3c0 .83-.67 1.5-1.5 1.5z" />
                </svg>
                Add to Slack
              </span>
            </a>
          </div>
        </div>
      ) : (
        <div className="text-gray-700">No Slack API settings found.</div>
      )}
    </div>
  );
} 