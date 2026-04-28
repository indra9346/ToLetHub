import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, fullName: string, role?: "tenant" | "owner") => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdmin = useCallback((userId: string) => {
    supabase.rpc("has_role", { _user_id: userId, _role: "admin" })
      .then(({ data }) => setIsAdmin(!!data));
  }, []);

  useEffect(() => {
    // Single listener — fires immediately with INITIAL_SESSION, avoids double load
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          checkAdmin(session.user.id);
        } else {
          setIsAdmin(false);
        }
        setLoading(false);
      }
    );

    // Safety: also fetch current session in case listener is slow
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession((prev) => prev ?? session);
      setUser((prev) => prev ?? session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [checkAdmin]);

  const signUp = async (email: string, password: string, fullName: string, role: "tenant" | "owner" = "tenant") => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, intended_role: role },
        emailRedirectTo: window.location.origin,
      },
    });
    // If owner signup AND we have a session immediately (auto-confirm on),
    // grant the admin (owner) role right away. Otherwise stash it for first sign-in.
    if (!error && role === "owner") {
      try {
        if (data.session?.user?.id) {
          await supabase.from("user_roles").insert({
            user_id: data.session.user.id,
            role: "admin" as any,
          });
        } else {
          localStorage.setItem("pending_owner_role", "1");
        }
      } catch {
        localStorage.setItem("pending_owner_role", "1");
      }
    }
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    // Apply pending owner role if signup happened before email confirm
    if (!error && data.user && localStorage.getItem("pending_owner_role") === "1") {
      try {
        await supabase.from("user_roles").insert({
          user_id: data.user.id,
          role: "admin" as any,
        });
      } catch {
        // ignore duplicates
      }
      localStorage.removeItem("pending_owner_role");
    }
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
