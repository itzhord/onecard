'use client';

import { useState } from 'react';

/**
 * SocialIcon Component with Tooltip
 * 
 * @param {Object} props
 * @param {React.Component} props.icon - Lucide icon component
 * @param {string} props.platform - Platform name (e.g., "Instagram", "LinkedIn")
 * @param {string} props.handle - Username or handle
 * @param {string} props.url - Full URL to social profile
 * @param {string} props.className - Additional CSS classes
 */
export default function SocialIcon({ icon: Icon, platform, handle, url, className = '' }) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Don't render if no handle/url provided
  if (!handle && !url) return null;

  // Generate URL if only handle is provided
  const getUrl = () => {
    if (url) return url;
    
    const platformUrls = {
      'Instagram': `https://instagram.com/${handle}`,
      'LinkedIn': `https://linkedin.com/in/${handle}`,
      'YouTube': `https://youtube.com/@${handle}`,
      'Facebook': `https://facebook.com/${handle}`,
      'Twitter': `https://twitter.com/${handle}`,
      'TikTok': `https://tiktok.com/@${handle}`,
      'WhatsApp': `https://wa.me/${handle}`,
      'Email': `mailto:${handle}`,
      'Phone': `tel:${handle}`,
      'Website': handle.startsWith('http') ? handle : `https://${handle}`,
    };

    return platformUrls[platform] || handle;
  };

  const finalUrl = getUrl();

  return (
    <div className="relative inline-block">
      <a
        href={finalUrl}
        target={platform !== 'Email' && platform !== 'Phone' ? '_blank' : undefined}
        rel={platform !== 'Email' && platform !== 'Phone' ? 'noopener noreferrer' : undefined}
        className={`cursor-pointer hover:scale-110 transition-transform duration-200 ${className}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        aria-label={`${platform}: ${handle}`}
      >
        <Icon className="w-5 h-5" />
      </a>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-50 pointer-events-none">
          <div className="font-medium">{platform}</div>
          {handle && <div className="text-gray-300">@{handle}</div>}
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
            <div className="border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  );
}
