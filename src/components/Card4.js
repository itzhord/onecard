'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Phone, Mail, MessageCircle, Music, Linkedin,Camera, Share2, Download } from 'lucide-react';
import SocialIcon from './SocialIcon';
import Man from '../../public/images/man.jpg'
import Woman from '../../public/images/woman.jpg'
import Header from '../../public/images/header 1.jpg'
import Header2 from '../../public/images/header 2.jpg'

export default function DigitalBusinessCard({ formData: propFormData, isEditable = false }) {
  const defaultFormData = {
    name: 'POPPY FAVOUR',
    title: 'UI/UX DESIGNER / BRAND DESIGNER',
    location: 'Lagos, Nigeria',
    tagline: 'Transforming ideas into canvases, one brush stroke at a time.',
    phone: '+234 123 4567 890',
    email: 'poppyfavour@gmail.com',
    whatsapp: '+234 123 4567 890',
    linkedin: 'linkedin.com/in/poppyfavour',
    tiktok: '@poppyfavour',
    website: 'poppyfavour.com'
  };

  const [formData, setFormData] = useState(defaultFormData);
  
  // Use prop data if provided, otherwise use default/internal state
  const displayData = propFormData || formData;

  const [profileImage, setProfileImage] = useState(Man);
  const [backgroundImage, setBackgroundImage] = useState(Header2);
  const [galleryImages, setGalleryImages] = useState([Man, Man, Man, Man]);

  const profileInputRef = useRef(null);
  const backgroundInputRef = useRef(null);
  const galleryInputRefs = useRef([]);

  // helper to normalize imported images (Next.js image imports may be objects)
  const getSrc = (img) => {
    if (!img) return null;
    if (typeof img === 'string') return img;
    // Some bundlers return objects like { src: '/_next/static/..', height, width }
    return img.src || img.default || null;
  };

  // Preload default images on mount so they appear instantly before user replacement
  useEffect(() => {
    const imagesToPreload = [Man, Woman, Header, Header2, ...galleryImages];

    imagesToPreload.forEach((img) => {
      try {
        const src = getSrc(img);
        if (!src) return;
        const pre = new window.Image();
        pre.src = src;
      } catch (e) {
        // ignore preload errors
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageUpload = (e, type, index = null) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'profile') {
          setProfileImage(reader.result);
        } else if (type === 'background') {
          setBackgroundImage(reader.result);
        } else if (type === 'gallery') {
          const newGallery = [...galleryImages];
          newGallery[index] = reader.result;
          setGalleryImages(newGallery);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadVCF = () => {
    const vcfData = `BEGIN:VCARD
VERSION:3.0
FN:${formData.name}
TITLE:${formData.title}
TEL;TYPE=CELL:${formData.phone}
EMAIL:${formData.email}
ADR:;;${formData.location};;;
URL:${formData.website}
NOTE:${formData.tagline}
END:VCARD`;

    const blob = new Blob([vcfData], { type: 'text/vcard' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${formData.name.replace(/\s+/g, '_')}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-sm  bg-gradient-to-br from-teal-900 to-teal-700 rounded-3xl overflow-hidden shadow-2xl">
      {/* Header Section */}
      <div className="relative h-64">
        <div
          className="w-full h-full overflow-hidden"
        >
          {getSrc(displayData.backgroundImage || backgroundImage) ? (
                            <img src={getSrc(displayData.backgroundImage || backgroundImage)} alt="Background" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gray-300" />
                        )}
          <button
            onClick={() => backgroundInputRef.current?.click()}
            className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs hover:bg-white/30 transition-colors"
          >
             <Camera className="w-5 h-5 text-white" />
          </button>
        </div>
        <input
          ref={backgroundInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleImageUpload(e, 'background')}
          className="hidden"
        />

        {/* Profile Picture centered in background */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-gray-300">
              {profileImage ? (
                <img src={getSrc(profileImage)} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-400 flex items-center justify-center text-white text-2xl font-bold">
                  {formData.name.charAt(0)}
                </div>
              )}
            </div>
            <button
              onClick={() => profileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-orange-500 text-white p-1 rounded-full hover:bg-orange-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
        <input
          ref={profileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleImageUpload(e, 'profile')}
          className="hidden"
        />
      </div>

      {/* Info Section */}
      <div className="bg-orange-800 pt-4 pb-4 px-6 text-center">
        <h1 className="text-white text-lg font-bold mb-1.5">{formData.name}</h1>
        <p className="text-orange-200 text-xs mb-0.5">{formData.title}</p>
        <p className="text-orange-300 text-xs mb-2">{formData.location}</p>
        <p className="text-white text-xs italic mb-3">{formData.tagline}</p>

        <button
          onClick={downloadVCF}
          className="bg-orange-600 text-white px-5 py-1.5  rounded-full text-xs font-medium hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 mx-auto mb-5"
        >
          <Download className="w-3 h-3" />
          SAVE CONTACT
        </button>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-4">
          <SocialIcon 
            icon={Phone} 
            platform="Phone" 
            handle={displayData.phone}
            className="flex flex-col items-center gap-2 p-3 hover:bg-orange-700/50 rounded-lg transition-colors"
            iconWrapperClassName="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center"
            iconClassName="w-6 h-6 text-orange-800"
            showLabel={false}
          />
          <SocialIcon 
            icon={Mail} 
            platform="Email" 
            handle={displayData.email}
            className="flex flex-col items-center gap-2 p-3 hover:bg-orange-700/50 rounded-lg transition-colors"
            iconWrapperClassName="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center"
            iconClassName="w-6 h-6 text-orange-800"
            showLabel={false}
          />
          <SocialIcon 
            icon={MessageCircle} 
            platform="WhatsApp" 
            handle={displayData.whatsapp}
            className="flex flex-col items-center gap-2 p-3 hover:bg-orange-700/50 rounded-lg transition-colors"
            iconWrapperClassName="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center"
            iconClassName="w-6 h-6 text-orange-800"
            showLabel={false}
          />
        </div>
        
        {/* Social Icons - Row 2 */}
        <div className="grid grid-cols-3 gap-4 mt-2 mb-3">
          <SocialIcon 
            icon={Music} 
            platform="TikTok" 
            handle={displayData.tiktok}
            className="flex flex-col items-center gap-2 p-3 hover:bg-orange-700/50 rounded-lg transition-colors"
            iconWrapperClassName="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center"
            iconClassName="w-6 h-6 text-orange-800"
            showLabel={false}
          />
          <SocialIcon 
            icon={Linkedin} 
            platform="LinkedIn" 
            handle={displayData.linkedin}
            className="flex flex-col items-center gap-2 p-3 hover:bg-orange-700/50 rounded-lg transition-colors"
            iconWrapperClassName="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center"
            iconClassName="w-6 h-6 text-orange-800"
            showLabel={false}
          />
          <SocialIcon 
            icon={Share2} 
            platform="Share" 
            handle={displayData.website}
            className="flex flex-col items-center gap-2 p-3 hover:bg-orange-700/50 rounded-lg transition-colors"
            iconWrapperClassName="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center"
            iconClassName="w-6 h-6 text-orange-800"
            showLabel={false}
          />
        </div>

        {/* Our Services Section */}
        <div className="mb-5">
          <button className="bg-orange-600 text-white px-4 py-1 rounded-full text-xs font-medium">
            Our Services
          </button>
        </div>

        {/* Gallery */}
        <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto">
          {galleryImages.map((img, index) => (
            <div key={index} className="relative h-32 rounded-lg overflow-hidden bg-gray-700">
              {img ? (
                <img src={getSrc(img)} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-orange-600 to-orange-800 flex items-center justify-center">
                  <div className="text-white text-xs">Add Image</div>
                </div>
              )}
              <button
                onClick={() => galleryInputRefs.current[index]?.click()}
                className="absolute top-2 right-2 bg-white/20 backdrop-blur-sm text-white p-1 rounded-full hover:bg-white/30 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <input
                ref={el => galleryInputRefs.current[index] = el}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'gallery', index)}
                className="hidden"
              />
            </div>
          ))}
        </div>

        {/* Email Footer */}
        <div className="mt-3 flex items-center justify-center gap-2 text-orange-200 text-xs">
          <Mail className="w-3 h-3" />
          <span>{formData.email}</span>
        </div>
      </div>
    </div>
  );
}