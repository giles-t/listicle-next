"use client";

// @subframe/sync-disable

import React from "react";
import { Button } from "@/ui/components/Button";
import { FeatherPlus } from "@subframe/core";
import { IconButton } from "@/ui/components/IconButton";
import { FeatherBookmark } from "@subframe/core";
import { Avatar } from "@/ui/components/Avatar";
import { IconWithBackground } from "@/ui/components/IconWithBackground";
import { FeatherEye } from "@subframe/core";
import { FeatherHeart } from "@subframe/core";
import { FeatherMessageCircle } from "@subframe/core";

function LandingPage() {
  return (
    <div className="container max-w-none flex h-full w-full flex-col items-start gap-12 bg-default-background py-12">
      <div className="flex w-full items-start gap-4 mobile:flex-col mobile:flex-nowrap mobile:gap-4">
        <div className="flex grow shrink-0 basis-0 flex-col items-start justify-center gap-1">
          <span className="w-full text-heading-1 font-heading-1 text-default-font">
            Trending Listicles
          </span>
          <span className="text-body font-body text-subtext-color">
            Discover popular lists crafted by our community
          </span>
        </div>
        <Button
          icon={<FeatherPlus />}
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
        >
          Create New List
        </Button>
      </div>
      <div className="flex w-full flex-col items-start gap-4">
        <div className="flex w-full flex-wrap items-start gap-4">
          <div className="flex min-w-[320px] grow shrink-0 basis-0 flex-col items-start overflow-hidden rounded-md border border-solid border-neutral-border bg-default-background shadow-sm">
            <img
              className="h-48 w-full flex-none object-cover"
              src="https://images.unsplash.com/photo-1533105079780-92b9be482077"
            />
            <div className="flex w-full flex-col items-start gap-6 px-6 py-6">
              <div className="flex w-full flex-col items-start gap-4">
                <div className="flex w-full items-center justify-between">
                  <span className="text-caption-bold font-caption-bold text-brand-700">
                    TECHNOLOGY
                  </span>
                  <IconButton
                    size="small"
                    icon={<FeatherBookmark />}
                    onClick={(
                      event: React.MouseEvent<HTMLButtonElement>
                    ) => {}}
                  />
                </div>
                <div className="flex w-full flex-col items-start gap-1">
                  <span className="text-heading-3 font-heading-3 text-default-font">
                    8 Game-Changing Tech Gadgets of 2024
                  </span>
                  <span className="line-clamp-2 text-body font-body text-subtext-color">
                    Explore the most innovative tech products that are
                    revolutionizing how we live and work.
                  </span>
                </div>
              </div>
              <div className="flex w-full flex-col items-start gap-4">
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar
                      size="small"
                      image="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6"
                    >
                      TS
                    </Avatar>
                    <div className="flex flex-col items-start">
                      <span className="text-body-bold font-body-bold text-default-font">
                        Tom Smith
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <IconWithBackground icon={<FeatherEye />} />
                      <span className="text-caption-bold font-caption-bold text-default-font">
                        4.2k
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IconWithBackground
                        variant="error"
                        icon={<FeatherHeart />}
                      />
                      <span className="text-caption-bold font-caption-bold text-default-font">
                        385
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IconWithBackground
                        variant="neutral"
                        icon={<FeatherMessageCircle />}
                      />
                      <span className="text-caption-bold font-caption-bold text-default-font">
                        42
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex min-w-[320px] grow shrink-0 basis-0 flex-col items-start overflow-hidden rounded-md border border-solid border-neutral-border bg-default-background shadow-sm">
            <img
              className="h-48 w-full flex-none object-cover"
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"
            />
            <div className="flex w-full flex-col items-start gap-6 px-6 py-6">
              <div className="flex w-full flex-col items-start gap-4">
                <div className="flex w-full items-center justify-between">
                  <span className="text-caption-bold font-caption-bold text-brand-700">
                    FOOD &amp; DINING
                  </span>
                  <IconButton
                    size="small"
                    icon={<FeatherBookmark />}
                    onClick={(
                      event: React.MouseEvent<HTMLButtonElement>
                    ) => {}}
                  />
                </div>
                <div className="flex w-full flex-col items-start gap-1">
                  <span className="text-heading-3 font-heading-3 text-default-font">
                    12 Hidden Gem Restaurants in NYC
                  </span>
                  <span className="line-clamp-2 text-body font-body text-subtext-color">
                    Discover the best-kept culinary secrets of New York
                    City&#39;s diverse neighborhoods.
                  </span>
                </div>
              </div>
              <div className="flex w-full flex-col items-start gap-4">
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar
                      size="small"
                      image="https://images.unsplash.com/photo-1494790108377-be9c29b29330"
                    >
                      EW
                    </Avatar>
                    <div className="flex flex-col items-start">
                      <span className="text-body-bold font-body-bold text-default-font">
                        Emma Wilson
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <IconWithBackground icon={<FeatherEye />} />
                      <span className="text-caption-bold font-caption-bold text-default-font">
                        3.8k
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IconWithBackground
                        variant="error"
                        icon={<FeatherHeart />}
                      />
                      <span className="text-caption-bold font-caption-bold text-default-font">
                        267
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IconWithBackground
                        variant="neutral"
                        icon={<FeatherMessageCircle />}
                      />
                      <span className="text-caption-bold font-caption-bold text-default-font">
                        31
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex min-w-[320px] grow shrink-0 basis-0 flex-col items-start overflow-hidden rounded-md border border-solid border-neutral-border bg-default-background shadow-sm">
            <img
              className="h-48 w-full flex-none object-cover"
              src="https://images.unsplash.com/photo-1434494878577-86c23bcb06b9"
            />
            <div className="flex w-full flex-col items-start gap-6 px-6 py-6">
              <div className="flex w-full flex-col items-start gap-4">
                <div className="flex w-full items-center justify-between">
                  <span className="text-caption-bold font-caption-bold text-brand-700">
                    PRODUCTIVITY
                  </span>
                  <IconButton
                    size="small"
                    icon={<FeatherBookmark />}
                    onClick={(
                      event: React.MouseEvent<HTMLButtonElement>
                    ) => {}}
                  />
                </div>
                <div className="flex w-full flex-col items-start gap-1">
                  <span className="text-heading-3 font-heading-3 text-default-font">
                    5 Life-Changing Productivity Habits
                  </span>
                  <span className="line-clamp-2 text-body font-body text-subtext-color">
                    Transform your daily routine with these proven
                    productivity techniques used by successful entrepreneurs.
                  </span>
                </div>
              </div>
              <div className="flex w-full flex-col items-start gap-4">
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar
                      size="small"
                      image="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e"
                    >
                      MB
                    </Avatar>
                    <div className="flex flex-col items-start">
                      <span className="text-body-bold font-body-bold text-default-font">
                        Mike Brown
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <IconWithBackground icon={<FeatherEye />} />
                      <span className="text-caption-bold font-caption-bold text-default-font">
                        3.2k
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IconWithBackground
                        variant="error"
                        icon={<FeatherHeart />}
                      />
                      <span className="text-caption-bold font-caption-bold text-default-font">
                        245
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IconWithBackground
                        variant="neutral"
                        icon={<FeatherMessageCircle />}
                      />
                      <span className="text-caption-bold font-caption-bold text-default-font">
                        28
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;