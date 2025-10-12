export interface User {
  id: string;
  email: string;
  username?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Waiver {
  id: string;
  version: number;
  title: string;
  body_markdown: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserWaiver {
  id: string;
  user_id: string;
  waiver_id: string;
  agreed_at: string;
  waiver_snapshot_md: string;
}

export interface YogaClass {
  id: string;
  name: string;
  brief_description: string;
  full_description: string;
  instructor: string;
  start_time: string;
  end_time: string;
  price: number;
  weekly_repeat: number;
  is_cancelled: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClassRegistration {
  id: string;
  class_id: string;
  user_id: string;
  payment_amount: number;
  payment_status: 'pending' | 'completed' | 'failed';
  square_payment_id?: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    id: string;
    username?: string;
    email?: string;
  };
}

export interface CreateClassData {
  name: string;
  brief_description: string;
  full_description: string;
  instructor: string;
  start_time: string;
  weekly_repeat: number;
  price: number;
}

export interface UpdateClassData extends Partial<CreateClassData> {
  id: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<any>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
}
