import React from "react";
import { Button } from "@/ui/components/Button";

import { FeatherShield } from "@subframe/core";
import { FeatherSmartphone } from "@subframe/core";
import { FeatherLogOut } from "@subframe/core";
import { FeatherTrash2 } from "@subframe/core";
import { Badge } from "@/ui/components/Badge";

export default function SecuritySettingsPage() {
  return (
    <div className="flex w-full max-w-[576px] flex-col items-start gap-12">
      <div className="flex w-full flex-col items-start gap-1">
        <span className="w-full text-heading-2 font-heading-2 text-default-font">
          Security
        </span>
        <span className="w-full text-body font-body text-subtext-color">
          Manage your account security settings and login preferences.
        </span>
      </div>

      <div className="flex w-full flex-col items-start gap-6">
        <span className="text-heading-3 font-heading-3 text-default-font">
          Password & Authentication
        </span>
        <div className="flex w-full flex-col items-start gap-1">
          <label className="text-body-bold font-body-bold text-default-font">
            Current Password
          </label>
          <input
            type="password"
            placeholder="Enter current password"
            className="h-12 w-full border border-neutral-border rounded-md px-3 text-body font-body text-default-font outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
            defaultValue=""
          />
          <span className="text-caption font-caption text-subtext-color">
            Enter your current password to make changes
          </span>
        </div>
        <div className="flex w-full flex-col items-start gap-1">
          <label className="text-body-bold font-body-bold text-default-font">
            New Password
          </label>
          <input
            type="password"
            placeholder="Enter new password"
            className="h-12 w-full border border-neutral-border rounded-md px-3 text-body font-body text-default-font outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
            defaultValue=""
          />
          <span className="text-caption font-caption text-subtext-color">
            Must be at least 8 characters long
          </span>
        </div>
        <div className="flex w-full flex-col items-start gap-1">
          <label className="text-body-bold font-body-bold text-default-font">
            Confirm New Password
          </label>
          <input
            type="password"
            placeholder="Confirm new password"
            className="h-12 w-full border border-neutral-border rounded-md px-3 text-body font-body text-default-font outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
            defaultValue=""
          />
          <span className="text-caption font-caption text-subtext-color">
            Re-enter your new password
          </span>
        </div>
        <Button
          variant="brand-primary"
        >
          Update Password
        </Button>
      </div>

      <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-border" />

      <div className="flex w-full flex-col items-start gap-6">
        <span className="text-heading-3 font-heading-3 text-default-font">
          Two-Factor Authentication
        </span>
        <div className="flex w-full items-center justify-between">
          <div className="flex flex-col items-start gap-1">
            <span className="text-body-bold font-body-bold text-default-font">
              Enable 2FA
            </span>
            <span className="text-body font-body text-subtext-color">
              Add an extra layer of security to your account
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

        <Button
          variant="neutral-secondary"
          size="small"
          icon={<FeatherSmartphone />}
        >
          Setup
        </Button>
      </div>

      <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-border" />

      <div className="flex w-full flex-col items-start gap-6">
        <span className="text-heading-3 font-heading-3 text-default-font">
          Login Activity
        </span>
        <span className="text-body font-body text-subtext-color">
          Recent login activity and active sessions on your account.
        </span>

        <div className="flex w-full flex-col items-start gap-4">
          <div className="flex w-full items-center justify-between rounded-lg border border-neutral-border p-4">
            <div className="flex flex-col items-start gap-1">
              <span className="text-body-bold font-body-bold text-default-font">
                iPhone - Safari
              </span>
              <span className="text-body font-body text-subtext-color">
                San Francisco, CA • Last active 2 hours ago
              </span>
            </div>
            <Button
              variant="destructive-secondary"
              size="small"
              icon={<FeatherLogOut />}
            >
              Sign out
            </Button>
          </div>

          <div className="flex w-full items-center justify-between rounded-lg border border-neutral-border p-4">
            <div className="flex flex-col items-start gap-1">
              <span className="text-body-bold font-body-bold text-default-font">
                Windows PC - Firefox
              </span>
              <span className="text-body font-body text-subtext-color">
                New York, NY • Last active 1 day ago
              </span>
            </div>
            <Button
              variant="destructive-secondary"
              size="small"
              icon={<FeatherLogOut />}
            >
              Sign out
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-border" />

      <div className="flex w-full flex-col items-start gap-6">
        <span className="text-heading-3 font-heading-3 text-default-font">
          Account Actions
        </span>
        <div className="flex w-full flex-col items-start gap-4">
          <div className="flex w-full items-center justify-between rounded-lg border border-neutral-border p-4">
            <div className="flex flex-col items-start gap-1">
              <span className="text-body-bold font-body-bold text-default-font">
                Sign out all devices
              </span>
              <span className="text-body font-body text-subtext-color">
                Sign out of all sessions except this one
              </span>
            </div>
            <Button
              variant="destructive-secondary"
              icon={<FeatherLogOut />}
            >
              Sign out all
            </Button>
          </div>

          <div className="flex w-full items-center justify-between rounded-lg border border-error-border bg-error-50 p-4">
            <div className="flex flex-col items-start gap-1">
              <span className="text-body-bold font-body-bold text-error-600">
                Delete Account
              </span>
              <span className="text-body font-body text-error-500">
                Permanently delete your account and all associated data
              </span>
            </div>
            <Button
              variant="destructive-primary"
              icon={<FeatherTrash2 />}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 