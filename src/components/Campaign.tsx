'use client';

import { useState, useEffect, useCallback } from 'react';

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

type CampaignProps = {
  userId: string;
};

export default function Campaign({ userId }: CampaignProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [adSets, setAdSets] = useState<AdSet[]>([]);
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
  
  // Define fetchCampaigns with useCallback to avoid dependency issues
  const fetchCampaigns = useCallback(async () => {
    try {
      setIsLoading(true);
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
  
  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    
    try {
      setIsLoading(true);
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
  
  const handleSelectCampaign = async (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    // TODO: Fetch ad sets for this campaign
  };
  
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Campaign Management</h2>
      
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
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Your Campaigns</h3>
        {campaigns.length === 0 ? (
          <p className="text-gray-500">No campaigns yet. Create one to get started.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {campaigns.map(campaign => (
              <div 
                key={campaign.id} 
                className={`border rounded-md p-4 cursor-pointer transition-all ${
                  selectedCampaign?.id === campaign.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'hover:border-gray-400'
                }`}
                onClick={() => handleSelectCampaign(campaign)}
              >
                <h4 className="font-medium">{campaign.name}</h4>
                <p className="text-sm text-gray-500">Status: {campaign.status}</p>
                <p className="text-sm text-gray-500">
                  Created: {new Date(campaign.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Ad Set Management */}
      {selectedCampaign && (
        <div>
          <h3 className="text-xl font-semibold mb-4">
            Ad Sets for Campaign: {selectedCampaign.name}
          </h3>
          
          {/* Create Ad Set Form */}
          <div className="mb-6 border-t border-b py-6">
            <h4 className="font-medium mb-4">Create New Ad Set</h4>
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
            <h4 className="font-medium mb-4">Ad Sets</h4>
            {adSets.length === 0 ? (
              <p className="text-gray-500">No ad sets yet for this campaign.</p>
            ) : (
              <div className="space-y-4">
                {adSets.map(adSet => (
                  <div key={adSet.id} className="border rounded-md p-4">
                    <h5 className="font-medium">{adSet.name}</h5>
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
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 