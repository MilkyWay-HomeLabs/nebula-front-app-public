import {describe, expect, it} from 'vitest';
import ValidationUtils from '../../../src/util/ValidationUtils.js';

describe('ValidationUtils', () => {

    describe('isEmailValid', () => {
        it('should return true for valid email', () => {
            expect(ValidationUtils.isEmailValid('test@example.com')).toBe(true);
        });
        it('should return false when @ is missing', () => {
            expect(ValidationUtils.isEmailValid('invalid-email')).toBe(false);
        });
        it('should return false when domain is missing', () => {
            expect(ValidationUtils.isEmailValid('test@')).toBe(false);
        });
    });

    describe('isStrongPassword', () => {
        it('should return true for password with uppercase, lowercase and digit', () => {
            expect(ValidationUtils.isStrongPassword('StrongP4ss')).toBe(true);
        });
        it('should return false for password that is too short', () => {
            expect(ValidationUtils.isStrongPassword('Sh0rt')).toBe(false);
        });
        it('should return false when digit is missing', () => {
            expect(ValidationUtils.isStrongPassword('NoDigitPass')).toBe(false);
        });
        it('should return false when uppercase letter is missing', () => {
            expect(ValidationUtils.isStrongPassword('nouppercase1')).toBe(false);
        });
    });

    describe('isLoginDataValid', () => {
        it('should return true for valid email and strong password', () => {
            expect(ValidationUtils.isLoginDataValid('test@example.com', 'StrongP4ss')).toBe(true);
        });
        it('should return true for valid login and strong password', () => {
            expect(ValidationUtils.isLoginDataValid('user123', 'StrongP4ss')).toBe(true);
        });
        it('should return false for invalid login/email', () => {
            expect(ValidationUtils.isLoginDataValid('inv@lid', 'StrongP4ss')).toBe(false);
            expect(ValidationUtils.isLoginDataValid('ab', 'StrongP4ss')).toBe(false);
        });
        it('should return false for weak password', () => {
            expect(ValidationUtils.isLoginDataValid('test@example.com', 'weak')).toBe(false);
            expect(ValidationUtils.isLoginDataValid('user123', 'weak')).toBe(false);
        });
    });

    describe('isLoginValid', () => {
        it('should return true for valid login', () => {
            expect(ValidationUtils.isLoginValid('user123')).toBe(true);
        });
        it('should return false for login that is too short', () => {
            expect(ValidationUtils.isLoginValid('ab')).toBe(false);
        });
        it('should return false for login with special characters', () => {
            expect(ValidationUtils.isLoginValid('user@123')).toBe(false);
        });
    });

    describe('isPasswordMatches', () => {
        it('should return true when passwords are identical', () => {
            expect(ValidationUtils.isPasswordMatches('Pass1234', 'Pass1234')).toBe(true);
        });
        it('should return false when passwords differ', () => {
            expect(ValidationUtils.isPasswordMatches('Pass1234', 'Different1')).toBe(false);
        });
    });

    describe('isNationalityValid', () => {
        it('should return true for id in range 1-252', () => {
            expect(ValidationUtils.isNationalityValid(100)).toBe(true);
        });
        it('should return false for id = 0', () => {
            expect(ValidationUtils.isNationalityValid(0)).toBe(false);
        });
        it('should return false for id = 253', () => {
            expect(ValidationUtils.isNationalityValid(253)).toBe(false);
        });
    });

    describe('isGenderValid', () => {
        it('should return true for id = 1', () => {
            expect(ValidationUtils.isGenderValid(1)).toBe(true);
        });
        it('should return true for id = 3', () => {
            expect(ValidationUtils.isGenderValid(3)).toBe(true);
        });
        it('should return false for id = 0', () => {
            expect(ValidationUtils.isGenderValid(0)).toBe(false);
        });
        it('should return false for id = 4', () => {
            expect(ValidationUtils.isGenderValid(4)).toBe(false);
        });
    });

    describe('isBirthDateValid', () => {
        it('should return true for realistic birth date', () => {
            expect(ValidationUtils.isBirthDateValid('2000-01-01')).toBe(true);
        });
        it('should return false for invalid date string', () => {
            expect(ValidationUtils.isBirthDateValid('not-a-date')).toBe(false);
        });
        it('should return false for user younger than 8 years', () => {
            const tooYoung = new Date().getFullYear() - 5;
            expect(ValidationUtils.isBirthDateValid(`${tooYoung}-01-01`)).toBe(false);
        });
        it('should return false for date more than 100 years ago', () => {
            const tooOld = new Date().getFullYear() - 101;
            expect(ValidationUtils.isBirthDateValid(`${tooOld}-01-01`)).toBe(false);
        });
    });

});