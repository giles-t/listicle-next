"use client";

import React from "react";
import { IconButton } from "@/ui/components/IconButton";
import { Github, Globe, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";

interface SocialLinksProps {
  twitter?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
  youtube?: string | null;
  github?: string | null;
  website?: string | null;
}

export function SocialLinks({
  twitter,
  instagram,
  linkedin,
  youtube,
  github,
  website,
}: SocialLinksProps) {
  const handleSocialClick = (url: string | null) => {
    if (url) {
      // Add protocol if missing
      const finalUrl = url.startsWith('http') ? url : `https://${url}`;
      window.open(finalUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="flex w-full flex-wrap items-center gap-1">
      {twitter && (
        <IconButton
          icon={<Twitter />}
          onClick={() => handleSocialClick(`https://twitter.com/${twitter}`)}
        />
      )}
      {instagram && (
        <IconButton
          icon={<Instagram />}
          onClick={() => handleSocialClick(`https://instagram.com/${instagram}`)}
        />
      )}
      {linkedin && (
        <IconButton
          icon={<Linkedin />}
          onClick={() => handleSocialClick(`https://linkedin.com/in/${linkedin}`)}
        />
      )}
      {youtube && (
        <IconButton
          icon={<Youtube />}
          onClick={() => handleSocialClick(`https://youtube.com/${youtube}`)}
        />
      )}
      {github && (
        <IconButton
          icon={<Github />}
          onClick={() => handleSocialClick(`https://github.com/${github}`)}
        />
      )}
      {website && (
        <IconButton
          icon={<Globe />}
          onClick={() => handleSocialClick(website)}
        />
      )}
    </div>
  );
} 