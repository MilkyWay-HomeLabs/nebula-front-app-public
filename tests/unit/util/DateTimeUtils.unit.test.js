import { describe, it, expect } from 'vitest';
import DateTimeUtils from '../../../src/util/DateTimeUtils';

describe('DateTimeUtils', () => {
    describe('transformToTimestamp', () => {
        it('should transform a valid Date object to ISO string', () => {
            const date = new Date('2023-01-01T12:00:00Z');
            expect(DateTimeUtils.transformToTimestamp(date)).toBe('2023-01-01T12:00:00.000Z');
        });

        it('should transform a valid date string to ISO string', () => {
            expect(DateTimeUtils.transformToTimestamp('2023-12-31')).toContain('2023-12-31');
        });

        it('should transform a valid timestamp (number) to ISO string', () => {
            const timestamp = 1672574400000; // 2023-01-01T12:00:00Z
            expect(DateTimeUtils.transformToTimestamp(timestamp)).toBe('2023-01-01T12:00:00.000Z');
        });

        it('should throw TypeError for null input', () => {
            expect(() => DateTimeUtils.transformToTimestamp(null)).toThrow(TypeError);
            expect(() => DateTimeUtils.transformToTimestamp(null)).toThrow('value is empty or null');
        });

        it('should throw TypeError for undefined input', () => {
            expect(() => DateTimeUtils.transformToTimestamp(undefined)).toThrow(TypeError);
        });

        it('should throw TypeError for empty string', () => {
            expect(() => DateTimeUtils.transformToTimestamp('')).toThrow(TypeError);
            expect(() => DateTimeUtils.transformToTimestamp('   ')).toThrow(TypeError);
        });

        it('should throw TypeError for invalid date string', () => {
            expect(() => DateTimeUtils.transformToTimestamp('not-a-date')).toThrow(TypeError);
            expect(() => DateTimeUtils.transformToTimestamp('not-a-date')).toThrow('unable to parse date');
        });
    });
});
