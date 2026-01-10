export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            flashcards: {
                Row: {
                    id: number
                    sdg_number: number
                    front_text: string
                    icon_name: string
                    back_text: string
                    color_theme: string
                }
                Insert: {
                    id?: number
                    sdg_number: number
                    front_text: string
                    icon_name: string
                    back_text: string
                    color_theme?: string
                }
                Update: {
                    id?: number
                    sdg_number?: number
                    front_text?: string
                    icon_name?: string
                    back_text?: string
                    color_theme?: string
                }
                Relationships: []
            }
            profiles: {
                Row: {
                    id: string
                    username: string | null
                    xp: number
                    coins: number
                    streak_count: number
                    last_active_at: string | null
                    unlocked_avatars: string[] | null
                    avatar_url: string | null
                    created_at: string
                    full_name: string | null
                }
                Insert: {
                    id: string
                    username?: string | null
                    xp?: number
                    coins?: number
                    streak_count?: number
                    last_active_at?: string | null
                    avatar_url?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    username?: string | null
                    xp?: number
                    coins?: number
                    streak_count?: number
                    last_active_at?: string | null
                    avatar_url?: string | null
                    created_at?: string
                }
            }
            quests: {
                Row: {
                    id: number
                    sdg_number: number
                    title: string
                    description: string | null
                    bg_gradient_color: string | null
                    icon: string | null
                    type: 'quiz' | 'action'
                }
                Insert: {
                    id?: number
                    sdg_number: number
                    title: string
                    description?: string | null
                    bg_gradient_color?: string | null
                    icon?: string | null
                    type?: 'quiz' | 'action'
                }
                Update: {
                    id?: number
                    sdg_number?: number
                    title?: string
                    description?: string | null
                    bg_gradient_color?: string | null
                    icon?: string | null
                    type?: 'quiz' | 'action'
                }
            }
            questions: {
                Row: {
                    id: number
                    quest_id: number
                    question_text: string
                    options: string[]
                    correct_answer_index: number
                    explanation: string | null
                }
                Insert: {
                    id?: number
                    quest_id: number
                    question_text: string
                    options: string[]
                    correct_answer_index: number
                    explanation?: string | null
                }
                Update: {
                    id?: number
                    quest_id?: number
                    question_text?: string
                    options?: string[]
                    correct_answer_index?: number
                    explanation?: string | null
                }
            }
            achievements: {
                Row: {
                    id: string
                    title: string
                    description: string
                    icon: string
                    xp_reward: number
                }
                Insert: {
                    id: string
                    title: string
                    description: string
                    icon: string
                    xp_reward?: number
                }
                Update: {
                    id?: string
                    title?: string
                    description?: string
                    icon?: string
                    xp_reward?: number
                }
            }
            user_achievements: {
                Row: {
                    id: number
                    user_id: string
                    achievement_id: string
                    unlocked_at: string
                }
                Insert: {
                    id?: number
                    user_id: string
                    achievement_id: string
                    unlocked_at?: string
                }
                Update: {
                    id?: number
                    user_id?: string
                    achievement_id?: string
                    unlocked_at?: string
                }
            }
            user_progress: {
                Row: {
                    id: number
                    user_id: string
                    quest_id: number
                    score: number
                    completed_at: string
                }
                Insert: {
                    id?: number
                    user_id: string
                    quest_id: number
                    score: number
                    completed_at?: string
                }
                Update: {
                    id?: number
                    user_id?: string
                    quest_id?: number
                    score?: number
                    completed_at?: string
                }
            }
            user_scans: {
                Row: {
                    id: string
                    user_id: string
                    category: string
                    object_name: string
                    confidence: number
                    scanned_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    category: string
                    object_name: string
                    confidence: number
                    scanned_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    category?: string
                    object_name?: string
                    confidence?: number
                    scanned_at?: string
                }
            }
        }
    }
}
