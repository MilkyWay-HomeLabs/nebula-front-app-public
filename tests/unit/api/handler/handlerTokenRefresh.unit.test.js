import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../../src/api/token/RefreshAccess', () => ({
    default: vi.fn(),
}));

vi.mock('../../../../src/api/method/GETRequest', () => ({
    default: vi.fn(),
}));

vi.mock('../../../../src/api/method/PATCHRequest', () => ({
    default: vi.fn(),
}));

vi.mock('../../../../src/api/method/POSTRequest', () => ({
    default: vi.fn(),
}));

vi.mock('../../../../src/api/method/POSTRequestForMultipart', () => ({
    default: vi.fn(),
}));

vi.mock('../../../../src/api/method/POSTRequestNoBody', () => ({
    default: vi.fn(),
}));

vi.mock('../../../../src/api/method/PUTRequest', () => ({
    default: vi.fn(),
}));

beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
});

describe('handlerTokenRefresh', () => {
    it('retries wrapped request after 401 UNAUTHORIZED when refresh succeeds', async () => {
        const { default: refreshAccess } = await import('../../../../src/api/token/RefreshAccess');
        const { default: patchRequestOriginal } = await import('../../../../src/api/method/PATCHRequest');

        vi.mocked(patchRequestOriginal)
            .mockResolvedValueOnce({
                success: false,
                status: 401,
                message: '{"message":"Authentication is required.","error":"UNAUTHORIZED"}',
            })
            .mockResolvedValueOnce({ success: true, data: { ok: true } });

        vi.mocked(refreshAccess).mockResolvedValue({ success: true, data: { token: 'new-token' } });

        const { PATCHRequest } = await import('../../../../src/api/handler/handlerTokenRefresh');
        const result = await PATCHRequest('/v1/users/profile', { firstName: 'Neo' });

        expect(refreshAccess).toHaveBeenCalledTimes(1);
        expect(patchRequestOriginal).toHaveBeenCalledTimes(2);
        expect(result).toEqual({ success: true, data: { ok: true } });
    });

    it('returns original response when refresh fails', async () => {
        const { default: refreshAccess } = await import('../../../../src/api/token/RefreshAccess');
        const { default: patchRequestOriginal } = await import('../../../../src/api/method/PATCHRequest');

        const unauthorizedResponse = {
            success: false,
            status: 401,
            message: '{"message":"Authentication is required.","error":"UNAUTHORIZED"}',
        };

        vi.mocked(patchRequestOriginal).mockResolvedValue(unauthorizedResponse);
        vi.mocked(refreshAccess).mockResolvedValue({ success: false });

        const { PATCHRequest } = await import('../../../../src/api/handler/handlerTokenRefresh');
        const result = await PATCHRequest('/v1/users/profile', { firstName: 'Neo' });

        expect(refreshAccess).toHaveBeenCalledTimes(1);
        expect(patchRequestOriginal).toHaveBeenCalledTimes(1);
        expect(result).toEqual(unauthorizedResponse);
    });
});

