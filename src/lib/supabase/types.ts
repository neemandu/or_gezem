export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role: UserRole;
          settlement_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: UserRole;
          settlement_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: UserRole;
          settlement_id?: string | null;
          updated_at?: string;
        };
      };
      settlements: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          updated_at?: string;
        };
      };
    };
  };
};

export type UserRole = 'ADMIN' | 'SETTLEMENT_USER' | 'DRIVER';

export type AuthUser = {
  id: string;
  email: string;
  role: UserRole;
  settlement_id: string | null;
};
