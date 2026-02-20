import mongoose from "mongoose";
import DataModel from "../model/data.model";
import { configDotenv } from "dotenv";
configDotenv()

const mongoUrl = process.env.mongo_URL
if (!mongoUrl) throw new Error("MONGO_URL environment variable is not set.");
async function vectorIndexCreate() {
    await mongoose.connect(process.env.mongo_URL!);
    const collection = DataModel.collection;
    const vectorindex = {
        name: "dense_embedding",
        type: "vectorSearch",
        definition: {
            fields: [
                {
                    type: "vector",
                    numDimensions: 1024,
                    path: "embedding",
                    similarity: "cosine",
                },
            ],
        },
    };

    // const similarityindex = {
    //   name: "sparse_embedding",
    //   type: "search",
    //   definition: {
    //     mappings: {
    //       dynamic: false,
    //       fields: {
    //         text: {
    //           type: "string",
    //           analyzer: "lucene.english",
    //           searchAnalyzer: "lucene.english",
    //         },
    //         title: {
    //           type: "string",
    //           analyzer: "lucene.english",
    //           searchAnalyzer: "lucene.english",
    //         },
    //         metadata: {
    //           type: "document",
    //           fields: {
    //             static: {
    //               type: "document",
    //               fields: {
    //                 fileName: { type: "string" },
    //                 pageNumber: { type: "number" },
    //                 segment: {
    //                   type: "document",
    //                   fields: {
    //                     segment_id: { type: "number" },
    //                     segment_start: { type: "number" },
    //                     segment_end: { type: "number" },
    //                   },
    //                 },
    //               },
    //             },
    //             web: {
    //               type: "document",
    //               fields: {
    //                 url: { type: "string",},
    //                 snippet: {
    //                   type: "string",
    //                   analyzer: "lucene.english",
    //                   searchAnalyzer: "lucene.english",
    //                 },
    //                 fetchedAt: { type: "date" },
    //                 segment: {
    //                   type: "document",
    //                   fields: {
    //                     segment_id: { type: "number" },
    //                     segment_start: { type: "number" },
    //                     segment_end: { type: "number" },
    //                   },
    //                 },
    //               },
    //             },
    //           },
    //         },
    //       },
    //     },
    //   },
    // };

    try {
        const result1 = await collection.createSearchIndex(vectorindex);
        console.log("Vector index created", result1);
    } catch (error) {
        console.error("Error creating indexes:", error);
    }
    return;
}

export default vectorIndexCreate