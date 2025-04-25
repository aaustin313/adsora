import { createCampaign, getCampaigns } from '../../../../api-functions';

export async function GET(request: Request) {
  return getCampaigns(request, process.env);
}

export async function POST(request: Request) {
  return createCampaign(request, process.env);
} 