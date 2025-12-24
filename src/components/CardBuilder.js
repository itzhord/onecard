'use client'

import React, { useState } from 'react';
import { User, Mail, Linkedin, Phone, MapPin, Globe, MessageSquare, Instagram, Video } from 'lucide-react';
import { toast } from 'sonner';
import Card1 from './Card1';
import Card2 from './Card2';
import Card3 from './Card3';
import Card4 from './Card4';

const CardBuilder = ({ onCardComplete, editingCard }) => {
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    company: '',
    jobTitle: '',
    title: '',
    businessName: '',
    tagline: '',
    subtitle: '',
    description: '',
    location: '',
    bio: '',
    email: '',
    linkedin: '',
    facebook: '',
    phone: '',
    address: '',
    website: '',
    instagram: '',
    youtube: '',
    tiktok: '',
    whatsapp: '',
    profileImage: '',
    backgroundImage: ''
  });
  const [editingImage, setEditingImage] = useState(false);
  const [editingBackground, setEditingBackground] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCardId, setEditingCardId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load editing card data when editingCard prop changes
  React.useEffect(() => {
    if (editingCard && editingCard.formData) {
      setIsEditMode(true);
      setEditingCardId(editingCard.cardId);
      setFormData(editingCard.formData);
      
      // Find and set the template
      const template = templates.find(t => t.id === editingCard.template?.id);
      if (template) {
        setSelectedTemplate(template);
      }
      
      // Skip to step 2 (contact details) when editing
      setStep(2);
    }
  }, [editingCard]);

  const templates = [
    {
      id: 1,
      name: 'Card 1 - Professional',
      component: Card1,
      description: 'Professional business card with gallery and detailed profile',
      preview: 'Teal themed card with profile image and comprehensive contact details'
    },
    {
      id: 2,
      name: 'Card 2 - Modern',
      component: Card2,
      description: 'Modern red-themed card with sleek design',
      preview: 'Bold red design with image gallery and social connections'
    },
    {
      id: 3,
      name: 'Card 3 - Business',
      component: Card3,
      description: 'Business-focused card with service showcase',
      preview: 'Clean business card design with service gallery'
    },
    {
      id: 4,
      name: 'Card 4 - Creative',
      component: Card4,
      description: 'Creative gradient card for designers and artists',
      preview: 'Orange-teal gradient design perfect for creative professionals'
    }
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const nextStep = async () => {
    // Validate username before proceeding from step 2
    if (step === 2 && !formData.username.trim()) {
      toast.error('Please enter a unique username for your card link');
      return;
    }
    
    if (step === 3) {
      // When finishing, save or update card in database
      setIsLoading(true);
      try {
        console.log('Saving card...', { isEditMode, editingCardId, formData });
        let response;
        
        if (isEditMode && editingCardId) {
          // Update existing card
          console.log('Updating card:', editingCardId);
          response = await fetch(`/api/cards/${editingCardId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              cardName: formData.name || formData.username,
              templateId: selectedTemplate.id,
              formData: formData,
            }),
          });
        } else {
          // Create new card
          console.log('Creating new card');
          response = await fetch('/api/cards', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              cardName: formData.name || formData.username,
              templateId: selectedTemplate.id,
              formData: formData,
            }),
          });
        }

        console.log('Response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          console.error('API Error:', errorData);
          throw new Error(errorData.error || `Server returned ${response.status}`);
        }

        const { card } = await response.json();
        console.log('Card saved successfully:', card);
        
        const cardData = {
          id: card.id,
          cardId: card.cardId,
          template: selectedTemplate,
          formData: formData,
          createdAt: card.createdAt
        };
        
        onCardComplete && onCardComplete(cardData);
        alert(`Card ${isEditMode ? 'updated' : 'created'} successfully!`);
      } catch (error) {
        console.error('Error saving card:', error);
        alert(`Failed to ${isEditMode ? 'update' : 'save'} card.\n\nError: ${error.message}\n\nPlease check the console for more details.`);
        setIsLoading(false);
        return;
      } finally {
        setIsLoading(false);
      }
    }
    setStep(step + 1);
  };
  
  const prevStep = () => setStep(step - 1);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        setFormData({
          ...formData,
          profileImage: typeof result === 'string' ? result : ''
        });
        setEditingImage(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (url) => {
    setFormData({
      ...formData,
      profileImage: url
    });
  };

  const handleBackgroundImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        setFormData({
          ...formData,
          backgroundImage: typeof result === 'string' ? result : ''
        });
        setEditingBackground(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackgroundImageUrlChange = (url) => {
    setFormData({
      ...formData,
      backgroundImage: url
    });
  };

  const TemplateCard = ({ template }) => {
    const CardComponent = template.component;
    return (
      <div
        className="relative cursor-pointer transform transition-all hover:scale-105 hover:shadow-xl rounded-2xl overflow-hidden border-2 border-gray-200 hover:border-blue-400"
        onClick={() => {
          setSelectedTemplate(template);
          nextStep();
        }}
      >
        <div className="pointer-events-none scale-100 origin-top">
          <CardComponent />
        </div>
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto">
      {step === 1 && (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Choose Your Card Style</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Select a digital business card template that reflects your personality.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {templates.map(template => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {isEditMode ? 'Edit Contact Details' : 'Share Your Contact Details'}
            </h2>
            <p className="text-gray-600">
              {isEditMode ? 'Update your contact information.' : 'Add links and information you\'d like to share.'}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-purple-600" />
              </div>
              <input
                type="text"
                name="username"
                placeholder="Your unique username (required) *"
                value={formData.username}
                onChange={handleInputChange}
                required
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
              />
            </div>
            <p className="text-xs text-gray-500 ml-13">This will be your card's unique link: yoursite.com/card/username</p>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <input
                type="email"
                name="email"
                placeholder="e.g., johndoe@example.com"
                value={formData.email}
                onChange={handleInputChange}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-green-600" />
              </div>
              <input
                type="tel"
                name="phone"
                placeholder="e.g., +1234567890"
                value={formData.phone}
                onChange={handleInputChange}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-green-600" />
              </div>
              <input
                type="tel"
                name="whatsapp"
                placeholder="WhatsApp: e.g., +1234567890"
                value={formData.whatsapp}
                onChange={handleInputChange}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Globe className="w-5 h-5 text-purple-600" />
              </div>
              <input
                type="text"
                name="website"
                placeholder="e.g., https://johndoe.com"
                value={formData.website}
                onChange={handleInputChange}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Linkedin className="w-5 h-5 text-blue-600" />
              </div>
              <input
                type="text"
                name="linkedin"
                placeholder="LinkedIn username"
                value={formData.linkedin}
                onChange={handleInputChange}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Instagram className="w-5 h-5 text-pink-600" />
              </div>
              <input
                type="text"
                name="instagram"
                placeholder="Instagram username"
                value={formData.instagram}
                onChange={handleInputChange}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Video className="w-5 h-5 text-red-600" />
              </div>
              <input
                type="text"
                name="youtube"
                placeholder="YouTube channel"
                value={formData.youtube}
                onChange={handleInputChange}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={prevStep}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              <button
                onClick={nextStep}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isEditMode ? 'Update →' : 'Next →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {isEditMode ? 'Edit Profile Information' : 'Complete Your Profile'}
            </h2>
            <p className="text-gray-600">
              {isEditMode ? 'Update your profile information.' : 'Add your basic information to personalize your card.'}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            {/* Background Image Upload - Skip for Card 2 */}
            {selectedTemplate?.id !== 2 && (
              <div className="text-center mb-6 border-b border-gray-100 pb-6">
                <h3 className="text-base font-semibold text-gray-800 mb-3">Upload Background/Header Image</h3>
                <div className="relative inline-block w-full max-w-xs">
                  <div
                    className="w-full h-32 bg-gray-100 rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors overflow-hidden border-2 border-dashed border-gray-300"
                    onClick={() => document.getElementById('bgImageUpload')?.click()}
                  >
                    {formData.backgroundImage ? (
                      <img src={formData.backgroundImage} alt="Background" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center text-gray-400">
                        <span className="text-2xl mb-1">+</span>
                        <span className="text-xs">Add Background Image</span>
                      </div>
                    )}
                  </div>
                  <input
                    id="bgImageUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleBackgroundImageUpload}
                    className="hidden"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingBackground(!editingBackground);
                    }}
                    className="absolute -bottom-3 -right-3 w-8 h-8 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-all text-sm z-10"
                  >
                    ✎
                  </button>
                </div>
                {editingBackground && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg max-w-xs mx-auto">
                    <p className="text-xs text-gray-600 mb-2">Or paste image URL:</p>
                    <input
                      type="text"
                      placeholder="https://example.com/image.jpg"
                      onChange={(e) => handleBackgroundImageUrlChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-xs"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-base font-semibold text-gray-800 mb-3">Upload Your Profile Photo</h3>
              <div className="relative inline-block">
                <div
                  className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors overflow-hidden"
                  onClick={() => document.getElementById('imageUpload')?.click()}
                >
                  {formData.profileImage ? (
                    <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                <input
                  id="imageUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => setEditingImage(!editingImage)}
                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-all text-sm"
                >
                  ✎
                </button>
              </div>
              {editingImage && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-2">Or paste image URL:</p>
                  <input
                    type="text"
                    placeholder="https://example.com/image.jpg"
                    onChange={(e) => handleImageUrlChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-xs"
                  />
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Full Name / Business Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Job Title / Position</label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g., CEO, Founder, Designer"
                  value={formData.title}
                  onChange={(e) => {
                    handleInputChange(e);
                    setFormData(prev => ({ ...prev, jobTitle: e.target.value }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Company</label>
                <input
                  type="text"
                  name="company"
                  placeholder="Company name"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  placeholder="e.g., Lagos, Nigeria"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tagline / Subtitle</label>
                <input
                  type="text"
                  name="tagline"
                  placeholder="e.g., Turning your vision to reality"
                  value={formData.tagline}
                  onChange={(e) => {
                    handleInputChange(e);
                    setFormData(prev => ({ ...prev, subtitle: e.target.value }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Bio / Description</label>
                <textarea
                  name="bio"
                  placeholder="Tell people about yourself..."
                  value={formData.bio}
                  onChange={(e) => {
                    handleInputChange(e);
                    setFormData(prev => ({ ...prev, description: e.target.value }));
                  }}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={prevStep}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back
              </button>
              <button
                onClick={nextStep}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isEditMode ? 'Updating...' : 'Saving...'}
                  </>
                ) : (
                  isEditMode ? 'Update Card' : 'Finish & Preview'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {isEditMode ? 'Card Updated! 🎉' : 'Card Created! 🎉'}
          </h2>
          <p className="text-gray-600 mb-4">
            Your card has been {isEditMode ? 'updated' : 'created'} and is now visible on the right side.
          </p>
          <button
            onClick={() => {
              setStep(1);
              setSelectedTemplate(null);
              setIsEditMode(false);
              setEditingCardId(null);
              setFormData({
                username: '',
                name: '',
                company: '',
                jobTitle: '',
                title: '',
                businessName: '',
                tagline: '',
                subtitle: '',
                description: '',
                location: '',
                bio: '',
                email: '',
                linkedin: '',
                facebook: '',
                phone: '',
                address: '',
                website: '',
                instagram: '',
                youtube: '',
                tiktok: '',
                whatsapp: '',
                profileImage: ''
              });
            }}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
          >
            {isEditMode ? 'Done' : 'Create Another Card'}
          </button>
        </div>
      )}
    </div>
  );
};

export default CardBuilder;
