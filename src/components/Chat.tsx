'use client';

import { useState, useRef, useEffect } from 'react';
import { configureMetaAdMcp, configureSlackMcp, configureGDriveMcp, callMcpTool } from '@/utils/mcp';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

type SessionData = {
  id: string;
  user_id: string;
  session_uuid: string;
  mcp_runner_url: string;
  status: string;
  created_at: string;
  updated_at: string;
};

type SessionResponse = {
  success: boolean;
  sessions: SessionData[];
};

type ToolParams = {
  query: string;
  userId?: string;
};

type ToolResponse = {
  response?: string;
  [key: string]: any;
};

type ChatProps = {
  sessionId?: string;
  userId: string;
  onCreateSession: () => Promise<string>;
}

export default function Chat({ sessionId: initialSessionId, userId, onCreateSession }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I\'m your AdSora assistant. I can help you create and launch ad campaigns on Meta. What would you like to do today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(initialSessionId);
  const [runnerUrl, setRunnerUrl] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Scroll to bottom whenever messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  useEffect(() => {
    // If no sessionId is provided, create one
    const initSession = async () => {
      if (!sessionId) {
        setIsLoading(true);
        try {
          const newSessionId = await onCreateSession();
          setSessionId(newSessionId);
          
          // Fetch the session details to get the runner URL
          const response = await fetch(`/api/agent-sessions?userId=${userId}`);
          const data = await response.json() as SessionResponse;
          
          if (data.success && data.sessions.length > 0) {
            // Find the session we just created
            const session = data.sessions.find((s) => s.id === newSessionId);
            if (session) {
              setRunnerUrl(session.mcp_runner_url);
            }
          }
        } catch (error) {
          console.error('Failed to create session:', error);
          addMessage('assistant', 'I\'m having trouble connecting. Please try again later.');
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    initSession();
  }, [sessionId, userId, onCreateSession]);
  
  useEffect(() => {
    // Configure MCP servers when runner URL is available
    const configureMcpServers = async () => {
      if (runnerUrl && !isConfigured) {
        setIsLoading(true);
        try {
          // Configure Meta Ads MCP
          await configureMetaAdMcp(runnerUrl);
          
          // Configure Slack MCP
          await configureSlackMcp(runnerUrl);
          
          // Configure Google Drive MCP
          await configureGDriveMcp(runnerUrl);
          
          setIsConfigured(true);
          addMessage('assistant', 'I\'m now ready to help you with Meta ads, Slack integration, and file uploads from Google Drive.');
        } catch (error) {
          console.error('Error configuring MCP servers:', error);
          addMessage('assistant', 'I\'m having trouble setting up some of my capabilities. I\'ll do my best with what\'s available.');
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    configureMcpServers();
  }, [runnerUrl, isConfigured]);
  
  const addMessage = (role: 'user' | 'assistant', content: string) => {
    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      role,
      content,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !runnerUrl || !isConfigured) return;
    
    const userInput = input.trim();
    setInput('');
    addMessage('user', userInput);
    setIsLoading(true);
    
    try {
      // Based on the user input, decide which tool to call
      // This is a simplistic approach for the MVP - in a real implementation
      // you would use more sophisticated NLP to route to the correct tool
      let toolName = 'default_conversation';
      let params: ToolParams = { query: userInput };
      
      if (userInput.toLowerCase().includes('ad') || 
          userInput.toLowerCase().includes('campaign') || 
          userInput.toLowerCase().includes('meta')) {
        toolName = 'meta_ad_interaction';
        params = { 
          query: userInput,
          userId: userId
        };
      } else if (userInput.toLowerCase().includes('slack')) {
        toolName = 'slack_interaction';
        params = { 
          query: userInput,
          userId: userId
        };
      } else if (userInput.toLowerCase().includes('drive') || 
                userInput.toLowerCase().includes('file') || 
                userInput.toLowerCase().includes('upload')) {
        toolName = 'gdrive_interaction';
        params = { 
          query: userInput,
          userId: userId
        };
      }
      
      // Call the selected tool using our utility function
      const data = await callMcpTool(runnerUrl, toolName, params) as ToolResponse;
      
      // Add the assistant's response
      addMessage('assistant', data.response || 'I\'m having trouble processing your request right now.');
      
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage('assistant', 'Sorry, I encountered an error while processing your request.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-lg overflow-hidden shadow-lg">
      <div className="bg-blue-600 text-white p-4">
        <h2 className="text-xl font-semibold">AdSora AI Agent</h2>
        <p className="text-sm opacity-80">Powered by MCP</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading || !runnerUrl || !isConfigured}
            placeholder={
              !runnerUrl 
                ? "Connecting to AI agent..." 
                : !isConfigured
                  ? "Configuring AI capabilities..."
                  : isLoading 
                    ? "Processing..." 
                    : "Type your message here..."
            }
            className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim() || !runnerUrl || !isConfigured}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Sending..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
} 