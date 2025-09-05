import React from "react";

import { FeatherMail } from "@subframe/core";
import { FeatherMessageSquare } from "@subframe/core";
import { FeatherHeart } from "@subframe/core";
import { FeatherBookmark } from "@subframe/core";
import { FeatherUsers } from "@subframe/core";
import { FeatherTrendingUp } from "@subframe/core";

import { Button } from "@/ui/components/Button";

export default function NotificationsSettingsPage() {
  return (
    <div className="flex w-full max-w-[576px] flex-col items-start gap-12">
      <div className="flex w-full flex-col items-start gap-1">
        <span className="w-full text-heading-2 font-heading-2 text-default-font">
          Notifications
        </span>
        <span className="w-full text-body font-body text-subtext-color">
          Choose what notifications you receive and how you receive them.
        </span>
      </div>

      <div className="flex w-full flex-col items-start gap-6">
        <span className="text-heading-3 font-heading-3 text-default-font">
          Email Notifications
        </span>
        
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-3">
            <FeatherMessageSquare className="h-5 w-5 text-neutral-600" />
            <div className="flex flex-col items-start gap-1">
              <span className="text-body-bold font-body-bold text-default-font">
                Comments
              </span>
              <span className="text-body font-body text-subtext-color">
                When someone comments on your lists
              </span>
            </div>
          </div>
          <div className="flex h-5 w-8 cursor-pointer flex-col items-start justify-center gap-2 rounded-full border border-solid border-brand-600 bg-brand-600 px-0.5 py-0.5">
            <input
              type="checkbox"
              defaultChecked={true}
              className="hidden"
            />
            <div className="flex h-3.5 w-3.5 flex-col items-start gap-2 rounded-full bg-white shadow-sm translate-x-2.5" />
          </div>
        </div>

        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-3">
            <FeatherHeart className="h-5 w-5 text-neutral-600" />
            <div className="flex flex-col items-start gap-1">
              <span className="text-body-bold font-body-bold text-default-font">
                Reactions
              </span>
              <span className="text-body font-body text-subtext-color">
                When someone reacts to your lists or comments
              </span>
            </div>
          </div>
          <div className="flex h-5 w-8 cursor-pointer flex-col items-start justify-center gap-2 rounded-full border border-solid border-brand-600 bg-brand-600 px-0.5 py-0.5">
            <input
              type="checkbox"
              defaultChecked={true}
              className="hidden"
            />
            <div className="flex h-3.5 w-3.5 flex-col items-start gap-2 rounded-full bg-white shadow-sm translate-x-2.5" />
          </div>
        </div>

        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-3">
            <FeatherBookmark className="h-5 w-5 text-neutral-600" />
            <div className="flex flex-col items-start gap-1">
              <span className="text-body-bold font-body-bold text-default-font">
                Saves
              </span>
              <span className="text-body font-body text-subtext-color">
                When someone saves your lists
              </span>
            </div>
          </div>
          <div className="flex h-5 w-8 cursor-pointer flex-col items-start justify-center gap-2 rounded-full border border-solid border-neutral-200 bg-neutral-200 px-0.5 py-0.5">
            <input
              type="checkbox"
              defaultChecked={false}
              className="hidden"
            />
            <div className="flex h-3.5 w-3.5 flex-col items-start gap-2 rounded-full bg-white shadow-sm" />
          </div>
        </div>

        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-3">
            <FeatherUsers className="h-5 w-5 text-neutral-600" />
            <div className="flex flex-col items-start gap-1">
              <span className="text-body-bold font-body-bold text-default-font">
                Publication Invites
              </span>
              <span className="text-body font-body text-subtext-color">
                When you're invited to join a publication
              </span>
            </div>
          </div>
          <div className="flex h-5 w-8 cursor-pointer flex-col items-start justify-center gap-2 rounded-full border border-solid border-brand-600 bg-brand-600 px-0.5 py-0.5">
            <input
              type="checkbox"
              defaultChecked={true}
              className="hidden"
            />
            <div className="flex h-3.5 w-3.5 flex-col items-start gap-2 rounded-full bg-white shadow-sm translate-x-2.5" />
          </div>
        </div>
      </div>

      <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-border" />

      <div className="flex w-full flex-col items-start gap-6">
        <span className="text-heading-3 font-heading-3 text-default-font">
          Push Notifications
        </span>
        <span className="text-body font-body text-subtext-color">
          Receive push notifications on your devices for important updates.
        </span>

        <div className="flex w-full items-center justify-between">
          <div className="flex flex-col items-start gap-1">
            <span className="text-body-bold font-body-bold text-default-font">
              Enable Push Notifications
            </span>
            <span className="text-body font-body text-subtext-color">
              Receive notifications directly on your device
            </span>
          </div>
          <div className="flex h-5 w-8 cursor-pointer flex-col items-start justify-center gap-2 rounded-full border border-solid border-neutral-200 bg-neutral-200 px-0.5 py-0.5">
            <input
              type="checkbox"
              defaultChecked={false}
              className="hidden"
            />
            <div className="flex h-3.5 w-3.5 flex-col items-start gap-2 rounded-full bg-white shadow-sm" />
          </div>
        </div>

        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-3">
            <FeatherMessageSquare className="h-5 w-5 text-neutral-600" />
            <div className="flex flex-col items-start gap-1">
              <span className="text-body-bold font-body-bold text-default-font">
                Comments
              </span>
              <span className="text-body font-body text-subtext-color">
                Push notifications for new comments
              </span>
            </div>
          </div>
          <div className="flex h-5 w-8 cursor-pointer flex-col items-start justify-center gap-2 rounded-full border border-solid border-neutral-200 bg-neutral-200 px-0.5 py-0.5">
            <input
              type="checkbox"
              defaultChecked={false}
              className="hidden"
            />
            <div className="flex h-3.5 w-3.5 flex-col items-start gap-2 rounded-full bg-white shadow-sm" />
          </div>
        </div>

        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-3">
            <FeatherHeart className="h-5 w-5 text-neutral-600" />
            <div className="flex flex-col items-start gap-1">
              <span className="text-body-bold font-body-bold text-default-font">
                Reactions
              </span>
              <span className="text-body font-body text-subtext-color">
                Push notifications for reactions
              </span>
            </div>
          </div>
          <div className="flex h-5 w-8 cursor-pointer flex-col items-start justify-center gap-2 rounded-full border border-solid border-neutral-200 bg-neutral-200 px-0.5 py-0.5">
            <input
              type="checkbox"
              defaultChecked={false}
              className="hidden"
            />
            <div className="flex h-3.5 w-3.5 flex-col items-start gap-2 rounded-full bg-white shadow-sm" />
          </div>
        </div>
      </div>

      <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-border" />

      <div className="flex w-full flex-col items-start gap-6">
        <span className="text-heading-3 font-heading-3 text-default-font">
          Weekly Digest
        </span>
        <span className="text-body font-body text-subtext-color">
          Get a weekly summary of activity on your lists and from people you follow.
        </span>

        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-3">
            <FeatherMail className="h-5 w-5 text-neutral-600" />
            <div className="flex flex-col items-start gap-1">
              <span className="text-body-bold font-body-bold text-default-font">
                Enable Weekly Digest
              </span>
              <span className="text-body font-body text-subtext-color">
                Receive a weekly email summary
              </span>
            </div>
          </div>
          <div className="flex h-5 w-8 cursor-pointer flex-col items-start justify-center gap-2 rounded-full border border-solid border-brand-600 bg-brand-600 px-0.5 py-0.5">
            <input
              type="checkbox"
              defaultChecked={true}
              className="hidden"
            />
            <div className="flex h-3.5 w-3.5 flex-col items-start gap-2 rounded-full bg-white shadow-sm translate-x-2.5" />
          </div>
        </div>

        <div className="flex w-full items-center justify-between">
          <div className="flex flex-col items-start gap-1">
            <span className="text-body-bold font-body-bold text-default-font">
              Digest Day
            </span>
            <span className="text-body font-body text-subtext-color">
              Choose which day to receive your weekly digest
            </span>
          </div>
          <select
            className="w-48 h-10 border border-neutral-border rounded-md px-3 text-body font-body text-default-font outline-hidden focus:border-brand-600 focus:ring-1 focus:ring-brand-600 bg-white"
            defaultValue="sunday"
          >
            <option value="sunday">Sunday</option>
            <option value="monday">Monday</option>
            <option value="tuesday">Tuesday</option>
            <option value="wednesday">Wednesday</option>
            <option value="thursday">Thursday</option>
            <option value="friday">Friday</option>
            <option value="saturday">Saturday</option>
          </select>
        </div>

        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-3">
            <FeatherTrendingUp className="h-5 w-5 text-neutral-600" />
            <div className="flex flex-col items-start gap-1">
              <span className="text-body-bold font-body-bold text-default-font">
                Trending Lists
              </span>
              <span className="text-body font-body text-subtext-color">
                Include trending lists in your digest
              </span>
            </div>
          </div>
          <div className="flex h-5 w-8 cursor-pointer flex-col items-start justify-center gap-2 rounded-full border border-solid border-brand-600 bg-brand-600 px-0.5 py-0.5">
            <input
              type="checkbox"
              defaultChecked={true}
              className="hidden"
            />
            <div className="flex h-3.5 w-3.5 flex-col items-start gap-2 rounded-full bg-white shadow-sm translate-x-2.5" />
          </div>
        </div>
      </div>

      <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-border" />

      <div className="flex w-full items-center justify-end gap-2">
        <Button
          variant="brand-primary"
        >
          Save changes
        </Button>
      </div>
    </div>
  );
} 