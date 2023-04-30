class PubSub {
    constructor() {
        this.subscribers = {};
    }

    subscribe(eventName, callback) {
        if (!this.subscribers[eventName]) {
            this.subscribers[eventName] = [];
        }
        this.subscribers[eventName].push(callback);
    }

    unsubscribe(eventName, callback) {
        if (this.subscribers[eventName]) {
            this.subscribers[eventName] = this.subscribers[eventName].filter((cb) => cb !== callback);
        }
    }

    publish(eventName, data) {
        if (this.subscribers[eventName]) {
            this.subscribers[eventName].forEach((callback) => callback(data));
        }
    }
}

export const pubSub = new PubSub();
