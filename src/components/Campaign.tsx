'use client';

import { useState, useEffect, useCallback } from 'react';
import { isDevelopmentMode } from '@/utils/dev-utils';

type Campaign = {
  id: string;
  user_id: string;
  name: string;
  meta_campaign_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

type AdSet = {
  id: string;
  campaign_id: string;
  name: string;
  budget: number | null;
  start_date: string | null;
  end_date: string | null;
  targeting_data: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

type AdCreative = {
  id: string;
  adset_id: string;
  name: string;
  drive_file_id: string | null;
  file_url: string | null;
  headline: string | null;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

type CampaignsResponse = {
  success: boolean;
  campaigns: Campaign[];
};

type CampaignResponse = {
  success: boolean;
  campaign: Campaign;
  message?: string;
};

type AdSetResponse = {
  success: boolean;
  adSet: AdSet;
  message?: string;
};

type AdCreativeResponse = {
  success: boolean;
  adCreative: AdCreative;
  message?: string;
};

type CampaignProps = {
  userId: string;
};

export default function Campaign({ userId }: CampaignProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [selectedAdSet, setSelectedAdSet] = useState<AdSet | null>(null);
  const [adSets, setAdSets] = useState<AdSet[]>([]);
  const [adCreatives, setAdCreatives] = useState<AdCreative[]>([]);
  const [activeView, setActiveView] = useState<'campaigns' | 'adsets' | 'creatives'>('campaigns');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    metaCampaignId: ''
  });
  const [adSetFormData, setAdSetFormData] = useState({
    name: '',
    budget: '',
    startDate: '',
    endDate: '',
    targetingData: ''
  });
  const [creativeFormData, setCreativeFormData] = useState({
    name: '',
    headline: '',
    description: '',
    fileUrl: ''
  });
  
  // Define fetchCampaigns with useCallback to avoid dependency issues
  const fetchCampaigns = useCallback(async () => {
    try {
      setIsLoading(true);
      
      if (isDevelopmentMode()) {
        // Mock campaigns in development mode
        const mockCampaigns = [
          {
            id: 'campaign_1',
            user_id: userId,
            name: 'Summer Sale 2023',
            meta_campaign_id: null,
            status: 'draft',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'campaign_2',
            user_id: userId,
            name: 'New Product Launch',
            meta_campaign_id: null,
            status: 'draft',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        setCampaigns(mockCampaigns);
        setIsLoading(false);
        return;
      }
      
      const response = await fetch(`/api/campaigns?userId=${userId}`);
      const data = await response.json() as CampaignsResponse;
      if (data.success) {
        setCampaigns(data.campaigns);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);
  
  // Fetch campaigns on component mount
  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAdSetFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAdSetFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCreativeFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCreativeFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    
    try {
      setIsLoading(true);
      
      if (isDevelopmentMode()) {
        // Mock campaign creation in development mode
        const mockCampaign = {
          id: `campaign_${Date.now()}`,
          user_id: userId,
          name: formData.name,
          meta_campaign_id: formData.metaCampaignId || null,
          status: 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setCampaigns(prev => [...prev, mockCampaign]);
        setFormData({ name: '', metaCampaignId: '' });
        setIsLoading(false);
        return;
      }
      
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          name: formData.name,
          metaCampaignId: formData.metaCampaignId || null
        })
      });
      
      const data = await response.json() as CampaignResponse;
      if (data.success) {
        // Reset form and refresh campaigns
        setFormData({ name: '', metaCampaignId: '' });
        fetchCampaigns();
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCreateAdSet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adSetFormData.name || !selectedCampaign) return;
    
    try {
      setIsLoading(true);
      
      if (isDevelopmentMode()) {
        // Mock ad set creation in development mode
        const mockAdSet = {
          id: `adset_${Date.now()}`,
          campaign_id: selectedCampaign.id,
          name: adSetFormData.name,
          budget: adSetFormData.budget ? parseFloat(adSetFormData.budget) : null,
          start_date: adSetFormData.startDate || null,
          end_date: adSetFormData.endDate || null,
          targeting_data: adSetFormData.targetingData || null,
          status: 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setAdSets(prev => [...prev, mockAdSet]);
        setAdSetFormData({
          name: '',
          budget: '',
          startDate: '',
          endDate: '',
          targetingData: ''
        });
        setIsLoading(false);
        return;
      }
      
      const response = await fetch('/api/ad-sets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          campaignId: selectedCampaign.id,
          name: adSetFormData.name,
          budget: adSetFormData.budget ? parseFloat(adSetFormData.budget) : null,
          startDate: adSetFormData.startDate || null,
          endDate: adSetFormData.endDate || null,
          targetingData: adSetFormData.targetingData ? JSON.parse(adSetFormData.targetingData) : null
        })
      });
      
      const data = await response.json() as AdSetResponse;
      if (data.success) {
        // Reset form
        setAdSetFormData({
          name: '',
          budget: '',
          startDate: '',
          endDate: '',
          targetingData: ''
        });
        
        // Add the new ad set to the list
        setAdSets(prev => [...prev, data.adSet]);
      }
    } catch (error) {
      console.error('Error creating ad set:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCreateCreative = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creativeFormData.name || !selectedAdSet) return;
    
    try {
      setIsLoading(true);
      
      if (isDevelopmentMode()) {
        // Mock creative creation in development mode
        const mockCreative = {
          id: `creative_${Date.now()}`,
          adset_id: selectedAdSet.id,
          name: creativeFormData.name,
          drive_file_id: null,
          file_url: creativeFormData.fileUrl || null,
          headline: creativeFormData.headline || null,
          description: creativeFormData.description || null,
          status: 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setAdCreatives(prev => [...prev, mockCreative]);
        setCreativeFormData({
          name: '',
          headline: '',
          description: '',
          fileUrl: ''
        });
        setIsLoading(false);
        return;
      }
      
      const response = await fetch('/api/ad-creatives', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          adsetId: selectedAdSet.id,
          name: creativeFormData.name,
          fileUrl: creativeFormData.fileUrl || null,
          headline: creativeFormData.headline || null,
          description: creativeFormData.description || null
        })
      });
      
      const data = await response.json() as AdCreativeResponse;
      if (data.success) {
        // Reset form
        setCreativeFormData({
          name: '',
          headline: '',
          description: '',
          fileUrl: ''
        });
        
        // Add the new creative to the list
        setAdCreatives(prev => [...prev, data.adCreative]);
      }
    } catch (error) {
      console.error('Error creating ad creative:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSelectCampaign = async (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setActiveView('adsets');
    
    // In a full implementation, you would fetch ad sets for this campaign
    if (isDevelopmentMode()) {
      // Create mock ad sets for development mode
      const mockAdSets = [
        {
          id: `adset_1_${campaign.id}`,
          campaign_id: campaign.id,
          name: 'Young Adults',
          budget: 50.0,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          targeting_data: '{"age_min": 18, "age_max": 35}',
          status: 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: `adset_2_${campaign.id}`,
          campaign_id: campaign.id,
          name: 'Parents',
          budget: 75.0,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          targeting_data: '{"interests": ["parenting", "family"]}',
          status: 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      setAdSets(mockAdSets);
    }
  };
  
  const handleSelectAdSet = async (adSet: AdSet) => {
    setSelectedAdSet(adSet);
    setActiveView('creatives');
    
    // In a full implementation, you would fetch creatives for this ad set
    if (isDevelopmentMode()) {
      // Create mock creatives for development mode
      const mockCreatives = [
        {
          id: `creative_1_${adSet.id}`,
          adset_id: adSet.id,
          name: 'Summer Sale Banner',
          drive_file_id: null,
          file_url: 'https://example.com/image1.jpg',
          headline: 'Summer Sale 50% Off',
          description: 'Limited time offer on all summer items',
          status: 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      setAdCreatives(mockCreatives);
    }
  };
  
  const goBack = () => {
    if (activeView === 'creatives') {
      setActiveView('adsets');
      setSelectedAdSet(null);
    } else if (activeView === 'adsets') {
      setActiveView('campaigns');
      setSelectedCampaign(null);
    }
  };
  
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      {/* Breadcrumb Navigation */}
      <div className="mb-4 flex items-center text-sm text-gray-500">
        <button 
          onClick={() => setActiveView('campaigns')}
          className={`hover:text-blue-600 ${activeView === 'campaigns' ? 'text-blue-600 font-medium' : ''}`}
        >
          Campaigns
        </button>
        
        {selectedCampaign && (
          <>
            <span className="mx-2">/</span>
            <button 
              onClick={() => setActiveView('adsets')}
              className={`hover:text-blue-600 ${activeView === 'adsets' ? 'text-blue-600 font-medium' : ''}`}
            >
              Ad Sets
            </button>
          </>
        )}
        
        {selectedAdSet && (
          <>
            <span className="mx-2">/</span>
            <button 
              onClick={() => setActiveView('creatives')}
              className={`hover:text-blue-600 ${activeView === 'creatives' ? 'text-blue-600 font-medium' : ''}`}
            >
              Ad Creatives
            </button>
          </>
        )}
        
        {activeView !== 'campaigns' && (
          <button onClick={goBack} className="ml-auto text-blue-600 hover:underline">
            ← Back
          </button>
        )}
      </div>
      
      <h2 className="text-2xl font-bold mb-6">
        {activeView === 'campaigns' && 'Campaign Management'}
        {activeView === 'adsets' && `Ad Sets: ${selectedCampaign?.name}`}
        {activeView === 'creatives' && `Creatives: ${selectedAdSet?.name}`}
      </h2>
      
      {/* Campaign View */}
      {activeView === 'campaigns' && (
        <>
          {/* Create Campaign Form */}
          <div className="mb-8 border-b pb-6">
            <h3 className="text-xl font-semibold mb-4">Create New Campaign</h3>
            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Campaign Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              
              <div>
                <label htmlFor="metaCampaignId" className="block text-sm font-medium text-gray-700">
                  Meta Campaign ID (Optional)
                </label>
                <input
                  type="text"
                  id="metaCampaignId"
                  name="metaCampaignId"
                  value={formData.metaCampaignId}
                  onChange={handleFormChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              
              <button
                type="submit"
                disabled={isLoading || !formData.name}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create Campaign'}
              </button>
            </form>
          </div>
          
          {/* Campaign List */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Your Campaigns</h3>
            {campaigns.length === 0 ? (
              <p className="text-gray-500">No campaigns yet. Create one to get started.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {campaigns.map(campaign => (
                  <div 
                    key={campaign.id} 
                    className="border rounded-md p-4 cursor-pointer transition-all hover:border-blue-500 hover:shadow-md"
                    onClick={() => handleSelectCampaign(campaign)}
                  >
                    <h4 className="font-medium">{campaign.name}</h4>
                    <p className="text-sm text-gray-500">Status: {campaign.status}</p>
                    <p className="text-sm text-gray-500">
                      Created: {new Date(campaign.created_at).toLocaleDateString()}
                    </p>
                    <button className="mt-2 text-sm text-blue-600 hover:underline">
                      Manage Ad Sets →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
      
      {/* Ad Sets View */}
      {activeView === 'adsets' && selectedCampaign && (
        <>
          {/* Create Ad Set Form */}
          <div className="mb-8 border-b pb-6">
            <h3 className="text-xl font-semibold mb-4">Create New Ad Set</h3>
            <form onSubmit={handleCreateAdSet} className="space-y-4">
              <div>
                <label htmlFor="adSetName" className="block text-sm font-medium text-gray-700">
                  Ad Set Name
                </label>
                <input
                  type="text"
                  id="adSetName"
                  name="name"
                  value={adSetFormData.name}
                  onChange={handleAdSetFormChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              
              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
                  Budget (USD)
                </label>
                <input
                  type="number"
                  id="budget"
                  name="budget"
                  value={adSetFormData.budget}
                  onChange={handleAdSetFormChange}
                  placeholder="e.g. 100.00"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={adSetFormData.startDate}
                    onChange={handleAdSetFormChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={adSetFormData.endDate}
                    onChange={handleAdSetFormChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="targetingData" className="block text-sm font-medium text-gray-700">
                  Targeting Data (JSON)
                </label>
                <textarea
                  id="targetingData"
                  name="targetingData"
                  value={adSetFormData.targetingData}
                  onChange={handleAdSetFormChange}
                  rows={4}
                  placeholder='{"age_min": 18, "age_max": 65, "genders": [1,2]}'
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              
              <button
                type="submit"
                disabled={isLoading || !adSetFormData.name}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create Ad Set'}
              </button>
            </form>
          </div>
          
          {/* Ad Set List */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Ad Sets</h3>
            {adSets.length === 0 ? (
              <p className="text-gray-500">No ad sets yet for this campaign.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {adSets.map(adSet => (
                  <div 
                    key={adSet.id} 
                    className="border rounded-md p-4 cursor-pointer transition-all hover:border-green-500 hover:shadow-md"
                    onClick={() => handleSelectAdSet(adSet)}
                  >
                    <h4 className="font-medium">{adSet.name}</h4>
                    <p className="text-sm text-gray-500">Status: {adSet.status}</p>
                    {adSet.budget && (
                      <p className="text-sm text-gray-500">Budget: ${adSet.budget}</p>
                    )}
                    {adSet.start_date && (
                      <p className="text-sm text-gray-500">
                        Scheduled: {new Date(adSet.start_date).toLocaleDateString()} 
                        {adSet.end_date && ` to ${new Date(adSet.end_date).toLocaleDateString()}`}
                      </p>
                    )}
                    <button className="mt-2 text-sm text-green-600 hover:underline">
                      Manage Creatives →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
      
      {/* Creatives View */}
      {activeView === 'creatives' && selectedAdSet && (
        <>
          {/* Create Creative Form */}
          <div className="mb-8 border-b pb-6">
            <h3 className="text-xl font-semibold mb-4">Create New Ad Creative</h3>
            <form onSubmit={handleCreateCreative} className="space-y-4">
              <div>
                <label htmlFor="creativeName" className="block text-sm font-medium text-gray-700">
                  Creative Name
                </label>
                <input
                  type="text"
                  id="creativeName"
                  name="name"
                  value={creativeFormData.name}
                  onChange={handleCreativeFormChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              
              <div>
                <label htmlFor="headline" className="block text-sm font-medium text-gray-700">
                  Headline
                </label>
                <input
                  type="text"
                  id="headline"
                  name="headline"
                  value={creativeFormData.headline}
                  onChange={handleCreativeFormChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={creativeFormData.description}
                  onChange={handleCreativeFormChange}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              
              <div>
                <label htmlFor="fileUrl" className="block text-sm font-medium text-gray-700">
                  Image URL
                </label>
                <input
                  type="text"
                  id="fileUrl"
                  name="fileUrl"
                  value={creativeFormData.fileUrl}
                  onChange={handleCreativeFormChange}
                  placeholder="https://example.com/image.jpg"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              
              <div className="border border-dashed border-gray-300 rounded-md p-4">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="mt-1 text-sm text-gray-600">
                    Click to upload from your computer
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    or connect to Google Drive in settings
                  </p>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                  />
                  <button 
                    type="button" 
                    className="mt-2 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Upload Image
                  </button>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isLoading || !creativeFormData.name}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create Creative'}
              </button>
            </form>
          </div>
          
          {/* Creative List */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Ad Creatives</h3>
            {adCreatives.length === 0 ? (
              <p className="text-gray-500">No creatives yet for this ad set.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {adCreatives.map(creative => (
                  <div key={creative.id} className="border rounded-md p-4">
                    <h4 className="font-medium">{creative.name}</h4>
                    <p className="text-sm text-gray-500">Status: {creative.status}</p>
                    {creative.headline && (
                      <p className="text-sm font-medium mt-2">{creative.headline}</p>
                    )}
                    {creative.description && (
                      <p className="text-sm text-gray-600 mt-1">{creative.description}</p>
                    )}
                    {creative.file_url && (
                      <div className="mt-2 border rounded overflow-hidden h-32 bg-gray-100 flex items-center justify-center">
                        <p className="text-sm text-gray-500">Image Preview</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
} 