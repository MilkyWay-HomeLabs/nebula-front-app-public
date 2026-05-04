/**
 * Utility function to generate asset URLs based on the environment's base URL.
 * Ensures consistent path formatting by normalizing slashes.
 *
 * @param {string} relativePath - The relative path of the asset.
 * @returns {string} The normalized full asset URL.
 */
export const assetUrl = (relativePath = '') => {
    const base = import.meta.env.BASE_URL || '/';
    const normalizedBase = base.endsWith('/') ? base : `${base}/`;
    const normalizedPath = String(relativePath).replace(/^\/+/, '');
    const url = `${normalizedBase}${normalizedPath}`;

    return url.replace(/\/+/g, '/').replace(':/', '://');
};
