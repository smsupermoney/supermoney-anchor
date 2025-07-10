import React from 'react';

export default function SupermoneyLogo({
  className,
  collapsed = false,
}: {
  className?: string;
  collapsed?: boolean;
}) {

  return (
    <img
      src="/assets/images/logo.png" // path from public/
      alt="Logo"
      style={{ width: '150px', height: 'auto', margin: 'auto' }}
    />
  );
}
