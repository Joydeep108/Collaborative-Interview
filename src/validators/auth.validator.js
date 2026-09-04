import * as z from "zod";

const Candidate = z.object({
    role: z.literal("candidate"),
    // candidate-only fields:
    name: z.string()
        .min(5, "Minimum 5 character should be present.")
        .max(40, "Maximum 40 character should be present."),
    
    mobileNumber: z.string(),
    profilePhoto: z.string().optional(),
    resume: z.string().optional(),
    experienceYears: z.number()
        .default(0),
                
})

const Interviewer = z.object({
    role: z.literal("interviewer"),
    // interviewer-only fields:
    role: z.literal("candidate"),
    // candidate-only fields:
    name: z.string()
        .min(5, "Minimum 5 character should be present.")
        .max(40, "Maximum 40 character should be present."),
    
    mobileNumber: z.string(),
    profilePhoto: z.string().optional(),
    designation: z.string()
        .min(5, "Minimum 5 character should be present.")
        .max(40, "Maximum 40 character should be present.")
        .optional()

})

export const signupSchema = z.object({
    email: z.preprocess((value)=>
        typeof value == "string" ? value.trim().toLowerCase(): "",
        z.email("Email must be valid")
    ),

    password: z.string()
        .min(8, "Minimum 8 character should be present.")
        .max(30, "Maximum 30 characters should be present.")
        .regex(/[A-Z]/,"Password should contain atleast 1 Capital Letter")
        .regex(/[a-z]/,"Password should contain atleast 1 Capital Letter")
        .regex(/[0-9]/,"Password should contain atleast 1 Capital Letter")
        .regex(/[!`@#$%^&*(),.+=<>{}:;'?\-]/,"Password should contain atleast 1 Special Character"),
    
    role: z.union([Candidate, Interviewer]),
})


export const loginSchema = z.object({
    email: z.preprocess((value)=>
        typeof value == "string" ? value.trim().toLowerCase(): "",
        z.email("Email must be valid")
    ),

    password: z.string()
        .min(8, "Minimum 8 character should be present.")
        .max(30, "Maximum 30 characters should be present.")
        .regex(/[A-Z]/,"Password should contain atleast 1 Capital Letter")
        .regex(/[a-z]/,"Password should contain atleast 1 Capital Letter")
        .regex(/[0-9]/,"Password should contain atleast 1 Capital Letter")
        .regex(/[!`@#$%^&*(),.+=<>{}:;'?\-]/,"Password should contain atleast 1 Special Character"),
    
    role: z.enum(["candidate", "interviewer"]),
})