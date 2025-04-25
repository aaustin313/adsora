import { createAdSet } from '../../../../api-functions';

export async function POST(request: Request) {
  return createAdSet(request, process.env);
} 