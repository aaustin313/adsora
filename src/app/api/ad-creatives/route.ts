import { createAdCreative } from '../../../../api-functions';

export async function POST(request: Request) {
  return createAdCreative(request, process.env);
} 