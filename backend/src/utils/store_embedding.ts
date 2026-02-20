import Bottleneck from "bottleneck";
import mongoose from "mongoose";
import { ContentData, Embedding, StoreEmbedding } from "../helper/embedding_helper";
import vectorIndexCreate from "../database";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const limiter = new Bottleneck({
  reservoir: 15,             // initial number of available calls
  reservoirRefreshAmount: 10,          // number of calls to restore
  reservoirRefreshInterval: 30 * 1000, // interval in ms to restore
});

export async function RecursiveSplitting(context: string, website_url: string): Promise<ContentData[]> {
  await mongoose.connect(process.env.mongo_URL!);
  try {
    let charsplit = new RecursiveCharacterTextSplitter({ chunkSize: 1024, chunkOverlap: 100 })
    const text = await charsplit.createDocuments([context])
    console.log(text.length)
    const embedding = await limiter.schedule(() => Embedding(text))
    console.log('doc created!')
    const docs = await merge(embedding, text, website_url)
    // const StoreRedis=AddRedis(docs)
    //   const store=await StoreEmbedding(docs)
    await vectorIndexCreate()
    console.log("saved successfully")
    return docs
  } catch (error) {
    console.log('Error in splitting docuemnt', error)
    return []
  }
}

function merge(embedding: number[][], text: any[], website_url: string): ContentData[] {
  const docs = text.map((doc, index) => {
    return {
      content: doc.pageContent,
      embedding: embedding[index],
      website: website_url
    };
  });

  return docs
}