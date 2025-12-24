'use client';

import { useState, useRef, useEffect } from 'react';
import { Linkedin, Share2, Mail, Instagram, MessageCircle, MapPin, Camera } from 'lucide-react';
import SocialIcon from './SocialIcon';
import Man from '../../public/images/man.jpg'
import Woman from '../../public/images/woman.jpg'
import Header from '../../public/images/header 1.jpg'
import Header2 from '../../public/images/header 2.jpg'

export default function BethasBusinessCard({ formData: propFormData, isEditable = false }) {
  const defaultFormData = {
    businessName: "BETHA'S INC.",
    tagline: 'Turning your vision to reality',
    subtitle: 'Building spaces that inspire. Elevating homes.',
    description: 'Transforming fixes into canvases, one brush stroke at a time.',
    linkedin: 'bethas-inc',
    tiktok: '@bethasinc',
    whatsapp: '+1234567890',
    share: 'bethas-inc',
    email: 'contact@bethasinc.com',
    instagram: 'bethasinc',
    location: 'Tap to see where our closet stores are in Nigeria'
  };
  
  const [formData, setFormData] = useState(defaultFormData);
  
  // Use prop data if provided, otherwise use default/internal state
  const displayData = propFormData || formData;

  const [headerImage, setHeaderImage] = useState(Header);
  const [profileImage, setProfileImage] = useState(Woman);
  const [serviceImages, setServiceImages] = useState([
    Woman, Woman, Woman,
  ]);

  const headerInputRef = useRef(null);
  const profileInputRef = useRef(null);
  const serviceInputRefs = useRef([]);

  // helper to normalize imported images (some bundlers return objects)
  const getSrc = (img) => {
    if (!img) return null;
    if (typeof img === 'string') return img;
    return img.src || img.default || null;
  };

  // Preload commonly used images on mount so they render instantly
  useEffect(() => {
    const toPreload = [Man, Woman, Header, Header2, ...serviceImages];
    toPreload.forEach((img) => {
      try {
        const src = getSrc(img);
        if (!src) return;
        const pre = new window.Image();
        pre.src = src;
      } catch (e) {
        // ignore
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e, type, index = null) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'header') {
          setHeaderImage(reader.result);
        } else if (type === 'profile') {
          setProfileImage(reader.result);
        } else if (type === 'service' && index !== null) {
          const newServices = [...serviceImages];
          newServices[index] = reader.result;
          setServiceImages(newServices);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const generateVCF = () => {
    const vcfContent = `BEGIN:VCARD
VERSION:3.0
FN:${displayData.businessName || displayData.name}
ORG:${displayData.businessName || displayData.name}
TITLE:${displayData.tagline}
TEL;TYPE=CELL:${displayData.whatsapp}
EMAIL:${displayData.email}
NOTE:${displayData.description || displayData.bio}
X-SOCIALPROFILE;type=linkedin:https://linkedin.com/company/${displayData.linkedin}
X-SOCIALPROFILE;type=instagram:https://instagram.com/${displayData.instagram}
X-SOCIALPROFILE;type=tiktok:https://tiktok.com/${displayData.tiktok}
URL:https://wa.me/${displayData.whatsapp.replace(/\D/g, '')}
END:VCARD`;

    const blob = new Blob([vcfContent], { type: 'text/vcard' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(displayData.businessName || displayData.name).replace(/\s+/g, '_')}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
     <div className="bg-white  rounded-2xl shadow-lg overflow-hidden  max-w-sm">
          {/* Header Image */}
          <div className="relative h-[10rem] bg-gray-200 overflow-hidden group">
            {getSrc(displayData.backgroundImage || headerImage) ? (
              <img src={getSrc(displayData.backgroundImage || headerImage)} alt="Header" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-amber-100 via-orange-50 to-amber-200" />
            )}
            {isEditable && (
              <>
                <button
                  onClick={() => headerInputRef.current?.click()}
                  className="absolute top-4 right-4 bg-white/95 hover:bg-white p-3 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <Camera className="w-5 h-5 text-gray-800" />
                </button>
                <input
                  ref={headerInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'header')}
                  className="hidden"
                />
              </>
            )}
          </div>

          {/* Profile Section */}
          <div className="px-6 pb-6 -mt-16 relative flex flex-col items-center">
            <div className="relative justify inline-block group">
              <div className="w-28 h-28 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg">
                {getSrc(profileImage) ? (
                  <img src={getSrc(profileImage)} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                    <Camera className="w-8 h-8 text-gray-500" />
                  </div>
                )}
              </div>
              {isEditable && (
                <>
                  <button
                    onClick={() => profileInputRef.current?.click()}
                    className="absolute bottom-1 right-1 bg-gray-800 hover:bg-gray-900 p-2 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                  <input
                    ref={profileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'profile')}
                    className="hidden"
                  />
                </>
              )}
            </div>

            {/* Business Info */}
            <div className="mt-2 text-center">
              <h1 className="text-2xl font-bold text-gray-900">{displayData.businessName || displayData.name}</h1>
              <p className="text-sm text-gray-600 mt-1">{displayData.tagline}</p>
              <p className="text-xs text-gray-500 mt-1 italic">{displayData.subtitle}</p>
              <p className="text-sm text-gray-700 mt-3 leading-relaxed">
                {displayData.description || displayData.bio}
              </p>
            </div>

           

            {/* Social Icons - Row 1 */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              <SocialIcon 
                icon={Linkedin} 
                platform="LinkedIn" 
                handle={displayData.linkedin}
                className="flex flex-col items-center gap-2 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                iconWrapperClassName="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center"
                iconClassName="w-6 h-6 text-gray-800"
                labelClassName="text-xs text-gray-600 font-medium"
              />

              <SocialIcon 
                icon={() => (
                  <svg className="w-6 h-6 text-gray-800" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                )}
                platform="TikTok" 
                handle={displayData.tiktok}
                className="flex flex-col items-center gap-2 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                iconWrapperClassName="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center"
                labelClassName="text-xs text-gray-600 font-medium"
              />

              <SocialIcon 
                icon={MessageCircle} 
                platform="WhatsApp" 
                handle={displayData.whatsapp}
                className="flex flex-col items-center gap-2 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                iconWrapperClassName="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center"
                iconClassName="w-6 h-6 text-gray-800"
                labelClassName="text-xs text-gray-600 font-medium"
              />
            </div>

            {/* Social Icons - Row 2 */}
            <div className="mt-2 grid grid-cols-3 gap-4">
              <SocialIcon 
                icon={Share2} 
                platform="Share" 
                handle={displayData.share}
                className="flex flex-col items-center gap-2 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                iconWrapperClassName="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center"
                iconClassName="w-6 h-6 text-gray-800"
                labelClassName="text-xs text-gray-600 font-medium"
              />

              <SocialIcon 
                icon={Mail} 
                platform="Email" 
                handle={displayData.email}
                className="flex flex-col items-center gap-2 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                iconWrapperClassName="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center"
                iconClassName="w-6 h-6 text-gray-800"
                labelClassName="text-xs text-gray-600 font-medium"
              />

              <SocialIcon 
                icon={Instagram} 
                platform="Instagram" 
                handle={displayData.instagram}
                className="flex flex-col items-center gap-2 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                iconWrapperClassName="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center"
                iconClassName="w-6 h-6 text-gray-800"
                labelClassName="text-xs text-gray-600 font-medium"
              />
            </div>

            {/* Location */}
            <div className="mt-6 flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <MapPin className="w-5 h-5 text-gray-700 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Our Location</h3>
                <p className="text-xs text-gray-600 mt-1">{displayData.location}</p>
              </div>
            </div>

           
          </div>
           {/* Our Services */}
            <div className="mt-2 px-6 pb-6">
              <h3 className="font-bold text-gray-900 mb-4">Our Services</h3>
              <div className="grid grid-cols-3 gap-2">
                {serviceImages.map((img, idx) => (
                  <div key={idx} className="relative group aspect-square">
                    {getSrc(img) ? (
                      <img
                        src={getSrc(img)}
                        alt={`Service ${idx + 1}`}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-200 via-pink-200 to-orange-200 rounded-xl" />
                    )}
                    {isEditable && (
                      <>
                        <button
                          onClick={() => serviceInputRefs.current[idx]?.click()}
                          className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Camera className="w-6 h-6 text-white" />
                        </button>
                        <input
                          ref={el => serviceInputRefs.current[idx] = el}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'service', idx)}
                          className="hidden"
                        />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
        </div>
  );
}