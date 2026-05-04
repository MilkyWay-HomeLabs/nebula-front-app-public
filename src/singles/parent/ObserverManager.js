/**
 * Manages a collection of observer functions that can be notified of changes or events.
 */
export default class ObserverManager {

    constructor() {
        this.observers = [];
    }

    addObserver(observer) {
        if (typeof observer === "function") {
            this.observers.push(observer);
        }
    }

    removeObserver(observer) {
        this.observers = this.observers.filter(obs => obs !== observer);
    }

    notifyObservers() {
        this.observers.forEach(observer => observer());
    }
}
