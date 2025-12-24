'use client';

import { useState, useRef, useEffect } from 'react';
import { Download, MapPin, Phone, Mail, Instagram, Linkedin, Youtube, Globe, Camera } from 'lucide-react';
import SocialIcon from './SocialIcon';
import Man from '../../public/images/man.jpg'
import Woman from '../../public/images/woman.jpg'
import Header from '../../public/images/header 1.jpg'
import Header2 from '../../public/images/header 2.jpg'

export default function DigitalBusinessCard2({ formData: propFormData, isEditable = false }) {
    const defaultFormData = {
        name: 'Manny Emmanuell',
        location: 'Lagos, Nigeria',
        bio: 'Discover speed, comfort, and innovation in every model. MIDNIGHT DRIVE — your gateway to any car, anytime.',
        website: 'www.example.com',
        instagram: 'tesla',
        linkedin: 'tesla',
        youtube: 'tesla'
    };
    
    const [formData, setFormData] = useState(defaultFormData);
    
    // Use prop data if provided, otherwise use default/internal state
    const displayData = propFormData || formData;

    const [headerImage, setHeaderImage] = useState('');
    const [galleryImages, setGalleryImages] = useState([
        Woman,
        Woman,
        Woman
    ]);

    const headerInputRef = useRef(null);
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
                // ignore
            }
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleImageUpload = (e, type, index = null) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            if (type === 'header') setHeaderImage(reader.result);
            if (type === 'gallery' && index !== null) {
                const updatedGallery = [...galleryImages];
                updatedGallery[index] = reader.result;
                setGalleryImages(updatedGallery);
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className=" h-100vh bg-[#a40000] rounded-lg py-8 px-4 flex justify-center">
            <div className="max-w-sm  bg-[#a40000] text-white text-center">

                {/* Tesla Header Image */}
                <div className="relative w-full h-48 bg-black/20 flex items-center justify-center overflow-hidden">
                    <img src={getSrc(Woman) || '/mnt/data/image 2.png'} className="w-full opacity-90" />

                    {/* Upload Button (Top Right) - Only show for owner */}
                    {isEditable && (
                        <>
                            <button
                                onClick={() => headerInputRef.current?.click()}
                                className="absolute top-3 right-3 bg-white/90 text-black p-2 rounded-full shadow hover:bg-white transition"
                            >
                                <Camera className="w-5 h-5" />
                            </button>

                            <input
                                ref={headerInputRef}
                                type="file" 
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleImageUpload(e, 'header')}
                            />
                        </>
                    )}
                </div>

                {/* Location */}
                <div className="flex items-center justify-center gap-2 text-sm mt-3 opacity-80">
                    <MapPin className="w-4 h-4" /> {displayData.location}
                </div>

                {/* Buttons */}
                <div className="flex gap-3 px-4 mt-5">
                    <button className="w-1/2 py-2 bg-white text-[#a40000] font-semibold rounded-lg">Save Contact</button>
                    <button className="w-1/2 py-2 bg-[#8d0000] font-semibold rounded-lg border border-white/20">Exchange Contact</button>
                </div>

                {/* Bio */}
                <p className="mt-6 px-5 text-sm font-semibold leading-relaxed opacity-90">{displayData.bio}</p>

                {/* Gallery */}
                <div className="mt-8 px-5 grid grid-cols-3 gap-2">
                    {galleryImages.map((img, i) => (
                        <div key={i} className="relative group rounded-lg overflow-hidden">
                            <img src={getSrc(img) || img} className="w-full h-20 bg-white object-cover" />
                            {isEditable && (
                                <>
                                    <button
                                        onClick={() => galleryInputRefs.current[i]?.click()}
                                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                                    >
                                        <Camera className="w-5 h-5 text-white" />
                                    </button>
                                    <input
                                        ref={(el) => (galleryInputRefs.current[i] = el)}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => handleImageUpload(e, 'gallery', i)}
                                    />
                                </>
                            )}
                        </div>
                    ))}
                </div>

                {/* Website Card */}
                <div className="mt-8 mx-5 bg-white text-black rounded-xl flex items-center justify-between px-4 py-3">
                    <div className="bg-transparent w-full text-sm">
                        {displayData.website || 'www.example.com'}
                    </div>
                    <Globe className="w-6 h-6 text-gray-600" />
                </div>

                {/* Connect With Us */}
                <p className="my-[4rem] text-xs tracking-widest">CONNECT WITH US</p>
                <div className="flex justify-center gap-4 mt-3 text-white/80">
                    <SocialIcon 
                        icon={Instagram} 
                        platform="Instagram" 
                        handle={displayData.instagram}
                        className="text-white/80 hover:text-white"
                    />
                    <SocialIcon 
                        icon={Mail} 
                        platform="Email" 
                        handle={displayData.email}
                        className="text-white/80 hover:text-white"
                    />
                    <SocialIcon 
                        icon={Linkedin} 
                        platform="LinkedIn" 
                        handle={displayData.linkedin}
                        className="text-white/80 hover:text-white"
                    />
                    <SocialIcon 
                        icon={Youtube} 
                        platform="YouTube" 
                        handle={displayData.youtube}
                        className="text-white/80 hover:text-white"
                    />
                    <SocialIcon 
                        icon={Globe} 
                        platform="Website" 
                        handle={displayData.website}
                        className="text-white/80 hover:text-white"
                    />
                </div>

                {/* Footer */}
                <p className="mt-10 mb-6 italic text-sm tracking-wide">THE STYLE OF YOUR DRIVE</p>
            </div>
        </div>
    );
}
