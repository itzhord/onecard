'use client'

import React from 'react';
import Card1 from './Card1';
import Card2 from './Card2';
import Card3 from './Card3';
import Card4 from './Card4';

const CardDisplay = ({ cardData, isEditable = false }) => {
  if (!cardData || !cardData.template) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Card Yet</h3>
          <p className="text-sm text-gray-500">
            Create a card using the builder on the left to see it here
          </p>
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
    return <div className="text-center text-gray-500">Invalid card template</div>;
  }

  // Create card with data
  const CardWithData = React.cloneElement(<CardComponent />, {
    formData: {
      // Map common fields
      name: formData.name,
      title: formData.title || formData.jobTitle,
      company: formData.company,
      businessName: formData.businessName || formData.name,
      location: formData.location,
      bio: formData.bio,
      description: formData.bio || formData.description,
      tagline: formData.tagline,
      subtitle: formData.tagline || formData.subtitle,
      // Contact fields
      phone: formData.phone,
      email: formData.email,
      website: formData.website,
      whatsapp: formData.whatsapp || formData.phone,
      // Social fields
      linkedin: formData.linkedin,
      instagram: formData.instagram,
      youtube: formData.youtube,
      tiktok: formData.tiktok,
      facebook: formData.facebook,
      // Images
      profileImage: formData.profileImage,
      backgroundImage: formData.backgroundImage
    },
    isEditable: isEditable
  });

  return (
    <div className="h-full overflow-y-auto">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">Your Card Preview</h3>
        <p className="text-sm text-gray-600">
          {template.name}
        </p>
      </div>
      <div className="flex justify-center">
        {CardWithData}
      </div>
    </div>
  );
};

export default CardDisplay;
