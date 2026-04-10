import { createClient } from '../supabase';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

class AuthManager {
  private static instance: AuthManager;
  private listeners: Set<(user: SupabaseUser | null, session: Session | null, loading: boolean) => void> = new Set();
  private user: SupabaseUser | null = null;
  private session: Session | null = null;
  private loading = true;
  private initialized = false;
  private subscription: { unsubscribe: () => void } | null = null;

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  private constructor() {
    this.init();
  }

  private async init() {
    if (this.initialized) return;

    const supabase = createClient();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      this.user = session?.user || null;
      this.session = session;
      this.loading = false;
      this.notifyListeners();
    });

    this.subscription = subscription;
    this.initialized = true;
  }

  destroy() {
    this.subscription?.unsubscribe();
    this.subscription = null;
    this.listeners.clear();
    this.initialized = false;
  }

  subscribe(callback: (user: SupabaseUser | null, session: Session | null, loading: boolean) => void) {
    this.listeners.add(callback);
    // Immediately call with current state
    callback(this.user, this.session, this.loading);
    
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(callback => callback(this.user, this.session, this.loading));
  }

  getUser() {
    return this.user;
  }

  getSession() {
    return this.session;
  }

  isLoading() {
    return this.loading;
  }

  /**
   * Force refresh the session to get updated user metadata.
   * Call this after server-side updates to user metadata (e.g., avatar upload).
   */
  async refreshSession() {
    const supabase = createClient();
    const { data, error } = await supabase.auth.refreshSession();
    if (!error && data.session) {
      this.user = data.session.user;
      this.session = data.session;
      this.notifyListeners();
    }
    return { data, error };
  }
}

export const authManager = AuthManager.getInstance(); 