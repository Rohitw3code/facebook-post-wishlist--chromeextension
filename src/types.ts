export interface FacebookPost {
  id: string;
  content: string;
  timestamp: string;
  author: string;
  profileLink: string;
  imageUrl?: string;
  likes?: number;
  comments?: number;
  shares?: number;
  postUrl?: string;
}