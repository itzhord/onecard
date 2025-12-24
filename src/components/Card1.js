'use client';

import { useState, useRef, useEffect } from 'react';
import { Download, MapPin, Phone, Mail, Instagram, Linkedin, Youtube, Globe, Camera } from 'lucide-react';
import SocialIcon from './SocialIcon';
import Man from '../../public/images/man.jpg'
import Woman from '../../public/images/woman.jpg'
import Header from '../../public/images/header 1.jpg'
import Header2 from '../../public/images/header 2.jpg'

export default function DigitalBusinessCard({ formData: propFormData, isEditable = false }) {
    const defaultFormData = {
        name: 'Manny Emmanuell',
        title: 'Interior decorator at',
        company: 'Google',
        location: 'Lagos, Nigeria',
        bio: 'Trained interior designer helping clients buy, renovate and style so they can love and ease, so a confident and secure living room',
        phone: '+234 800 000 0000',
        email: 'manny@example.com',
        website: 'www.example.com',
        instagram: 'mannydesigns',
        linkedin: 'manny-emmanuell',
        youtube: 'mannyinteriors'
    };
    
    const [formData, setFormData] = useState(defaultFormData);
    
    // Use prop data if provided, otherwise use default/internal state
    const displayData = propFormData || formData;

    const [profileImage, setProfileImage] = useState(Man);
    const [backgroundImage, setBackgroundImage] = useState(Header2);
    const [galleryImages, setGalleryImages] = useState([
        Man,
        Man,
        Man
    ]);

    const profileInputRef = useRef(null);
    const backgroundInputRef = useRef(null);
    const galleryInputRefs = useRef([]);

    // helper to normalize imported images (some bundlers return objects)
    const getSrc = (img) => {
        if (!img) return null;
        if (typeof img === 'string') return img;
        return img.src || img.default || null;
    };

    // Preload commonly used images on mount so they render instantly
    useEffect(() => {
        const toPreload = [Man, Woman, Header, Header2, ...galleryImages];
        toPreload.forEach((img) => {
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
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e, type, index = null) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (type === 'profile') {
                    setProfileImage(reader.result);
                } else if (type === 'background') {
                    setBackgroundImage(reader.result);
                } else if (type === 'gallery' && index !== null) {
                    const newGallery = [...galleryImages];
                    newGallery[index] = reader.result;
                    setGalleryImages(newGallery);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const generateVCF = () => {
        const vcfContent = `BEGIN:VCARD
VERSION:3.0
FN:${displayData.name}
TITLE:${displayData.title} ${displayData.company}
TEL:${displayData.phone}
EMAIL:${displayData.email}
URL:${displayData.website}
ADR:;;${displayData.location};;;;
NOTE:${displayData.bio}
X-SOCIALPROFILE;type=instagram:https://instagram.com/${displayData.instagram}
X-SOCIALPROFILE;type=linkedin:https://linkedin.com/in/${displayData.linkedin}
X-SOCIALPROFILE;type=youtube:https://youtube.com/@${displayData.youtube}
END:VCARD`;

        const blob = new Blob([vcfContent], { type: 'text/vcard' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${displayData.name.replace(/\s+/g, '_')}.vcf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-sm ">
            {/* Background Image Section */}
            <div className="relative h-[24rem] bg-gray-200 overflow-hidden group">
                {getSrc(displayData.backgroundImage || backgroundImage) ? (
                    <img src={getSrc(displayData.backgroundImage || backgroundImage)} alt="Background" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gray-300" />
                )}

                {/* Button to change background - Only show for owner */}
                {isEditable && (
                    <>
                        <button
                            onClick={() => backgroundInputRef.current?.click()}
                            className="absolute top-4 right-4 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                            <Camera className="w-5 h-5 text-gray-700" />
                        </button>

                        <input
                            ref={backgroundInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'background')}
                            className="hidden"
                        />
                    </>
                )}

                <div className="absolute bottom-5 w-[90%] left-4 text-white border-2 border-white rounded-xl flex items-center">
                    {/* Profile Picture Section */}
                    <div className="relative inline-block group">
                        {getSrc(profileImage) ? (
                            <img
                                src={displayData.profileImage || getSrc(profileImage)}
                                alt={displayData.name}
                                className="w-[10rem] h-60 rounded-l-xl object-cover"
                            />
                        ) : (
                            <div className="w-[10rem] h-60 rounded-l-xl bg-gray-200" />
                        )}
                        {/* Profile Picture Button - Only show for owner */}
                        {isEditable && (
                            <>
                                <button
                                    onClick={() => profileInputRef.current?.click()}
                                    className="absolute bottom-2 right-2 bg-teal-700 hover:bg-teal-800 p-2 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100 z-10"
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

                    {/* Card Section */}
                    <div className="bg-teal-800 h-60 max-w-[15rem] text-white rounded-r-lg p-4 overflow-auto">
                        <h2 className="text-xl font-bold mt-4">{displayData.name}</h2>
                        <p className="text-md mt-4 opacity-90">
                            {displayData.title} <span className="font-semibold">{displayData.company}</span>
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-sm">
                            <MapPin className="w-4 h-4" />
                            <span>{displayData.location}</span>
                        </div>
                    </div>
                </div>
            </div>


            <div className="px-6 pb-6  relative">

                <button
                    onClick={generateVCF}
                    className="w-full bg-teal-800 hover:bg-teal-900 text-white font-semibold py-3 px-4 rounded-lg mt-4 flex items-center justify-center gap-2 transition-colors"
                >
                    <Download className="w-5 h-5" />
                    SAVE CONTACT
                </button>

                {/* Bio Section */}
                <div className="mt-6">
                    <h3 className="font-bold text-gray-900 mb-2">Bio</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">{displayData.bio}</p>
                </div>

                {/* Gallery Section */}
                <div className="mt-6">
                    <h3 className="font-bold text-gray-900 mb-3">Gallery</h3>
                    <div className="grid grid-cols-3 gap-2 ">
                        {galleryImages.map((img, idx) => (
                            <div key={idx} className="relative group">
                                {getSrc(img) ? (
                                    <img
                                        src={getSrc(img)}
                                        alt={`Gallery ${idx + 1}`}
                                        className="w-full h-24 object-cover bg-teal-700 rounded-lg"
                                    />
                                ) : (
                                    <div className="w-full h-24 bg-teal-700 rounded-lg" />
                                )}
                                {isEditable && (
                                    <>
                                        <button
                                            onClick={() => galleryInputRefs.current[idx]?.click()}
                                            className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Camera className="w-5 h-5 text-white" />
                                        </button>
                                        <input
                                            ref={el => galleryInputRefs.current[idx] = el}
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload(e, 'gallery', idx)}
                                            className="hidden"
                                        />
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Connect Section */}
                <div className="mt-6">
                    <button className="w-full border-2 border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg mb-4 hover:bg-gray-50 transition-colors">
                        Connect With Us
                    </button>
                    <div className="flex justify-center gap-3 flex-wrap">
                        <div className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
                            <SocialIcon 
                                icon={Phone} 
                                platform="Phone" 
                                handle={displayData.phone}
                                className="text-gray-700"
                            />
                        </div>
                        <div className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
                            <SocialIcon 
                                icon={Mail} 
                                platform="Email" 
                                handle={displayData.email}
                                className="text-gray-700"
                            />
                        </div>
                        <div className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
                            <SocialIcon 
                                icon={Instagram} 
                                platform="Instagram" 
                                handle={displayData.instagram}
                                className="text-gray-700"
                            />
                        </div>
                        <div className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
                            <SocialIcon 
                                icon={Linkedin} 
                                platform="LinkedIn" 
                                handle={displayData.linkedin}
                                className="text-gray-700"
                            />
                        </div>
                        <div className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
                            <SocialIcon 
                                icon={Youtube} 
                                platform="YouTube" 
                                handle={displayData.youtube}
                                className="text-gray-700"
                            />
                        </div>
                        <div className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
                            <SocialIcon 
                                icon={Globe} 
                                platform="Website" 
                                handle={displayData.website}
                                className="text-gray-700"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

