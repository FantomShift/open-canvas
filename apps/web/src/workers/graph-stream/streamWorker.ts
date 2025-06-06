import { StreamWorkerMessage, StreamConfig } from "./streamWorker.types";

export class StreamWorkerService {
  private worker: Worker;

  constructor() {
    this.worker = new Worker(new URL("./stream.worker.ts", import.meta.url));
  }

  async *streamData(config: StreamConfig): AsyncGenerator<any, void, unknown> {
    // Get the API URL for the worker - same logic as createClient but for worker context
    const apiUrl = typeof window !== 'undefined' 
      ? `${window.location.origin}/api`
      : '/api';
    
    this.worker.postMessage({
      ...config,
      apiUrl,
    });

    while (true) {
      const event: MessageEvent<StreamWorkerMessage> = await new Promise(
        (resolve) => {
          this.worker.onmessage = resolve;
        }
      );

      const { type, data, error } = event.data;

      if (type === "error") {
        throw new Error(error);
      }

      if (type === "chunk" && data) {
        yield JSON.parse(data);
      }

      if (type === "done") {
        break;
      }
    }
  }

  terminate() {
    this.worker.terminate();
  }
}
