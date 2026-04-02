/**
 * Auth Service
 * Handles login and session management
 */

export const login = async (email, password) =>










{
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (data.success && data.user) {
      // Store token and basic user info
      localStorage.setItem("token", data.token);

      // Backend now guarantees user object structure
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("user_role", data.user.role);
      localStorage.setItem("user_email", data.user.email);

      return {
        success: true,
        token: data.token,
        user: data.user
      };
    } else {
      return {
        success: false,
        message: data.message || "Invalid email or password"
      };
    }
  } catch (error) {
    console.error("[Auth Service] Login error:", error);
    return {
      success: false,
      message: "Connection to authentication server failed."
    };
  }
};

export const logout = () => {
  localStorage.clear();
  window.location.href = '/login';
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

export const getUserRole = () => {
  return localStorage.getItem('user_role') || 'faculty';
};

export const authService = {
  login,
  logout,
  isAuthenticated,
  getUserRole
};