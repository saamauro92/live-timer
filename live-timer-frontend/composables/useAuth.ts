export const useAuth = () => {
  const { user, isAuthenticated, isLoading, setUser, clearUser, setLoading, isInitialized, markInitialized } = useAuthState();

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await $fetch("/api/auth/login", {
        method: "POST",
        body: { email, password },
      });

      if (response.success && response.token) {
        // Store token in a regular cookie (not httpOnly for client-side access)
        const token = useCookie("auth-token", {
          maxAge: 60 * 60 * 24 * 7, // 7 days
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });
        token.value = response.token;
        setUser(response.user);
        return { success: true, user: response.user };
      } else {
        return { success: false, error: response.message || "Login failed" };
      }
    } catch (error: any) {
      console.error("Login error:", error);
      return {
        success: false,
        error: error.data?.message || error.message || "Login failed",
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      const response = await $fetch("/api/auth/register", {
        method: "POST",
        body: { email, password, name },
      });

      if (response.success) {
        if (response.requiresEmailVerification) {
          // Email verification required - don't set token or user
          return {
            success: true,
            requiresEmailVerification: true,
            message: response.message,
            user: response.user,
          };
        } else if (response.token) {
          // Direct registration without email verification
          const token = useCookie("auth-token", {
            maxAge: 60 * 60 * 24 * 7, // 7 days
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
          });
          token.value = response.token;
          setUser(response.user);
          return { success: true, user: response.user };
        }
      }

      return { success: false, error: response.message || "Registration failed" };
    } catch (error: any) {
      console.error("Registration error:", error);
      return {
        success: false,
        error: error.data?.message || error.message || "Registration failed",
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await $fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      const token = useCookie("auth-token");
      token.value = null;
      clearUser();
      await navigateTo("/login");
    }
  };

  const fetchUser = async () => {
    try {
      const response = await $fetch("/api/auth/me");
      if (response.success && response.user) {
        setUser(response.user);
        return response.user;
      } else {
        clearUser();
        return null;
      }
    } catch (error) {
      console.error("Fetch user error:", error);
      clearUser();
      return null;
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const config = useRuntimeConfig();
      const apiBase = config.public.apiBase;
      const googleClientId = config.public.googleClientId;

      if (!googleClientId) {
        throw new Error("Google Client ID is not configured");
      }

      // Get the auth URL from backend to ensure consistency
      const response = await $fetch(`${apiBase}/auth/google/url`, {
        method: "GET",
      });

      if (response.success && response.authUrl) {
        window.location.href = response.authUrl;
      } else {
        throw new Error("Failed to get Google auth URL");
      }
    } catch (error: unknown) {
      console.error("Google login error:", error);
      setLoading(false);
      throw error;
    }
  };

  const loginWithGoogleCode = async (code: string) => {
    setLoading(true);
    try {
      // Exchange authorization code for tokens via backend
      const response = await $fetch("/api/auth/google/callback", {
        method: "POST",
        body: { code },
      });

      if (response.success && response.token) {
        const token = useCookie("auth-token", {
          maxAge: 60 * 60 * 24 * 7, // 7 days
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });
        token.value = response.token;
        setUser(response.user);
        return { success: true, user: response.user };
      } else {
        return { success: false, error: response.message || "Google authentication failed" };
      }
    } catch (error: any) {
      console.error("Google OAuth code exchange error:", error);
      return {
        success: false,
        error: error.data?.message || error.message || "Google authentication failed",
      };
    } finally {
      setLoading(false);
    }
  };

  const loadGoogleScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.google) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Google script"));
      document.head.appendChild(script);
    });
  };

  // Initialize auth state on app start
  const initializeAuth = async () => {
    if (isInitialized()) return;

    markInitialized();
    const token = useCookie("auth-token");
    if (token.value) {
      await fetchUser();
    }
  };

  return {
    user: readonly(user),
    isAuthenticated,
    isLoading: readonly(isLoading),
    login,
    register,
    logout,
    fetchUser,
    initializeAuth,
    loginWithGoogle,
    loginWithGoogleCode,
  };
};
