'use client';

import React, { useEffect, useRef, useState, memo } from 'react';

interface LazyEmbedProps {
  html: string;
  url?: string;
  title?: string;
  site?: string;
  thumbnail?: string;
  disableLazyLoad?: boolean;
}

/**
 * Client component that lazy loads embed content when it enters the viewport.
 * Renders a fallback card until the embed is in view, then loads the full embed.
 * This significantly improves page performance by deferring heavy embed scripts.
 */
export const LazyEmbed = memo(function LazyEmbed({ 
  html, 
  url, 
  title, 
  site, 
  thumbnail,
  disableLazyLoad = false 
}: LazyEmbedProps) {
  const [isInView, setIsInView] = useState(disableLazyLoad); // Start as true if lazy load disabled
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const embedRef = useRef<HTMLDivElement>(null);
  const htmlLoadedRef = useRef<string | null>(null); // Track which HTML we've loaded

  // Intersection Observer to detect when embed enters viewport (skip if lazy loading disabled)
  useEffect(() => {
    if (disableLazyLoad) return; // Skip observer if lazy loading is disabled
    
    const container = containerRef.current;
    if (!container || isInView) return; // Don't observe if already in view

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect(); // Stop observing once triggered
          }
        });
      },
      {
        // Start loading when embed is 200px from viewport
        rootMargin: '200px',
        threshold: 0.01,
      }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [disableLazyLoad, isInView]);

  // Load Iframely once embed is in view and HTML is set
  useEffect(() => {
    if (!isInView || !embedRef.current) return;
    
    // Don't reload if we've already loaded this exact HTML
    if (htmlLoadedRef.current === html) return;

    const embed = embedRef.current;
    embed.innerHTML = html;

    // Load iframely if available
    if (window.iframely) {
      window.iframely.load(embed);
    }

    htmlLoadedRef.current = html;
    setIsLoaded(true);
  }, [isInView, html]);

  return (
    <div ref={containerRef} className="my-2">
      {!isInView ? (
        // Fallback preview card before embed loads
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
          <div className="flex items-start gap-3">
            {thumbnail && (
              <img 
                src={thumbnail} 
                alt={title || 'Embed thumbnail'} 
                className="w-20 h-20 object-cover rounded flex-shrink-0"
                loading="lazy"
              />
            )}
            <div className="flex-1 min-w-0">
              {title && (
                <h3 className="font-medium text-sm line-clamp-2 mb-1">
                  {title}
                </h3>
              )}
              {site && (
                <p className="text-gray-500 text-xs">{site}</p>
              )}
              {url && (
                <a 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 text-xs hover:underline mt-2 inline-block"
                >
                  View embed →
                </a>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Full embed content once in viewport
        <div 
          ref={embedRef} 
          className="embed-display-node-content"
          style={{ width: '100%', maxWidth: '100%' }}
        />
      )}
    </div>
  );
});

// Declare Iframely global for TypeScript
declare global {
  interface Window {
    iframely?: { load: (container?: HTMLElement) => void };
  }
}

