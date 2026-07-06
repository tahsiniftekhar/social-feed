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
  likedByCurrentUser: boolean;
  _count: {
    comments: number;
    likes: number;
  };
}

export interface FeedResponse {
  posts: FeedPost[];
  nextCursor: string | null;
}

export interface FeedComment {
  id: string;
  postId: string;
  parentCommentId: string | null;
  content: string;
  createdAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
  };
  likedByCurrentUser: boolean;
  likesCount: number;
  replies: FeedComment[];
}

export interface LikeUser {
  id: string;
  firstName: string;
  lastName: string;
}
