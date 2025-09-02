"use client";

import React from "react";
import { IconButton } from "@/ui/components/IconButton";
import { FeatherTwitter } from "@subframe/core";
import { FeatherInstagram } from "@subframe/core";
import { FeatherLinkedin } from "@subframe/core";
import { FeatherYoutube } from "@subframe/core";
import { FeatherGithub } from "@subframe/core";
import { FeatherGlobe } from "@subframe/core";

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
          icon={<FeatherTwitter />}
          onClick={() => handleSocialClick(`https://twitter.com/${twitter}`)}
        />
      )}
      {instagram && (
        <IconButton
          icon={<FeatherInstagram />}
          onClick={() => handleSocialClick(`https://instagram.com/${instagram}`)}
        />
      )}
      {linkedin && (
        <IconButton
          icon={<FeatherLinkedin />}
          onClick={() => handleSocialClick(`https://linkedin.com/in/${linkedin}`)}
        />
      )}
      {youtube && (
        <IconButton
          icon={<FeatherYoutube />}
          onClick={() => handleSocialClick(`https://youtube.com/${youtube}`)}
        />
      )}
      {github && (
        <IconButton
          icon={<FeatherGithub />}
          onClick={() => handleSocialClick(`https://github.com/${github}`)}
        />
      )}
      {website && (
        <IconButton
          icon={<FeatherGlobe />}
          onClick={() => handleSocialClick(website)}
        />
      )}
    </div>
  );
} 