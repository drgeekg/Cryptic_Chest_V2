# Cryptic Chest - Secure Password Manager

## Project Description

Cryptic Chest is a secure password management application that allows users to safely store, organize, and manage their passwords and sensitive information.

## Features

- Secure password storage
- Password generator
- Category management
- User authentication
- Dark/light theme
- Admin data reset functionality

## Technology Stack

### Frontend
- **React**: A JavaScript library for building user interfaces
- **TypeScript**: Provides static type checking for enhanced code quality
- **Vite**: Fast and modern build tool for frontend development
- **React Router**: For application routing and navigation
- **React Query**: For data fetching, caching, and state management
- **Framer Motion**: For smooth animations and transitions

### UI Components
- **shadcn/ui**: A collection of reusable UI components built with Radix UI and Tailwind CSS
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Lucide React**: Icon library with a clean and consistent design

### Data Management
- **LocalStorage**: Browser-based persistent storage for user data
- **Custom Encryption**: Basic encryption implementation for password protection

## Data Storage & Security

### Password Storage
All password data in Cryptic Chest is stored locally in the user's browser using localStorage. The application does not send any password data to external servers, making it inherently secure against network attacks.

### Data Structure
- **User data**: Stored with keys like `user_profile_[email]` and `user_password_[email]`
- **Password entries**: Stored in localStorage under a structured format with user ID associations

### Encryption Implementation
The application implements a basic encryption system for demonstration purposes:

1. **Encryption**: Passwords are encoded using Base64 encoding with a key verification component
2. **Decryption**: When viewing stored passwords, they are decoded using the same key
3. **Security**: The actual implementation is for demonstration only and would need to be replaced with proper encryption (like AES-256) in a production environment

### Password Generation
Cryptic Chest includes a robust password generator with options for:
- Password length
- Uppercase and lowercase letters
- Numbers
- Special symbols

## Getting Started

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd cryptic-chest

# Step 3: Install the necessary dependencies
npm install

# Step 4: Start the development server
npm run dev
```

The application will be available at http://localhost:8081 (or another port if 8081 is already in use).

## Authentication

This project uses a simulated authentication system with local storage for demonstration purposes. For new users after the latest update:

1. Register with your desired credentials
2. Login using the same credentials
3. For password changes, use the Profile page

## Admin Reset Functionality

The application includes an admin page to reset application data when needed:

### Accessing Admin Reset

Navigate to: http://localhost:8081/admin/reset

### Available Reset Options

1. **Reset All Application Data**
   - Completely removes all data from localStorage
   - Erases all user accounts, passwords, and application settings
   - Confirmation phrase: `RESET ALL DATA`

2. **Reset User Data Only**
   - Removes only user-related data (accounts, passwords)
   - Preserves application settings and preferences
   - Confirmation phrase: `RESET USERS`

### Reset Process

1. Navigate to the admin reset page
2. Choose the appropriate reset option
3. Type the exact confirmation phrase as shown
4. Click the reset button
5. After successful reset, you'll be redirected to the login page

## Editing the Project

**Edit a file directly in GitHub**

- Navigate to the desired file(s)
- Click the "Edit" button (pencil icon) at the top right of the file view
- Make your changes and commit the changes

**Use GitHub Codespaces**

- Navigate to the main page of your repository
- Click on the "Code" button (green button) near the top right
- Select the "Codespaces" tab
- Click on "New codespace" to launch a new Codespace environment
- Edit files directly within the Codespace and commit and push your changes once you're done

## Deployment

You can deploy this application using services like:

- Netlify
- Vercel
- GitHub Pages

## License

This project is private and proprietary.
