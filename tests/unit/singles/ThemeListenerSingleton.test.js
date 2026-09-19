import themeListenerSingletonInstance from '../../../src/singles/ThemeListenerSingleton';
import ObserverManager from "../../../src/singles/parent/ObserverManager.js";
import {beforeEach, describe, expect, it, vi} from 'vitest';

describe('ThemeListenerSingleton', () => {
    beforeEach(() => {
        themeListenerSingletonInstance.observers = [];
    });

    it('should be an instance of ObserverManager', () => {
        expect(themeListenerSingletonInstance).toBeInstanceOf(ObserverManager);
    });

    it('should behave like a singleton', async () => {
        const {default: instance1} = await import('../../../src/singles/ThemeListenerSingleton');
        const {default: instance2} = await import('../../../src/singles/ThemeListenerSingleton');

        expect(instance1).toBe(instance2);
        expect(instance1).toBe(themeListenerSingletonInstance);
    });

    it('should inherit ObserverManager functionality', () => {
        const observer = vi.fn();

        themeListenerSingletonInstance.addObserver(observer);
        themeListenerSingletonInstance.notifyObservers();

        expect(observer).toHaveBeenCalled();
    });

    it('should maintain state between imports', async () => {
        const observer = vi.fn();
        themeListenerSingletonInstance.addObserver(observer);

        const {default: anotherInstance} = await import('../../../src/singles/ThemeListenerSingleton');
        expect(anotherInstance.observers).toContain(observer);
    });
});
