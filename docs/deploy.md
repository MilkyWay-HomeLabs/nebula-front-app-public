# Deployment Configuration

This document describes the deployment process and required environment variables for the Nebula Home Frontend.

## Environment Variables (Vite)

Since this is a Vite-powered application, environment variables starting with `VITE_` are injected during the build process (`npm run build`). If these variables are missing during build, the application will log errors to the console and may fail to authenticate with backend services.

### Required Variables

The following variables must be defined either in your local `.env` file or as **GitHub Secrets** for the CI/CD pipeline:

| Variable                | Description                     | Example / Usage                    |
|:------------------------|:--------------------------------|:-----------------------------------|
| `VITE_REQUEST_URL`      | Base URL for API requests       | `https://api.milkyway.test/v1`     |
| `VITE_USERNAME`         | Technical user for Basic Auth   | Used for public/initial API calls  |
| `VITE_PASSWORD`         | Password for the technical user | Used for public/initial API calls  |
| `VITE_TOMCAT_DOMAIN`    | Domain/URL for Tomcat services  | `https://tomcat.milkyway.test`     |
| `VITE_APACHE_DOMAIN`    | Domain/URL for Apache services  | `https://apache.milkyway.test`     |
| `VITE_RESOURCES_DOMAIN` | URL for static/shared resources | `https://resources.milkyway.test/` |
| `VITE_PUBLIC_URL`       | Base path for the application   | `/nebula/app/`                     |

## GitHub Actions CI/CD

The project uses GitHub Actions (defined in `.github/workflows/deploy.yml`) to build and deploy the application to the test environment.

### GitHub Secrets Configuration

To ensure a successful deployment, add the following secrets to your GitHub repository settings (`Settings > Secrets and variables > Actions`):

1. `VITE_USERNAME`
2. `VITE_PASSWORD`
3. `VITE_TOMCAT_DOMAIN`
4. `VITE_APACHE_DOMAIN`
5. `VITE_RESOURCES_DOMAIN`
6. `VITE_REQUEST_URL` (optional, has default in workflow)
7. `VITE_PUBLIC_URL` (optional, has default in workflow)
8. `FRONT_APP_DIR_TEST_ENV` (deployment path)
9. `FRONT_ARCHIVE_DIR_TEST_ENV` (backup path)
10. `DOCKER_TEST_DIR_TEST_ENV` (docker compose location)

### Build Step

The CI/CD workflow must explicitly pass these secrets as environment variables during the build step:

```yaml
- name: Run build
  env:
    VITE_USERNAME: ${{ secrets.VITE_USERNAME }}
    VITE_PASSWORD: ${{ secrets.VITE_PASSWORD }}
    VITE_TOMCAT_DOMAIN: ${{ secrets.VITE_TOMCAT_DOMAIN }}
    VITE_APACHE_DOMAIN: ${{ secrets.VITE_APACHE_DOMAIN }}
    VITE_RESOURCES_DOMAIN: ${{ secrets.VITE_RESOURCES_DOMAIN }}
    # ... other variables
  run: npm run build
```
