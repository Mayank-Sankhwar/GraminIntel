import { CohereEmbeddings } from "@langchain/cohere";
import mongoose from "mongoose";
import DataModel from "../model/data.model";
import { content } from "../types/signup";

const embeddings = new CohereEmbeddings({
  apiKey: process.env.COHERE_API_KEY,
  batchSize: 48,
  model: "embed-english-v3.0",
});

export async function QueryEmbedding(query: string, websites: any): Promise<content[]> {
  try {
    const densequeryembedding = await embeddings.embedQuery(query);
    const dembedding = await DenseRetrieveQuery(densequeryembedding, websites);
    //   const result = await mergeRetrieval(dembedding);
    return dembedding;
  } catch (error) {
    console.log("error in querying", error);
    return []
  }
}

async function DenseRetrieveQuery(queryembedding: number[], websites: any): Promise<any[]> {
  console.log('searching for dense vector')
  let results: any[] = [];
  try {
    await mongoose.connect(process.env.mongo_URL!);
    const collection = DataModel.collection;
    const pipeline = [
      {
        $vectorSearch: {
          index: "dense_embedding",
          queryVector: queryembedding,
          path: "embedding",
          numCandidates: 100,
          limit: 10,
          similarityMetric: "cosine",
          filter: {
            website: { $in: websites }
          }
        },
      },
      {
        $project: {
          url: "$website",
          title: "$website",
          text: "$content",
        },
      },
    ];
    const cursor = collection.aggregate(pipeline);
    results = await cursor.toArray();
    console.log("Found documents:", results.length);
    return results;
  } catch (error) {
    console.log("Error in finding query", error);
    return [];
  }
}
