const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Handle 401 errors by logging out
const handleAuthError = () => {
  localStorage.removeItem('accessToken');
  // Force page reload to clear any cached state
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

/* ---------------- LOGIN ---------------- */
export async function loginUser(data: unknown) {
    const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include", // IMPORTANT (for cookie)
        body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || "Login failed");
    }

    return result;
}

/* ---------------- REGISTER ---------------- */
export async function registerUser(data: unknown) {
    const response = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Register failed");
    }

    return result;
}

/* ---------------- REFRESH TOKEN ---------------- */
export async function refreshToken() {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error("Session expired");
    }

    return result;
}

/* ---------------- LOGOUT ---------------- */
export async function logoutUser() {
    const response = await fetch(`${BASE_URL}/auth/logout`, {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Logout failed");
    }

    return result;
}

/* ---------------- PROFILE ---------------- */
export async function getUserProfile() {
    const response = await fetch(`${BASE_URL}/auth/profile`, {
        method: "GET",
        headers: getAuthHeaders(),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Failed to fetch profile");
    }

    return result;
}