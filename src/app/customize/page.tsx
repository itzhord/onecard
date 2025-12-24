'use client'

import React, { useState } from 'react';
import { User, Mail, Linkedin, Facebook, Phone, MapPin, Globe, MessageSquare, Instagram, Video } from 'lucide-react';
import Card1 from '../../components/Card1';
import Card2 from '../../components/Card2';
import Card3 from '../../components/Card3';
import Card4 from '../../components/Card4';

const DigitalCardBuilder = () => {
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({
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
  const [editingImage, setEditingImage] = useState(false);

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

  const nextStep = () => setStep(step + 1);
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

  const TemplateCard = ({ template }) => {
    const CardComponent = template.component;
    return (
      <div
        className="relative cursor-pointer transform transition-all hover:scale-105 hover:shadow-3xl rounded-3xl overflow-hidden"
        onClick={() => {
          setSelectedTemplate(template);
          nextStep();
        }}
      >
        <div className="pointer-events-none scale-75 origin-top">
          <CardComponent />
        </div>
       
      </div>
    );
  };

  const FinalCard = () => {
    if (!selectedTemplate) return null;
    const CardComponent = selectedTemplate.component;
    // Create a card component wrapper that passes the form data as props
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
        profileImage: formData.profileImage
      }
    });
    return (
      <div className="flex justify-center">
        {CardWithData}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
              <User className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              CardCraft
            </h1>
          </div>
          {step > 1 && (
            <button onClick={() => setStep(1)} className="text-gray-600 hover:text-gray-800 font-medium">
              Skip
            </button>
          )}
        </div>

        {step === 1 && (
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">Choose Your Card Style</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Select a digital business card template that reflects your personality and professional brand.
            </p>
            <div className="flex justify-center gap-1 mt-12 flex-wrap">
              {templates.map(template => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Share Your Contact Details</h2>
              <p className="text-gray-600">
                Add links and information you'd like to share. You can enhance with videos and images later.
              </p>
            </div>
            <div className="bg-white rounded-3xl shadow-xl p-8 space-y-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    placeholder="e.g., johndoe@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-green-600" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="e.g., +1234567890"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-6 h-6 text-green-600" />
                  </div>
                  <input
                    type="tel"
                    name="whatsapp"
                    placeholder="WhatsApp: e.g., +1234567890"
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Globe className="w-6 h-6 text-purple-600" />
                  </div>
                  <input
                    type="text"
                    name="website"
                    placeholder="e.g., https://johndoe.com"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Linkedin className="w-6 h-6 text-blue-600" />
                  </div>
                  <input
                    type="text"
                    name="linkedin"
                    placeholder="LinkedIn username (without URL)"
                    value={formData.linkedin}
                    onChange={handleInputChange}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Instagram className="w-6 h-6 text-pink-600" />
                  </div>
                  <input
                    type="text"
                    name="instagram"
                    placeholder="Instagram username (without @)"
                    value={formData.instagram}
                    onChange={handleInputChange}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Video className="w-6 h-6 text-red-600" />
                  </div>
                  <input
                    type="text"
                    name="youtube"
                    placeholder="YouTube channel name (without @)"
                    value={formData.youtube}
                    onChange={handleInputChange}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-6 h-6 text-gray-600" />
                  </div>
                  <input
                    type="text"
                    name="tiktok"
                    placeholder="TikTok username (with @)"
                    value={formData.tiktok}
                    onChange={handleInputChange}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center justify-center gap-2 text-yellow-600 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <p className="text-center text-gray-600 italic mb-2">
                  "Setting up my CardCraft profile was incredibly smooth. Sharing my information has never been easier!"
                </p>
                <p className="text-center text-sm text-gray-500 font-medium">— Alex Rivera, TechCorp</p>
              </div>

              <button
                onClick={nextStep}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
              >
                Continue
              </button>
              <div className="flex justify-center gap-4 mt-4">
                <button
                  onClick={prevStep}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-all"
                >
                  ← Previous
                </button>
                <button
                  onClick={nextStep}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Complete Your Profile</h2>
              <p className="text-gray-600">
                Add your basic information to personalize your card. You can update or expand this later.
              </p>
            </div>
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <div className="text-center mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Upload Your Profile Photo</h3>
                <div className="relative inline-block">
                  <div
                    className="w-32 h-32 bg-gray-100 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors overflow-hidden"
                    onClick={() => document.getElementById('imageUpload').click()}
                  >
                    {formData.profileImage ? (
                      <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-12 h-12 text-gray-400" />
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
                    className="absolute -bottom-2 -right-2 w-10 h-10 bg-purple-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-purple-700 transition-all"
                  >
                    ✎
                  </button>
                </div>
                {editingImage && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-2">Or paste image URL:</p>
                    <input
                      type="text"
                      placeholder="https://example.com/image.jpg"
                      onChange={(e) => handleImageUrlChange(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none text-sm"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name / Business Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full name or business name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Name (if different from above)</label>
                  <input
                    type="text"
                    name="businessName"
                    placeholder="Company or business name"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Title / Position</label>
                  <input
                    type="text"
                    name="title"
                    placeholder="e.g., CEO, Founder, Designer"
                    value={formData.title}
                    onChange={(e) => {
                      handleInputChange(e);
                      setFormData(prev => ({ ...prev, jobTitle: e.target.value }));
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                  <input
                    type="text"
                    name="company"
                    placeholder="Company name"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    name="location"
                    placeholder="e.g., Lagos, Nigeria"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tagline / Subtitle</label>
                  <input
                    type="text"
                    name="tagline"
                    placeholder="e.g., Turning your vision to reality"
                    value={formData.tagline}
                    onChange={(e) => {
                      handleInputChange(e);
                      setFormData(prev => ({ ...prev, subtitle: e.target.value }));
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio / Description</label>
                  <textarea
                    name="bio"
                    placeholder="Tell people about yourself or your business..."
                    value={formData.bio}
                    onChange={(e) => {
                      handleInputChange(e);
                      setFormData(prev => ({ ...prev, description: e.target.value }));
                    }}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={prevStep}
                  className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={nextStep}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
                >
                  Finish
                </button>
              </div>
              <div className="flex justify-center gap-4 mt-4">
                <button
                  onClick={prevStep}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-all"
                >
                  ← Previous
                </button>
                <button
                  onClick={nextStep}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Your Card Is Ready! 🎉</h2>
            <p className="text-gray-600 mb-8">
              Start sharing now or continue customizing with videos, photos, and more.
            </p>
            <div className="flex justify-center mb-8">
              <FinalCard />
            </div>
            <div className="flex justify-center gap-2 mb-8">
              {['#000000', '#EF4444', '#EC4899', '#F59E0B', '#FBBF24', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6'].map(color => (
                <div
                  key={color}
                  className="w-10 h-10 rounded-full cursor-pointer hover:scale-110 transition-transform shadow-md"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={prevStep}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-all"
              >
                ← Previous
              </button>
              <button
                disabled
                className="px-6 py-3 bg-gray-200 text-gray-400 rounded-xl font-semibold cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Image Edit Modal */}
      {editingImage && step === 4 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setEditingImage(false)}>
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">Change Profile Image</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload New Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Or Paste Image URL</label>
                <input
                  type="text"
                  placeholder="https://example.com/image.jpg"
                  onChange={(e) => handleImageUrlChange(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                />
              </div>
              <button
                onClick={() => setEditingImage(false)}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DigitalCardBuilder;
