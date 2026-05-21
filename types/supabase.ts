export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      follows: {
        Row: {
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          follower_id?: string
          following_id?: string
          created_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          username: string
          full_name: string
          is_verified: boolean
          caption: string | null
          image_url: string | null
          likes: number
          comments: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          username: string
          full_name: string
          is_verified?: boolean
          caption?: string | null
          image_url?: string | null
          likes?: number
          comments?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          username?: string
          full_name?: string
          is_verified?: boolean
          caption?: string | null
          image_url?: string | null
          likes?: number
          comments?: number
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          username: string
          full_name: string
          avatar_url: string | null
          status: 'active' | 'banned' | 'terminated'
          is_verified: boolean
          role: 'user' | 'admin'
          created_at: string
        }
        Insert: {
          id: string
          email: string
          username: string
          full_name: string
          avatar_url?: string | null
          status?: 'active' | 'banned' | 'terminated'
          is_verified?: boolean
          role?: 'user' | 'admin'
          created_at?: string
        }
        Update: {
          email?: string
          username?: string
          full_name?: string
          avatar_url?: string | null
          status?: 'active' | 'banned' | 'terminated'
          is_verified?: boolean
          role?: 'user' | 'admin'
          created_at?: string
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}
