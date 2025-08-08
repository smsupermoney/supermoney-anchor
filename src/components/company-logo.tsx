import React from 'react';

const defaultLogoUrl = "https://www.supermoney.in/supermoney-powerd-logo.png";

export default function CompanyLogo({
  url
}: {
  url?: string | null;
}) {
  const logoSrc = url || defaultLogoUrl;
  
  return (
    <img
      src={logoSrc}
      alt="Company Logo"
      style={{ width: '100px', height: 'auto', margin: 'auto' }}
      onError={(e) => {
        // If the custom logo fails to load, fall back to the default
        (e.target as HTMLImageElement).src = defaultLogoUrl;
      }}
    />
  );
}
