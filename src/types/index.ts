export interface User {
  id: string;
  email: string;
  phone?: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
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
    full_name?: string;
    email?: string;
    phone?: string;
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
  signUp: (email: string, password: string, phone: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}
