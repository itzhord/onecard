import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/server/auth';

export async function GET(request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all cards for the user
    const cards = await prisma.card.findMany({
      where: { userId: session.user.id },
      select: { id: true }
    });

    const cardIds = cards.map(c => c.id);

    // Get analytics for these cards
    const views = await prisma.cardView.findMany({
      where: { cardId: { in: cardIds } },
      orderBy: { createdAt: 'desc' }
    });

    // Process data for dashboard
    const totalViews = views.length;
    const uniqueVisitors = new Set(views.map(v => v.viewerIp)).size;
    
    // Device breakdown
    const deviceCounts = {};
    views.forEach(v => {
      const device = v.device || 'desktop';
      deviceCounts[device] = (deviceCounts[device] || 0) + 1;
    });
    const deviceData = Object.entries(deviceCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));

    // Location breakdown
    const locationCounts = {};
    views.forEach(v => {
      const loc = v.country || 'Unknown';
      locationCounts[loc] = (locationCounts[loc] || 0) + 1;
    });
    const locationData = Object.entries(locationCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Views over time (last 7 days)
    const viewsOverTime = {};
    const now = new Date();
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { weekday: 'short' });
      viewsOverTime[dateStr] = { date: dateStr, views: 0, uniqueViews: 0 };
    }

    views.forEach(v => {
      const dateStr = new Date(v.createdAt).toLocaleDateString('en-US', { weekday: 'short' });
      if (viewsOverTime[dateStr]) {
        viewsOverTime[dateStr].views++;
      }
    });
    
    // Calculate unique views per day
    Object.keys(viewsOverTime).forEach(dateStr => {
       const dayViews = views.filter(v => new Date(v.createdAt).toLocaleDateString('en-US', { weekday: 'short' }) === dateStr);
       viewsOverTime[dateStr].uniqueViews = new Set(dayViews.map(v => v.viewerIp)).size;
    });

    const viewsData = Object.values(viewsOverTime);

    return NextResponse.json({
      analytics: {
        totalViews,
        uniqueVisitors,
        contactSaves: 0, // Placeholder
        socialClicks: 0 // Placeholder
      },
      viewsData,
      deviceData,
      locationData
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
