import { Client } from "@langchain/langgraph-sdk";

export const createClient = () => {
  return new Client({
    apiUrl: "/api",
  });
};
