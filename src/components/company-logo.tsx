import React from 'react';

export default function CompanyLogo({
  url ="https://www.supermoney.in/supermoney-powerd-logo.png"
}: {
  url?:string
}) {
  console.log(url)
  return (
    <img
      src={url}
      alt="companyLogo"
      style={{ width: '100px', height: 'auto', margin: 'auto' }}
    />
  );
}
