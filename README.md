# Nebula Home Frontend

<p align="center">
  <a href="https://github.com/MilkyWay-HomeLabs/nebula-home">
    <img alt="Repo" src="https://img.shields.io/badge/Repo-GitHub-0f172a?style=for-the-badge&logo=github&logoColor=white">
  </a>
  <img alt="Version" src="https://img.shields.io/badge/Version-4.0.0--Public%20Beta-2563eb?style=for-the-badge">
  <img alt="Coverage" src="https://img.shields.io/badge/Coverage-89.81%25-16a34a?style=for-the-badge">
  <img alt="Release" src="https://img.shields.io/badge/Release-Public%20Beta-f59e0b?style=for-the-badge">
</p>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react&logoColor=black">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-8.0-646cff?style=flat-square&logo=vite&logoColor=white">
  <img alt="Vitest" src="https://img.shields.io/badge/Vitest-Test-729b1b?style=flat-square&logo=vitest&logoColor=white">
  <img alt="Playwright" src="https://img.shields.io/badge/Playwright-E2E-2ead33?style=flat-square&logo=playwright&logoColor=white">
  <img alt="JWT" src="https://img.shields.io/badge/JWT-Security-111827?style=flat-square&logo=jsonwebtokens&logoColor=white">
</p>

---

Apache-2.0 license

Nebula Home Frontend

📖 Documentation

    📄 [Changelog](docs/changelog.md) — project history.
    🚀 [Deployment](docs/deploy.md) — CI/CD and environment configuration.
    🚀 [Routes](docs/routes.md) — detailed application routes description.
    📊 [Metrics](docs/architecture.md) — architecture and monitoring information.
    🧪 [Testing](docs/tests.md) — testing instructions and coverage.
    ❓ [Help](docs/contributing.md) — contributing and troubleshooting.
    🛡️ [Production Ready Checklist](docs/architecture.md) — security and production recommendations.

🌟 Overview

Nebula Home is a specialized frontend application that serves as the central user hub for the MilkyWayHomeLab Nebula ecosystem. It provides users with a comprehensive profile management interface, allowing them to control their personal data and account settings.

Nebula Home acts as a vital bridge between various ecosystem applications and the Andromeda Authorization Server, facilitating seamless user interactions and account lifecycle management.

Key Features

    👤 Profile Management: Update personal information, including display names and other profile details.
    🖼️ Avatar Upload: Support for uploading and updating user profile pictures.
    🔐 Security Settings: Secure password change functionality and account security management.
    📝 User Onboarding: Full support for new account registration and profile initialization.
    🔗 Ecosystem Bridge: Centralized hub connecting users to other Nebula applications and services.
    🛡️ Integrated Authentication: Seamless integration with Andromeda Authorization Server using JWT-based secure sessions.
    🎨 Responsive Design: Modern, intuitive UI built with React 19, optimized for all devices.

📸 Preview

<p align="center">
  <img src="docs/preview/nebula-v-4-01.png" width="45%" alt="Preview 1">
  <img src="docs/preview/nebula-v-4-02.png" width="45%" alt="Preview 2">
  <img src="docs/preview/nebula-v-4-03.png" width="45%" alt="Preview 3">
  <img src="docs/preview/nebula-v-4-04.png" width="45%" alt="Preview 4">
  <img src="docs/preview/nebula-v-4-05.png" width="45%" alt="Preview 5">
  <img src="docs/preview/nebula-v-4-06.png" width="45%" alt="Preview 6">
  <img src="docs/preview/nebula-v-4-07.png" width="45%" alt="Preview 7">
  <img src="docs/preview/nebula-v-4-08.png" width="45%" alt="Preview 8">
</p>

Monitoring and Diagnostics

The application provides basic diagnostics and health checks:

    - Built-in error boundaries and logging for monitoring application health.
    - Integration with backend health endpoints for comprehensive system status.

Warning

All API interactions and security configurations should be verified carefully during deployment. Ensure that environment variables and sensitive keys are handled securely. Review authentication flows especially when handling sensitive user data.

🛠️ API Examples

This application communicates with backend services using JWT-based cookies and headers.

Example Fetch (Conceptual)

```javascript
fetch('/api/v1/user/profile', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'X-Requesting-App': 'nebula_home'
  }
})
```

More examples and detailed route documentation can be found in [docs/routes.md](docs/routes.md).

🏗️ Building the Project

Prerequisites

    Node.js (LTS version)
    npm / yarn

Installation Steps

Clone the Repository

```bash
git clone https://github.com/MilkyWay-HomeLabs/nebula-home.git
cd nebula-home
```

Configuration

Create a `.env` file based on your environment requirements:

```env
VITE_API_URL=https://api.your-nebula.com
VITE_AUTH_SERVER_URL=https://auth.your-nebula.com
```

Build and Run

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

🚀 Verification

After starting, the development server is typically available at http://localhost:5173. You can verify the setup by accessing the login page.

📄 License

This project is licensed under the Apache License 2.0. See the LICENSE file for the full license text.

👤 Author

Szymon Derleta
GitHub: @szymonderleta

🏠 Project

Organization: @MilkyWay-HomeLabs
Repository: nebula-home
