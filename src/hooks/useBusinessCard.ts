import { useState, useCallback } from 'react';

export interface CardData {
  fullName: string;
  title: string;
  location: string;
  bio: string;
  email: string;
  phone: string;
  website: string;
  profileImage: string;
  backgroundImage: string;
  socialLinks: {
    email?: string;
    phone?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    github?: string;
    whatsapp?: string;
  };
  galleryImages: string[];
}

export function useBusinessCard(initialData?: Partial<CardData>) {
  const defaultData: CardData = {
    fullName: 'Your Name',
    title: 'Your Title',
    location: 'Your Location',
    bio: 'Your bio here',
    email: '',
    phone: '',
    website: '',
    profileImage: '/images/default-profile.jpg',
    backgroundImage: '/images/default-background.jpg',
    socialLinks: {
      email: '',
      phone: '',
      instagram: '',
      linkedin: '',
      twitter: '',
      github: '',
      whatsapp: '',
    },
    galleryImages: [
      '/images/default-1.jpg',
      '/images/default-2.jpg',
      '/images/default-3.jpg',
    ],
    ...initialData,
  };

  const [cardData, setCardData] = useState<CardData>(defaultData);
  const [isEditing, setIsEditing] = useState(false);

  const updateCardData = useCallback((newData: Partial<CardData>) => {
    setCardData((prev) => ({ ...prev, ...newData }));
  }, []);

  const generateVCF = useCallback(() => {
    const vcfContent = `BEGIN:VCARD
VERSION:3.0
FN:${cardData.fullName}
TITLE:${cardData.title}
TEL:${cardData.phone}
EMAIL:${cardData.email}
URL:${cardData.website}
NOTE:${cardData.bio}
ORG:Studio Design Co.
PHOTO;VALUE=URI:${cardData.profileImage}
END:VCARD`;

    const element = document.createElement('a');
    const file = new Blob([vcfContent], { type: 'text/vcard' });
    element.href = URL.createObjectURL(file);
    element.download = `${cardData.fullName.replace(/\s+/g, '_')}.vcf`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(element.href);
  }, [cardData]);

  const generateJSON = useCallback(() => {
    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(cardData, null, 2)], {
      type: 'application/json',
    });
    element.href = URL.createObjectURL(file);
    element.download = `${cardData.fullName.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(element.href);
  }, [cardData]);

  return {
    cardData,
    setCardData,
    updateCardData,
    isEditing,
    setIsEditing,
    generateVCF,
    generateJSON,
  };
}
