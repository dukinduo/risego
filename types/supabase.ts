export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
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
