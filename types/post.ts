export interface FeedPost {
  id: string;

  content: string;

  imageUrl: string | null;

  imagePublicId: string | null;

  visibility: "PUBLIC" | "PRIVATE";

  createdAt: string;

  author: {
    id: string;

    firstName: string;

    lastName: string;
  };

  _count: {
    comments: number;

    likes: number;
  };
}

export interface FeedResponse {
  posts: FeedPost[];

  nextCursor: string | null;
}
