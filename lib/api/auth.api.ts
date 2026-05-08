const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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