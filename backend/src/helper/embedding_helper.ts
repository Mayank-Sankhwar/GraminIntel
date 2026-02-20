import { CohereEmbeddings } from "@langchain/cohere";
import DataModel from "../model/data.model";

export interface ContentData {
    website: string
    content: string;
    embedding: number[];
}

const embeddings = new CohereEmbeddings({
    apiKey: process.env.COHERE_API_KEY,
    batchSize: 48,
    model: "embed-english-v3.0",
});

export async function Embedding(context: any[]): Promise<number[][]> {
    console.log("Embedding starts.....")
    const texts = context.map((doc: any) => doc.pageContent);
    const documentRes = await embeddings.embedDocuments(texts);
    console.log("Embedding finished.....")
    return documentRes
}

export const StoreEmbedding = async (data: ContentData[]) => {
    try {
        const response = await DataModel.insertMany(
            data
        ).then((res) => {
            console.log(res)
            return
        }).catch((err) => {
            console.log('Error in storing embedding in mongoDB in queries.ts', err)
            throw new Error('Error in storemebdding function', err)
        })
    } catch (error: any) {
        console.log('Error in Storing embedding in Database', error)
        throw new Error(error)
    }
}