import ObserverManager from '../../../../src/singles/parent/ObserverManager';
import {beforeEach, describe, expect, it, vi} from 'vitest';

describe('ObserverManager', () => {
    let observerManager;

    beforeEach(() => {
        observerManager = new ObserverManager();
    });

    it('should create empty observers list', () => {
        expect(observerManager.observers).toHaveLength(0);
    });

    it('should add function as observer', () => {
        const observer = vi.fn();
        observerManager.addObserver(observer);
        expect(observerManager.observers).toHaveLength(1);
        expect(observerManager.observers).toContain(observer);
    });

    it('should not add non-function as observer', () => {
        observerManager.addObserver('not a function');
        observerManager.addObserver(123);
        observerManager.addObserver({});
        observerManager.addObserver(null);
        observerManager.addObserver(undefined);

        expect(observerManager.observers).toHaveLength(0);
    });

    it('should remove observer', () => {
        const observer = vi.fn();
        observerManager.addObserver(observer);
        expect(observerManager.observers).toHaveLength(1);

        observerManager.removeObserver(observer);
        expect(observerManager.observers).toHaveLength(0);
    });

    it('should notify all observers', () => {
        const observer1 = vi.fn();
        const observer2 = vi.fn();
        const observer3 = vi.fn();

        observerManager.addObserver(observer1);
        observerManager.addObserver(observer2);
        observerManager.addObserver(observer3);

        observerManager.notifyObservers();

        expect(observer1).toHaveBeenCalledTimes(1);
        expect(observer2).toHaveBeenCalledTimes(1);
        expect(observer3).toHaveBeenCalledTimes(1);
    });

    it('should safely remove non-existing observer', () => {
        const observer = vi.fn();
        const observer2 = vi.fn();

        observerManager.addObserver(observer);
        observerManager.removeObserver(observer2);

        expect(observerManager.observers).toHaveLength(1);
        expect(observerManager.observers).toContain(observer);
    });

    it('should handle multiple adds and removes correctly', () => {
        const observer = vi.fn();

        observerManager.addObserver(observer);
        observerManager.addObserver(observer);
        expect(observerManager.observers).toHaveLength(2);

        observerManager.removeObserver(observer);
        expect(observerManager.observers).toHaveLength(0);
    });
});
