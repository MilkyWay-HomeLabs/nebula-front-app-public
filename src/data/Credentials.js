/**
 * Secure application data using environment variables
 */
const getEnvVar = (key) => {
    const value = import.meta.env[key];
    if (!value) {
        console.error(`Environment variable ${key} is not set!`);
        return value;
    }
    return value.endsWith('/') ? value.slice(0, -1) : value;
};

export const APP_REQUEST_URL = getEnvVar('VITE_REQUEST_URL');
export const APP_USERNAME = getEnvVar('VITE_USERNAME');
export const APP_PASSWORD = getEnvVar('VITE_PASSWORD');
export const APP_TOMCAT_DOMAIN = getEnvVar('VITE_TOMCAT_DOMAIN');
export const APP_APACHE_DOMAIN = getEnvVar('VITE_APACHE_DOMAIN');
export const APP_RESOURCES_DOMAIN = getEnvVar('VITE_RESOURCES_DOMAIN');

export const areCredentialsValid = () => {
    return !!(APP_REQUEST_URL && APP_USERNAME && APP_PASSWORD && APP_TOMCAT_DOMAIN && APP_APACHE_DOMAIN && APP_RESOURCES_DOMAIN);
};
