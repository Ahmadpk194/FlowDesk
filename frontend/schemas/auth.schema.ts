import { z } from "zod";

/* ---------------- LOGIN SCHEMA ---------------- */
export const loginSchema = z.object({
    email: z
        .string()
        .min(1, "Email is required")
        .email("Invalid email address"),

    password: z
        .string()
        .min(6, "Password must be at least 6 characters"),
});

/* ---------------- REGISTER SCHEMA ---------------- */
export const registerSchema = z
    .object({
        fullName: z
            .string()
            .min(2, "Full name must be at least 2 characters"),

        email: z
            .string()
            .min(1, "Email is required")
            .email("Invalid email address"),

        password: z
            .string()
            .min(6, "Password must be at least 6 characters"),

        confirmPassword: z
            .string()
            .min(6, "Confirm password is required"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

/* ---------------- TYPES (OPTIONAL BUT BEST PRACTICE) ---------------- */
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;