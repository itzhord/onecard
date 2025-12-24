import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UAParser } from 'ua-parser-js';

export async function POST(request) {
  try {
    const { cardId } = await request.json();

    if (!cardId) {
      return NextResponse.json({ error: 'Card ID is required' }, { status: 400 });
    }

    const userAgentString = request.headers.get('user-agent') || '';
    const parser = new UAParser(userAgentString);
    const result = parser.getResult();

    // Get IP address (this depends on your hosting, e.g., Vercel uses x-forwarded-for)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    
    // Optional: Get location from headers if available (e.g. Vercel headers)
    const country = request.headers.get('x-vercel-ip-country');
    const city = request.headers.get('x-vercel-ip-city');

    await prisma.cardView.create({
      data: {
        cardId,
        ip: ip,
        browser: result.browser.name,
        os: result.os.name,
        device: result.device.type || 'desktop', // Default to desktop if undefined
        country,
        city,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking view:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
