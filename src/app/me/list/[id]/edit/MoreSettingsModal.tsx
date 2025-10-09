import React from "react";
import { Button } from "@/ui/components/Button";
import { Switch } from "@/ui/components/Switch";
import { TextArea } from "@/ui/components/TextArea";
import { TextField } from "@/ui/components/TextField";
import { Drawer } from "@/ui/components/Drawer";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPinned: boolean;
  onPinnedChange: (pinned: boolean) => void;
  allowComments: boolean;
  onAllowCommentsChange: (allow: boolean) => void;
  seoTitle: string;
  onSeoTitleChange: (title: string) => void;
  seoDescription: string;
  onSeoDescriptionChange: (description: string) => void;
  onSave: () => void;
  loading?: boolean;
};

export default function MoreSettingsModal({
  open,
  onOpenChange,
  isPinned,
  onPinnedChange,
  allowComments,
  onAllowCommentsChange,
  seoTitle,
  onSeoTitleChange,
  seoDescription,
  onSeoDescriptionChange,
  onSave,
  loading = false,
}: Props) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} className="items-end">
      <Drawer.Content onInteractOutside={(event) => event.preventDefault()}>
        <div className="absolute inset-0 flex max-w-[576px] flex-col ml-auto">
        {/* Header - Fixed */}
        <div className="flex w-full items-center justify-between border-b border-neutral-border px-6 py-4 flex-shrink-0 bg-default-background">
          <span className="text-heading-2 font-heading-2 text-default-font">
            List Settings
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="neutral-tertiary"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={onSave} loading={loading}>
              Save Changes
            </Button>
          </div>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto bg-default-background">
          <div className="flex w-full flex-col items-start gap-8 px-6 py-6">
            <div className="flex w-full flex-col items-start gap-6">
              <span className="text-heading-3 font-heading-3 text-default-font">
                General
              </span>
              <div className="flex w-full items-center gap-2">
                <div className="flex grow shrink-0 basis-0 flex-col items-start">
                  <span className="text-body-bold font-body-bold text-default-font">
                    Pin list
                  </span>
                  <span className="text-caption font-caption text-subtext-color">
                    Pinning a list keeps it at the top of your profile until you
                    specify otherwise.
                  </span>
                </div>
                <Switch checked={isPinned} onCheckedChange={onPinnedChange} />
              </div>
              <div className="flex w-full items-center gap-2">
                <div className="flex grow shrink-0 basis-0 flex-col items-start">
                  <span className="text-body-bold font-body-bold text-default-font">
                    Allow comments
                  </span>
                  <span className="text-caption font-caption text-subtext-color">
                    Let readers comment on your list
                  </span>
                </div>
                <Switch checked={allowComments} onCheckedChange={onAllowCommentsChange} />
              </div>
            </div>
            {/* TODO This will be implemented later */}
            {/* <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-border" />
            <div className="flex w-full flex-col items-start gap-6">
              <span className="text-heading-3 font-heading-3 text-default-font">
                SEO
              </span>
              <TextField
                className="h-auto w-full flex-none"
                label="SEO Title"
                helpText="The SEO Title is used in place of your Title on search engine results pages, such as a Google search. SEO titles over 60 characters will be truncated. SEO titles between 40 and 50 characters with commonly searched words have the best click-through-rates."
              >
                <TextField.Input
                  placeholder="{title} {subtitle} | by {author} | Bullet"
                  value={seoTitle}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => onSeoTitleChange(event.target.value)}
                />
              </TextField>
              <TextArea
                className="h-auto w-full flex-none"
                label="SEO Description"
                helpText="The SEO Description is used in place of your Subtitle on search engine results pages. Good SEO descriptions utilize keywords, summarize the story and are between 140-156 characters long."
              >
                <TextArea.Input
                  placeholder={'{title}. "{subtitle}" by {author}'}
                  value={seoDescription}
                  onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => onSeoDescriptionChange(event.target.value)}
                />
              </TextArea>
            </div> */}
          </div>
          <div className="h-4" /> {/* Bottom padding */}
          </div>
        </div>
      </Drawer.Content>
    </Drawer>
  );
}
