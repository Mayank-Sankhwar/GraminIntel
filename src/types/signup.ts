import z from "zod";

export const signup=z.object({
    username:z.string(),
    email:z.string(),
    code:z.number(),
    phone_number:z.string(),
    disability_is:z.boolean(),
    disability_type:z.enum(["Visual Impairment", "Hearing Impairment","Speech Disability" ,"other"]),
    answer_preference:z.enum(["voice", "chat"])
})

export const signin=z.object({
    phone_number:z.string(),
    code:z.number()
})

export interface content {
    url: string;
    title: string;
    content: string;
}