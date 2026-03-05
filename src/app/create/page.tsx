"use client";

import React, { useState } from "react";
import { Button } from "@/ui/components/Button";
import { IconWithBackground } from "@/ui/components/IconWithBackground";
import { RadioCardGroup } from "@/ui/components/RadioCardGroup";
import { TextArea } from "@/ui/components/TextArea";
import { TextField } from "@/ui/components/TextField";
import {
  FeatherArrowLeft,
  FeatherEdit3,
  FeatherHash,
  FeatherImage,
  FeatherList,
  FeatherListOrdered,
  FeatherListStart,
  FeatherMessageSquare,
  FeatherPlus,
  FeatherTarget,
  FeatherTrendingUp,
} from "@subframe/core";
import { toast } from "@subframe/core";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/client/hooks/use-auth";

type ListType = "ordered" | "unordered" | "reversed";

function CreateList() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [listType, setListType] = useState<ListType>("ordered");
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
      const response = await fetch("/api/lists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          listType,
          isPublished: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create list");
      }

      const newList = await response.json();
      toast.success("List created successfully!");

      router.push(`/me/list/${newList.id}/edit`);
    } catch (error) {
      console.error("Error creating list:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create list"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-full w-full flex-col items-start bg-default-background">
      <div className="flex w-full items-center justify-between border-b border-solid border-neutral-border px-6 py-4">
        <Button
          variant="neutral-tertiary"
          icon={<FeatherArrowLeft />}
          onClick={handleBack}
        >
          Back
        </Button>
        <Button
          icon={<FeatherPlus />}
          onClick={handleCreate}
          loading={isSubmitting}
          disabled={isSubmitting || !title.trim()}
        >
          {isSubmitting ? "Creating..." : "Create"}
        </Button>
      </div>
      <div className="flex w-full grow shrink-0 basis-0 items-start mobile:flex-col mobile:flex-nowrap mobile:gap-0">
        <div className="flex max-w-[576px] flex-col items-start gap-8 px-12 py-12 mobile:max-w-none">
          <div className="flex w-full flex-col items-start gap-2">
            <span className="text-heading-2 font-heading-2 text-default-font">
              Create your listicle
            </span>
            <span className="text-body font-body text-subtext-color">
              Share your ideas in a structured, engaging format
            </span>
          </div>
          <div className="flex w-full flex-col items-start gap-6">
            <TextField
              className="h-auto w-full flex-none"
              variant="filled"
              label="Title"
              helpText="Give your list a catchy, specific title (5-100 characters)"
            >
              <TextField.Input
                placeholder="e.g. 10 Essential Tips for Remote Work"
                value={title}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setTitle(event.target.value)
                }
                maxLength={100}
              />
            </TextField>
            <TextArea
              className="h-auto w-full flex-none"
              variant="filled"
              label="Subtitle (optional)"
              helpText="Add context or a compelling hook (max 500 characters)"
            >
              <TextArea.Input
                placeholder="Describe what readers will learn or why this list matters..."
                value={description}
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setDescription(event.target.value)
                }
                maxLength={500}
              />
            </TextArea>
            <div className="flex w-full flex-col items-start gap-4">
              <span className="text-body-bold font-body-bold text-default-font">
                List type
              </span>
              <RadioCardGroup
                className="h-auto w-full flex-none"
                value={listType}
                onValueChange={(value: string) =>
                  setListType(value as ListType)
                }
              >
                <div className="flex grow shrink-0 basis-0 flex-col items-start gap-3">
                  <RadioCardGroup.RadioCard
                    hideRadio={true}
                    value="unordered"
                    checked={listType === "unordered"}
                  >
                    <div className="flex grow shrink-0 basis-0 items-center gap-4">
                      <IconWithBackground
                        variant="neutral"
                        size="medium"
                        icon={<FeatherList />}
                        square={true}
                      />
                      <div className="flex grow shrink-0 basis-0 flex-col items-start">
                        <span className="text-body-bold font-body-bold text-default-font">
                          Bullet list
                        </span>
                        <span className="text-caption font-caption text-subtext-color">
                          Items displayed with bullet points
                        </span>
                      </div>
                    </div>
                  </RadioCardGroup.RadioCard>
                  <RadioCardGroup.RadioCard hideRadio={true} value="ordered" checked={listType === "ordered"}>
                    <div className="flex grow shrink-0 basis-0 items-center gap-4">
                      <IconWithBackground
                        variant="neutral"
                        size="medium"
                        icon={<FeatherListOrdered />}
                        square={true}
                      />
                      <div className="flex grow shrink-0 basis-0 flex-col items-start">
                        <span className="text-body-bold font-body-bold text-default-font">
                          Numbered list
                        </span>
                        <span className="text-caption font-caption text-subtext-color">
                          Items ranked from 1 to N
                        </span>
                      </div>
                    </div>
                  </RadioCardGroup.RadioCard>
                  <RadioCardGroup.RadioCard hideRadio={true} value="reversed" checked={listType === "reversed"}>
                    <div className="flex grow shrink-0 basis-0 items-center gap-4">
                      <IconWithBackground
                        variant="neutral"
                        size="medium"
                        icon={<FeatherListStart />}
                        square={true}
                      />
                      <div className="flex grow shrink-0 basis-0 flex-col items-start">
                        <span className="text-body-bold font-body-bold text-default-font">
                          Countdown list
                        </span>
                        <span className="text-caption font-caption text-subtext-color">
                          Items ranked from N down to 1
                        </span>
                      </div>
                    </div>
                  </RadioCardGroup.RadioCard>
                </div>
              </RadioCardGroup>
            </div>
          </div>
        </div>
        <div className="flex h-px flex-col items-center gap-2 bg-neutral-border mobile:hidden" />
        <div className="flex grow shrink-0 basis-0 flex-col items-start gap-8 bg-neutral-50 px-12 py-12">
          <div className="flex w-full flex-col items-start gap-2">
            <span className="text-heading-2 font-heading-2 text-default-font">
              Tips for great listicles
            </span>
            <span className="text-body font-body text-subtext-color">
              Follow these guidelines to create engaging content
            </span>
          </div>
          <div className="flex w-full flex-col items-start gap-6">
            <div className="flex w-full items-start gap-4">
              <IconWithBackground
                variant="brand"
                size="medium"
                icon={<FeatherTarget />}
              />
              <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1">
                <span className="text-body-bold font-body-bold text-default-font">
                  Keep titles specific
                </span>
                <span className="text-body font-body text-subtext-color">
                  Vague titles like &quot;Best Apps&quot; perform worse than
                  &quot;Best Apps for Project Management in 2024&quot;
                </span>
              </div>
            </div>
            <div className="flex w-full items-start gap-4">
              <IconWithBackground
                variant="brand"
                size="medium"
                icon={<FeatherHash />}
              />
              <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1">
                <span className="text-body-bold font-body-bold text-default-font">
                  Use numbers when they add value
                </span>
                <span className="text-body font-body text-subtext-color">
                  Numbers create expectations and make content more scannable
                </span>
              </div>
            </div>
            <div className="flex w-full items-start gap-4">
              <IconWithBackground
                variant="brand"
                size="medium"
                icon={<FeatherMessageSquare />}
              />
              <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1">
                <span className="text-body-bold font-body-bold text-default-font">
                  Add a compelling subtitle
                </span>
                <span className="text-body font-body text-subtext-color">
                  Use the subtitle to explain why readers should care about your
                  list
                </span>
              </div>
            </div>
            <div className="flex w-full items-start gap-4">
              <IconWithBackground
                variant="brand"
                size="medium"
                icon={<FeatherImage />}
              />
              <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1">
                <span className="text-body-bold font-body-bold text-default-font">
                  Visual content matters
                </span>
                <span className="text-body font-body text-subtext-color">
                  Plan to add images, videos, or graphics to each list item
                </span>
              </div>
            </div>
            <div className="flex w-full items-start gap-4">
              <IconWithBackground
                variant="brand"
                size="medium"
                icon={<FeatherTrendingUp />}
              />
              <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1">
                <span className="text-body-bold font-body-bold text-default-font">
                  Start strong, end stronger
                </span>
                <span className="text-body font-body text-subtext-color">
                  Your first and last items should be your most compelling
                </span>
              </div>
            </div>
            <div className="flex w-full items-start gap-4">
              <IconWithBackground
                variant="brand"
                size="medium"
                icon={<FeatherEdit3 />}
              />
              <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1">
                <span className="text-body-bold font-body-bold text-default-font">
                  You can change this later
                </span>
                <span className="text-body font-body text-subtext-color">
                  Don&apos;t worry about getting everything perfect now. You can
                  always edit your listicle after creating it
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
