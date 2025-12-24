import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET card by username (public route - no auth required)
export async function GET(request, { params }) {
  try {
    const { username } = params;
    
    console.log('[API] GET /api/cards/username/[username] - Fetching card for:', username);

    // Find card by cardId (which is the username)
    const card = await prisma.card.findUnique({
      where: { 
        cardId: username,
        isActive: true // Only show active cards
      },
    });

    if (!card) {
      console.log('[API] Card not found for username:', username);
      return NextResponse.json({ 
        error: 'Card not found' 
      }, { status: 404 });
    }

    console.log('[API] Card found:', card.id);
    
    return NextResponse.json({ card });
  } catch (error) {
    console.error('[API] Error in GET /api/cards/username/[username]:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
