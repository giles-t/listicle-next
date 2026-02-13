"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/ui/components/Badge";
import { ListicleCardComponent as ListicleCard } from "@/ui/components/ListicleCardComponent";
import { AddBookmarkButton } from "@/client/components/AddBookmarkButton";

interface ProfileListCardProps {
  listId: string;
  href: string;
  image: string;
  category: string;
  title: string;
  description: string;
  author: string;
  authorAvatar?: string;
  views: string;
  likes: string;
  comments: string;
  date: string;
}

export function ProfileListCard({
  listId,
  href,
  image,
  category,
  title,
  description,
  author,
  views,
  likes,
  comments,
  date,
}: ProfileListCardProps) {
  return (
    <Link
      href={href}
      className="w-full hover:opacity-90 transition-opacity"
    >
      <ListicleCard
        image={image}
        category={
          <Badge variant="neutral" icon={null}>
            {category.toUpperCase()}
          </Badge>
        }
        title={title}
        description={description}
        author={author}
        views={views}
        likes={likes}
        comments={comments}
        date={date}
        bookmarkButton={
          <div onClick={(e) => e.preventDefault()}>
            <AddBookmarkButton
              listId={listId}
              size="small"
            />
          </div>
        }
      />
    </Link>
  );
}
