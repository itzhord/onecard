'use client'

import { use, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Card1 from '@/components/Card1';
import Card2 from '@/components/Card2';
import Card3 from '@/components/Card3';
import Card4 from '@/components/Card4';

export default function PublicCardPage() {
  const params = useParams();
  const username = params.username;
  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchCard = async () => {
      try {
        console.log('Fetching card for username:', username);
        
        const response = await fetch(`/api/cards/username/${username}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            console.log('Card not found');
            setNotFound(true);
          } else {
            throw new Error('Failed to fetch card');
          }
          setLoading(false);
          return;
        }

        const { card } = await response.json();
        console.log('Card fetched successfully:', card);
        
        // Transform database card to expected format
        const transformedCard = {
          id: card.id,
          cardId: card.cardId,
          template: { id: card.templateId },
          formData: card.formData,
          createdAt: card.createdAt
        };
        
        setCardData(transformedCard);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching card:', error);
        setNotFound(true);
        setLoading(false);
      }
    };

    if (username) {
      fetchCard();
    }
  }, [username]);

  // Track view when card data is loaded
  useEffect(() => {
    if (cardData?.id) {
      const trackView = async () => {
        try {
          // Check if we already tracked this view in this session to avoid duplicates on re-renders
          const sessionKey = `viewed_${cardData.id}`;
          if (sessionStorage.getItem(sessionKey)) return;
          
          await fetch('/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cardId: cardData.id }),
          });
          
          sessionStorage.setItem(sessionKey, 'true');
        } catch (error) {
          console.error('Error tracking view:', error);
        }
      };
      trackView();
    }
  }, [cardData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading card...</p>
        </div>
      </div>
    );
  }

  if (notFound || !cardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Card Not Found</h1>
          <p className="text-gray-600 mb-6">
            The card for username "{username}" doesn't exist or hasn't been created yet.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Homepage
          </a>
        </div>
      </div>
    );
  }

  const { template, formData } = cardData;
  
  // Map template id to component
  const templateComponents = {
    1: Card1,
    2: Card2,
    3: Card3,
    4: Card4
  };

  const CardComponent = templateComponents[template.id];

  if (!CardComponent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600">Invalid card template</p>
        </div>
      </div>
    );
  }

  // Create card with data
  const CardWithData = (
    <CardComponent
      formData={{
        name: formData.name,
        title: formData.title || formData.jobTitle,
        company: formData.company,
        businessName: formData.businessName || formData.name,
        location: formData.location,
        bio: formData.bio,
        description: formData.bio || formData.description,
        tagline: formData.tagline,
        subtitle: formData.tagline || formData.subtitle,
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        whatsapp: formData.whatsapp || formData.phone,
        linkedin: formData.linkedin,
        instagram: formData.instagram,
        youtube: formData.youtube,
        tiktok: formData.tiktok,
        facebook: formData.facebook,
        profileImage: formData.profileImage
      }}
    />
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {formData.name || 'Digital Business Card'}
          </h1>
          <p className="text-gray-600">
            @{username}
          </p>
        </div>
        
        <div className="flex justify-center">
          {CardWithData}
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 mb-4">
            Want to create your own digital business card?
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
          >
            Create Your Card
          </a>
        </div>
      </div>
    </div>
  );
}
