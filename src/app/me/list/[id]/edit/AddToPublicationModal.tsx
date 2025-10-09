"use client";

import React, { useState, useEffect } from "react";
import { Avatar } from "@/ui/components/Avatar";
import { Button } from "@/ui/components/Button";
import { RadioCardGroup } from "@/ui/components/RadioCardGroup";
import { Dialog } from "@/ui/components/Dialog";
import { IconWithBackground } from "@/ui/components/IconWithBackground";
import { FeatherBookmark } from "@subframe/core";

type Publication = {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  slug: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPublicationId?: string | null;
  onConfirm: (publicationId: string) => void;
  loading?: boolean;
};

export default function AddToPublicationModal({
  open,
  onOpenChange,
  currentPublicationId,
  onConfirm,
  loading = false,
}: Props) {
  const [selectedPublicationId, setSelectedPublicationId] = useState<string>("");
  const [publications, setPublications] = useState<Publication[]>([]);
  const [isLoadingPublications, setIsLoadingPublications] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's publications when modal opens
  useEffect(() => {
    if (open) {
      fetchPublications();
      setSelectedPublicationId(currentPublicationId || "");
    }
  }, [open, currentPublicationId]);

  const fetchPublications = async () => {
    try {
      setIsLoadingPublications(true);
      setError(null);
      
      const response = await fetch('/api/publications', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch publications');
      }

      const data = await response.json();
      setPublications(data);
    } catch (err) {
      console.error('Error fetching publications:', err);
      setError(err instanceof Error ? err.message : 'Failed to load publications');
    } finally {
      setIsLoadingPublications(false);
    }
  };

  const handleConfirm = () => {
    if (selectedPublicationId) {
      onConfirm(selectedPublicationId);
    }
  };

  const handleCancel = () => {
    setSelectedPublicationId(currentPublicationId || "");
    onOpenChange(false);
  };

  const hasChanges = selectedPublicationId !== (currentPublicationId || "");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content onInteractOutside={(event) => event.preventDefault()}>
        <div className="flex h-full w-full flex-col items-start gap-6 bg-default-background px-6 py-6">
          <span className="text-heading-3 font-heading-3 text-default-font">
            Add to publication
          </span>
          
          {error && (
            <div className="w-full p-3 bg-error-50 border border-error-200 rounded-md">
              <span className="text-caption font-caption text-error-600">
                {error}
              </span>
            </div>
          )}

          <div className="flex w-full flex-col items-start gap-4">
            {isLoadingPublications ? (
              <div className="flex w-full items-center justify-center py-8">
                <span className="text-body font-body text-subtext-color">
                  Loading publications...
                </span>
              </div>
            ) : publications.length === 0 ? (
              <div className="flex w-full flex-col items-center gap-4 rounded-md border border-solid border-neutral-border bg-neutral-50 px-6 py-8">
                <IconWithBackground
                  variant="neutral"
                  size="large"
                  icon={<FeatherBookmark />}
                />
                <div className="flex flex-col items-center gap-2">
                  <span className="text-heading-3 font-heading-3 text-default-font">
                    No publications yet
                  </span>
                  <span className="w-full whitespace-pre-wrap text-body font-body text-subtext-color text-center">
                    {"You need to be a member of a publication to add lists to it."}
                  </span>
                </div>
              </div>
            ) : (
              <RadioCardGroup
                className="h-auto w-full flex-none"
                value={selectedPublicationId}
                onValueChange={setSelectedPublicationId}
              >
                <div className="flex grow shrink-0 basis-0 flex-col items-start gap-4">
                  {publications.map((publication) => (
                    <RadioCardGroup.RadioCard 
                      key={publication.id}
                      hideRadio={true} 
                      value={publication.id}
                    >
                      <div className="flex grow shrink-0 basis-0 items-center gap-4">
                        <Avatar
                          image={publication.logo_url || undefined}
                          square={true}
                        >
                          {publication.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <div className="flex grow shrink-0 basis-0 flex-col items-start">
                          <span className="text-body-bold font-body-bold text-default-font">
                            {publication.name}
                          </span>
                          {publication.description && (
                            <span className="text-caption font-caption text-subtext-color">
                              {publication.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </RadioCardGroup.RadioCard>
                  ))}
                </div>
              </RadioCardGroup>
            )}
          </div>
          
          <div className="flex w-full items-center justify-end gap-2">
            <Button
              variant="neutral-tertiary"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm}
              loading={loading}
              disabled={loading || !selectedPublicationId || !hasChanges || publications.length === 0}
            >
              Add to publication
            </Button>
          </div>
        </div>
      </Dialog.Content>
    </Dialog>
  );
}
