import * as z from "zod"

export const signUpValidation = z.object({
    name: z.string().min(2, 'Too short'),
    username: z.string().min(2, 'Too short'),
    email: z.string().email(),
    password: z.string().min(8, 'Password must be at least 8 characters.')
})