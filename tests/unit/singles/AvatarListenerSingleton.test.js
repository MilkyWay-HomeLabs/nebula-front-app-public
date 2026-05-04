import avatarListenerSingletonInstance from '../../../src/singles/AvatarListenerSingleton';
import ObserverManager from "../../../src/singles/parent/ObserverManager.js";
import {beforeEach, describe, expect, it, vi} from 'vitest';

describe('AvatarListenerSingleton', () => {
    beforeEach(() => {
        avatarListenerSingletonInstance.observers = [];
    });

    it('should be an instance of ObserverManager', () => {
        expect(avatarListenerSingletonInstance).toBeInstanceOf(ObserverManager);
    });

    it('should behave like a singleton', async () => {
        const {default: instance1} = await import('../../../src/singles/AvatarListenerSingleton');
        const {default: instance2} = await import('../../../src/singles/AvatarListenerSingleton');

        expect(instance1).toBe(instance2);
        expect(instance1).toBe(avatarListenerSingletonInstance);
    });

    it('should inherit ObserverManager functionality', () => {
        const observer = vi.fn();

        avatarListenerSingletonInstance.addObserver(observer);
        avatarListenerSingletonInstance.notifyObservers();

        expect(observer).toHaveBeenCalled();
    });

    it('should maintain state between imports', async () => {
        const observer = vi.fn();
        avatarListenerSingletonInstance.addObserver(observer);

        const {default: anotherInstance} = await import('../../../src/singles/AvatarListenerSingleton');
        expect(anotherInstance.observers).toContain(observer);
    });
});