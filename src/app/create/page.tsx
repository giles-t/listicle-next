"use client";

import React, { useState } from "react";
import { Button } from "@/ui/components/Button";
import { FeatherArrowLeft } from "@subframe/core";
import { TextFieldUnstyled } from "@/ui/components/TextFieldUnstyled";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/client/hooks/use-auth";
import { toast } from "@subframe/core";

function CreateList() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const handleBack = () => {
    router.back();
  };

  const handleCreate = async () => {
    if (!user) {
      toast.error("You must be logged in to create a list");
      return;
    }

    if (!title.trim()) {
      toast.error("Please enter a title for your list");
      return;
    }

    if (title.length < 5) {
      toast.error("Title must be at least 5 characters long");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/lists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          listType: 'ordered',
          isPublished: false
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create list');
      }

      const newList = await response.json();
      toast.success("List created successfully!");
      
      // TODO: Navigate to the list editing page when it's implemented
      // For now, navigate back to dashboard
      router.push('/dashboard');
      
    } catch (error) {
      console.error('Error creating list:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create list');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  const handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(event.target.value);
  };

  return (
    <div className="flex h-full w-full flex-col items-start">
      <div className="flex w-full items-center justify-between border-b border-solid border-neutral-border px-6 py-4">
        <Button
          variant="neutral-tertiary"
          icon={<FeatherArrowLeft />}
          onClick={handleBack}
        >
          Back
        </Button>
        <Button 
          onClick={handleCreate}
          loading={isSubmitting}
          disabled={isSubmitting || !title.trim()}
        >
          {isSubmitting ? "Creating..." : "Create"}
        </Button>
      </div>
      <div className="container max-w-none flex w-full grow shrink-0 basis-0 flex-col items-start bg-default-background">
        <div className="flex w-full grow shrink-0 basis-0 flex-col items-center gap-16 px-6 py-12">
          <div className="flex w-full max-w-[768px] flex-col items-start gap-8">
            <div className="flex w-full max-w-[768px] flex-col items-center gap-8">
              <span className="text-heading-2 font-heading-2 text-default-font">
                What do you want to list about?
              </span>
            </div>
            <div className="flex w-full flex-col items-start gap-4">
              <TextFieldUnstyled className="h-auto w-full flex-none">
                <TextFieldUnstyled.Input
                  className="text-heading-2 font-heading-2"
                  placeholder="Write a title..."
                  value={title}
                  onChange={handleTitleChange}
                  maxLength={100}
                />
              </TextFieldUnstyled>
              <TextFieldUnstyled className="h-auto w-full flex-none">
                <TextFieldUnstyled.Input
                  placeholder="Write a subtitle..."
                  value={description}
                  onChange={handleDescriptionChange}
                  maxLength={500}
                />
              </TextFieldUnstyled>
            </div>
          </div>
          <div className="flex w-full flex-col items-center gap-8">
            <div className="flex w-full max-w-[768px] flex-col items-start gap-8">
              <span className="text-heading-2 font-heading-2 text-default-font">
                Here&#39;s what other people are bulleting about
              </span>
            </div>
            <div className="flex w-full max-w-[768px] flex-col items-start gap-6">
              <div className="flex w-full flex-col items-start gap-1">
                <span className="text-heading-3 font-heading-3 text-default-font">
                  8 Chrome Extensions I Use Daily as a Developer (And Why You
                  Should Too!)
                </span>
                <span className="text-caption font-caption text-subtext-color">
                  As a developer, your toolkit can make or break your
                  productivity. Chrome extensions are small yet powerful tools
                  that simplify complex tasks, help debug issues, and make your
                  workflow more efficient. In this blog, let&#39;s dive into
                  some must-have Chrome extensions for developers
                </span>
              </div>
              <div className="flex w-full flex-col items-start gap-1">
                <span className="text-heading-3 font-heading-3 text-default-font">
                  The 5 Best No code AI Tools to use in 2025
                </span>
                <span className="text-caption font-caption text-subtext-color">
                  and why you shouldn&#39;t be worried about your job.
                </span>
              </div>
              <div className="flex w-full flex-col items-start gap-1">
                <span className="text-heading-3 font-heading-3 text-default-font">
                  Countries I&#39;ve visited so far in my lifetime
                </span>
                <span className="text-caption font-caption text-subtext-color">
                  A journey through cultures, landscapes, and unexpected
                  adventures across continents.
                </span>
              </div>
              <div className="flex w-full flex-col items-start gap-1">
                <span className="text-heading-3 font-heading-3 text-default-font">
                  Top 10 Programming Language Trends in 2024
                </span>
                <span className="text-caption font-caption text-subtext-color">
                  Exploring the evolving landscape of programming languages and
                  their impact on software development.
                </span>
              </div>
              <div className="flex w-full flex-col items-start gap-1">
                <span className="text-heading-3 font-heading-3 text-default-font">
                  Altcoins that are poised to explode in the 2025 bull market
                </span>
                <span className="text-caption font-caption text-subtext-color">
                  Is your portfolio ready for the upcoming bull run?
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateList; 