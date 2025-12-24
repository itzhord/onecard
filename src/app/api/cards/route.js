import { NextResponse } from 'next/server';
import { createCard, getUserCards, getUserSubscription } from '@/lib/db';
import { auth } from '@/server/auth';

// GET all user cards
export async function GET(request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: cards, error } = await getUserCards(session.user.id);

    if (error) {
      console.error('Error fetching cards:', error);
      return NextResponse.json({ error: 'Failed to fetch cards' }, { status: 500 });
    }

    return NextResponse.json({ cards });
  } catch (error) {
    console.error('Error in GET /api/cards:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST create new card
export async function POST(request) {
  try {
    console.log('[API] POST /api/cards - Starting card creation');
    
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    console.log('[API] Session check:', { hasSession: !!session, hasUser: !!session?.user });

    if (!session?.user) {
      console.error('[API] Unauthorized - No session or user');
      return NextResponse.json({ error: 'Unauthorized. Please sign in again.' }, { status: 401 });
    }

    const body = await request.json();
    const { cardName, templateId, formData } = body;

    console.log('[API] Request body:', { cardName, templateId, hasFormData: !!formData, username: formData?.username });

    if (!cardName || !formData || !formData.username) {
      console.error('[API] Missing required fields:', { cardName, hasFormData: !!formData, username: formData?.username });
      return NextResponse.json(
        { error: 'Missing required fields: cardName, formData, and username are required' },
        { status: 400 }
      );
    }

    console.log('[API] Creating card for user:', session.user.id);

    // Check for active subscription
    const { data: subscription } = await getUserSubscription(session.user.id);
    
    // Allow creation if user has an active subscription OR if they are an admin
    // You might want to allow 1 free card, but the requirement says "pays... before can create"
    const hasActiveSubscription = subscription && subscription.status === 'active';
    const isAdmin = session.user.role === 'admin';

    if (!hasActiveSubscription && !isAdmin) {
      return NextResponse.json({ 
        error: 'Subscription required. Please upgrade to a plan to create a card.',
        requiresSubscription: true
      }, { status: 403 });
    }

    const { data: card, error } = await createCard({
      userId: session.user.id,
      cardId: formData.username,
      cardName,
      templateId,
      formData,
    });

    if (error) {
      console.error('[API] Database error creating card:', error);
      
      // Check for unique constraint violation
      if (error.code === 'P2002' || error.message?.includes('unique')) {
        return NextResponse.json({ 
          error: `Username "${formData.username}" is already taken. Please choose a different username.` 
        }, { status: 409 });
      }
      
      return NextResponse.json({ 
        error: `Failed to create card: ${error.message || 'Database error'}` 
      }, { status: 500 });
    }

    console.log('[API] Card created successfully:', card.id);
    return NextResponse.json({ card }, { status: 201 });
  } catch (error) {
    console.error('[API] Unexpected error in POST /api/cards:', error);
    return NextResponse.json({ 
      error: `Internal server error: ${error.message}` 
    }, { status: 500 });
  }
}
