"use client";

import React, { useState } from "react";
import { DialogLayout } from "@/ui/layouts/DialogLayout";
import { LinkButton } from "@/ui/components/LinkButton";
import { OAuthSocialButton } from "@/ui/components/OAuthSocialButton";
import { TextField } from "@/ui/components/TextField";
import { Button } from "@/ui/components/Button";
import { IconWithBackground } from "@/ui/components/IconWithBackground";
import { FeatherInbox } from "@subframe/core";
import { Badge } from "@/ui/components/Badge";
import { FeatherClock } from "@subframe/core";
import { useAuth } from "@/client/hooks/use-auth";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignUpClick?: () => void;
}

function LoginModal({ open, onOpenChange, onSignUpClick }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { signInWithMagicLink } = useAuth();

  const handleEmailSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
    if (email) {
      await signInWithMagicLink(email);
      setShowConfirmation(true);
    }
  };

  const handleTermsClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // TODO: Implement terms of service navigation
    window.open("/terms", "_blank");
  };

  const handlePrivacyClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // TODO: Implement privacy policy navigation
    window.open("/privacy", "_blank");
  };

  const handleGoogleSignIn = (event: React.MouseEvent<HTMLButtonElement>) => {
    // TODO: Implement Google OAuth sign in
  };

  const handleMetaSignIn = (event: React.MouseEvent<HTMLButtonElement>) => {
    // TODO: Implement Meta OAuth sign in
  };

  const handleSignUpClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (onSignUpClick) {
      onSignUpClick();
    }
  };

  const handleClose = () => {
    setShowConfirmation(false);
    setEmail("");
    onOpenChange(false);
  };

  return (
    <DialogLayout open={open} onOpenChange={onOpenChange}>
      {showConfirmation ? (
        <div className="flex h-full w-full flex-col items-center gap-6 bg-default-background px-6 py-12">
          <div className="flex w-full max-w-[448px] flex-col items-center justify-center gap-8">
            <div className="flex flex-col items-center gap-4">
              <IconWithBackground
                variant="success"
                size="x-large"
                icon={<FeatherInbox />}
              />
              <span className="text-heading-2 font-heading-2 text-default-font">
                Check your email
              </span>
            </div>
            <div className="flex w-full flex-col items-center gap-2">
              <span className="text-body font-body text-default-font text-center">
                We've sent a magic link to your email address. Click the link to
                sign in to your account.
              </span>
              <Badge variant="success" icon={<FeatherClock />}>
                Arrives in 1-2 minutes
              </Badge>
            </div>
            <div className="flex w-full flex-col items-center gap-4">
              <Button
                className="h-10 w-full flex-none"
                variant="neutral-primary"
                size="large"
                onClick={handleClose}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex h-full w-full flex-col items-start gap-4 bg-default-background px-6 py-12">
          <div className="flex w-full flex-col items-center justify-center gap-8">
            <div className="flex w-full flex-col items-start justify-center gap-2">
              <span className="text-heading-2 font-heading-2 text-default-font">
                Welcome back
              </span>
              <div className="flex flex-wrap items-start gap-1">
                <span className="text-body font-body text-subtext-color">
                  Sign in to your account to continue
                </span>
              </div>
            </div>
            <div className="flex w-full flex-col items-start justify-center gap-2">
              <OAuthSocialButton
                className="h-10 w-full flex-none"
                logo="https://res.cloudinary.com/subframe/image/upload/v1711417516/shared/z0i3zyjjqkobzuaecgno.svg"
                onClick={handleGoogleSignIn}
              >
                Sign in with Google
              </OAuthSocialButton>
              <OAuthSocialButton
                className="h-10 w-full flex-none"
                logo="https://res.cloudinary.com/subframe/image/upload/v1711417550/shared/epocfym1zba2deri6krm.png"
                onClick={handleMetaSignIn}
              >
                Sign in with Meta
              </OAuthSocialButton>
            </div>
            <div className="flex w-full items-center gap-2">
              <div className="flex h-px grow shrink-0 basis-0 flex-col items-center gap-2 bg-neutral-border" />
              <span className="text-body font-body text-subtext-color">
                or continue with email
              </span>
              <div className="flex h-px grow shrink-0 basis-0 flex-col items-center gap-2 bg-neutral-border" />
            </div>
            <div className="flex w-full flex-col items-start justify-center gap-6">
              <TextField
                className="h-auto w-full flex-none"
                label="Email address"
                helpText=""
              >
                <TextField.Input
                  placeholder="Enter your email"
                  value={email}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
                />
              </TextField>
              <Button
                className="h-10 w-full flex-none"
                size="large"
                onClick={handleEmailSubmit}
              >
                Continue
              </Button>
            </div>
            <div className="flex flex-wrap items-start gap-2">
              <span className="text-body font-body text-subtext-color">
                Don't have an account?
              </span>
              <LinkButton
                variant="brand"
                onClick={handleSignUpClick}
              >
                Sign Up
              </LinkButton>
            </div>
          </div>
        </div>
      )}
    </DialogLayout>
  );
}

export default LoginModal; 