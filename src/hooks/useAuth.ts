import { useEffect, useState } from "react";
import { getCurrentUser, subscribeAuth, type Account } from "@/services/auth";

export function useAuth() {
  const [user, setUser] = useState<Account | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(getCurrentUser());
    setReady(true);
    return subscribeAuth(() => setUser(getCurrentUser()));
  }, []);

  return { user, ready, isAuthenticated: !!user };
}
