import { NextResponse } from 'next/server';
import { getUserSubscription } from '@/lib/db';
import { auth } from '@/server/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: subscription, error } = await getUserSubscription(session.user.id);

    if (error) {
      console.error('Error fetching subscription:', error);
      return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 });
    }

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error('Error in GET /api/user/subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
