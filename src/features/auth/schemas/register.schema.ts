import { z } from 'zod';

export const step1Schema = z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
});

export const step2Schema = z.object({
    gender: z.enum(['male', 'female', 'non-binary', 'prefer-not-to-say'] as const, {
        errorMap: () => ({ message: 'Please select your gender' }),
    }),
    dob: z.string().refine(
        (val) => {
            const date = new Date(val);
            if (isNaN(date.getTime())) return false;
            const today = new Date();
            if (date >= today) return false;
            let age = today.getFullYear() - date.getFullYear();
            const m = today.getMonth() - date.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < date.getDate())) age--;
            return age >= 13;
        },
        'You must be at least 13 years old',
    ),
    country: z.string().min(2, 'Country is required'),
    city: z.string().min(2, 'City is required'),
    role: z.enum(['operator', 'supervisor', 'admin'] as const, {
        errorMap: () => ({ message: 'Please select a system role' }),
    }),
});

export const step3Schema = z.object({
    password: z
        .string()
        .min(8, 'Minimum 8 characters required')
        .regex(/[A-Z]/, 'Must contain an uppercase letter')
        .regex(/[a-z]/, 'Must contain a lowercase letter')
        .regex(/[0-9]/, 'Must contain a number')
        .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
    confirmPassword: z.string(),
    terms: z.boolean().refine((val) => val === true, {
        message: 'You must agree to the Terms of Service',
    }),
    notifications: z.boolean().optional(),
});

export const registrationSchema = step1Schema
    .merge(step2Schema)
    .merge(step3Schema)
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    });

export type RegistrationFormData = z.infer<typeof registrationSchema>;
