import React from 'react';

export default function SavexLogo({
  className,
  collapsed = false,
}: {
  className?: string;
  collapsed?: boolean;
}) {

  return (
    <img
      src="/assets/images/savex-logo.png" // path from public/
      alt="Logo"
      style={{ width: '100px', height: 'auto', margin: 'auto' }}
    />
  );
}
