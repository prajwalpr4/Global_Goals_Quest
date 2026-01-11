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
                    last_box_open_at: string | null
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
                    last_box_open_at?: string | null
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
                    last_box_open_at?: string | null
                }
                Relationships: []
            }
            story_nodes: {
                Row: {
                    id: string
                    sdg_number: number
                    node_order: number
                    content: string
                    choice_a_text: string | null
                    choice_b_text: string | null
                    next_node_a_id: string | null
                    next_node_b_id: string | null
                    is_ending: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    sdg_number: number
                    node_order?: number
                    content: string
                    choice_a_text?: string | null
                    choice_b_text?: string | null
                    next_node_a_id?: string | null
                    next_node_b_id?: string | null
                    is_ending?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    sdg_number?: number
                    node_order?: number
                    content?: string
                    choice_a_text?: string | null
                    choice_b_text?: string | null
                    next_node_a_id?: string | null
                    next_node_b_id?: string | null
                    is_ending?: boolean
                    created_at?: string
                }
                Relationships: []
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
                Relationships: []
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
                Relationships: []
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
                Relationships: []
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
                Relationships: []
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
                Relationships: []
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
                Relationships: []
            }
            user_artworks: {
                Row: {
                    id: string
                    user_id: string
                    image_data: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    image_data: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    image_data?: string
                    created_at?: string
                }
                Relationships: []
            }
        }
        Views: {}
        Functions: {}
        Enums: {}
        CompositeTypes: {}
    }
}
