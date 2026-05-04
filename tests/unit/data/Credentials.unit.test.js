import {describe, expect, it} from 'vitest';
import * as Credentials from '../../../src/data/Credentials';

describe('Credentials', () => {
    it('should export environment variables', () => {
        // Since we are in a test environment, these might be defined or undefined depending on setup
        // But we check if the exports exist
        expect(Credentials).toHaveProperty('APP_REQUEST_URL');
        expect(Credentials).toHaveProperty('APP_USERNAME');
        expect(Credentials).toHaveProperty('APP_PASSWORD');
        expect(Credentials).toHaveProperty('APP_TOMCAT_DOMAIN');
        expect(Credentials).toHaveProperty('APP_APACHE_DOMAIN');
        expect(Credentials).toHaveProperty('APP_RESOURCES_DOMAIN');
    });

    it('areCredentialsValid should return boolean', () => {
        expect(typeof Credentials.areCredentialsValid()).toBe('boolean');
    });
});
