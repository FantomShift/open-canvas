import { Client } from "@langchain/langgraph-sdk";

export const createClient = () => {
  // Use current domain + /api for the proxy
  const apiUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/api`
    : '/api';
    
  return new Client({
    apiUrl,
  });
};
