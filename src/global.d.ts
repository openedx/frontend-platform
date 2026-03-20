declare module 'pubsub-js' {
  const PubSub: {
    subscribe(type: string, callback: (message: string, data?: unknown) => void): string;
    unsubscribe(token: string): void;
    publish(type: string, data?: unknown): boolean;
  };
  export default PubSub;
}
