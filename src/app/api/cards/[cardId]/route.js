import { NextResponse } from 'next/server';
import { updateCard, deleteCard, getCardByCardId } from '@/lib/db';
import { auth } from '@/server/auth';

// GET single card
export async function GET(request, { params }) {
  try {
    const { cardId } = params;
    const { data: card, error } = await getCardByCardId(cardId);

    if (error || !card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    return NextResponse.json({ card });
  } catch (error) {
    console.error('Error in GET /api/cards/[cardId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT update card
export async function PUT(request, { params }) {
  try {
    console.log('[API] PUT /api/cards/[cardId] - Starting card update');
    
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    console.log('[API] Session check:', { hasSession: !!session, hasUser: !!session?.user });

    if (!session?.user) {
      console.error('[API] Unauthorized - No session or user');
      return NextResponse.json({ error: 'Unauthorized. Please sign in again.' }, { status: 401 });
    }

    const { cardId } = params;
    const body = await request.json();
    const { cardName, templateId, formData } = body;

    console.log('[API] Updating card:', { cardId, cardName, templateId });

    // Verify card belongs to user
    const { data: existingCard, error: fetchError } = await getCardByCardId(cardId);
    
    if (fetchError) {
      console.error('[API] Error fetching card:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch card' }, { status: 500 });
    }
    
    if (!existingCard) {
      console.error('[API] Card not found:', cardId);
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }
    
    if (existingCard.userId !== session.user.id) {
      console.error('[API] Unauthorized - Card belongs to different user');
      return NextResponse.json({ error: 'You do not have permission to edit this card' }, { status: 403 });
    }

    const { data: card, error } = await updateCard(cardId, {
      cardName,
      templateId,
      formData,
    });

    if (error) {
      console.error('[API] Database error updating card:', error);
      return NextResponse.json({ 
        error: `Failed to update card: ${error.message || 'Database error'}` 
      }, { status: 500 });
    }

    console.log('[API] Card updated successfully:', card.id);
    return NextResponse.json({ card });
  } catch (error) {
    console.error('[API] Unexpected error in PUT /api/cards/[cardId]:', error);
    return NextResponse.json({ 
      error: `Internal server error: ${error.message}` 
    }, { status: 500 });
  }
}

// DELETE card
export async function DELETE(request, { params }) {
  try {
    console.log('[API] DELETE /api/cards/[cardId] - Starting card deletion');
    
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    console.log('[API] Session check:', { hasSession: !!session, hasUser: !!session?.user });

    if (!session?.user) {
      console.error('[API] Unauthorized - No session or user');
      return NextResponse.json({ error: 'Unauthorized. Please sign in again.' }, { status: 401 });
    }

    const { cardId } = params;
    console.log('[API] Deleting card:', cardId);

    // Verify card belongs to user
    const { data: existingCard, error: fetchError } = await getCardByCardId(cardId);
    
    if (fetchError) {
      console.error('[API] Error fetching card:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch card' }, { status: 500 });
    }
    
    if (!existingCard) {
      console.error('[API] Card not found:', cardId);
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }
    
    if (existingCard.userId !== session.user.id) {
      console.error('[API] Unauthorized - Card belongs to different user');
      return NextResponse.json({ error: 'You do not have permission to delete this card' }, { status: 403 });
    }

    const { error } = await deleteCard(cardId);

    if (error) {
      console.error('[API] Database error deleting card:', error);
      return NextResponse.json({ 
        error: `Failed to delete card: ${error.message || 'Database error'}` 
      }, { status: 500 });
    }

    console.log('[API] Card deleted successfully:', cardId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Unexpected error in DELETE /api/cards/[cardId]:', error);
    return NextResponse.json({ 
      error: `Internal server error: ${error.message}` 
    }, { status: 500 });
  }
}
