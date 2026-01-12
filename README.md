# Headscale Admin Panel

A modern, English-language web administration panel for [Headscale](https://github.com/juanfont/headscale), built with React, TypeScript, Vite, and Supabase.

## Features

### Core Features
- **User Management** - Create, edit, and manage user accounts (Admin only)
- **Self-Registration** - Allow users to register their own accounts
- **User Expiration** - Set expiration dates for user accounts
- **Traffic Statistics** - Monitor network usage and traffic
- **Access Control Lists (ACL)** - User-based network permissions with JSON editor
- **Node Management** - View and manage connected devices
- **Route Management** - Configure network routes with enable/disable controls
- **Log Management** - View system logs and activities
- **Pre-authentication Keys** - Generate and manage keys for device enrollment
- **Role Management** - Admin and regular user roles with different permissions

### Modern UI/UX
- Clean, modern interface with Tailwind CSS
- Responsive design for mobile, tablet, and desktop
- Real-time data updates
- Smooth animations and transitions

### Technology Stack
- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: Tailwind CSS
- **Icons**: Lucide React
- **Backend**: Supabase (Database + Authentication)
- **Routing**: React Router v6

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- A Supabase account and project
- A Headscale instance (v0.22.3+ recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd headscale-admin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   The `.env` file should contain:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up the database**

   The database schema is automatically set up through Supabase. The schema includes:
   - User profiles with role-based access control
   - Nodes (connected devices)
   - Routes (network routes)
   - ACLs (access control lists)
   - Pre-authentication keys
   - Activity logs
   - Headscale configuration

   All tables have Row Level Security (RLS) enabled with appropriate policies.

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   ```

## Usage

### First Time Setup

1. **Register an Account**
   - Navigate to `/register`
   - Create your account with username, email, and password
   - By default, new users have the 'user' role

2. **Promote to Admin** (if needed)
   - Use Supabase dashboard to manually set the first user's role to 'admin'
   - Go to the `user_profiles` table
   - Update the `role` field to 'admin'

3. **Configure Headscale Integration** (coming soon)
   - Navigate to Settings as an admin
   - Add your Headscale API URL and API key

### User Roles

**Admin**
- Full access to all features
- Can manage all users
- Can view and manage all nodes, routes, and ACLs
- Can view all activity logs

**User**
- Can manage their own nodes, routes, and ACLs
- Can generate pre-authentication keys
- Can view their own activity logs
- Cannot access user management

### Connecting Devices

1. Generate a pre-authentication key from the "Pre-auth Keys" page
2. Install Tailscale on your device
3. Connect using:
   ```bash
   tailscale up --login-server=YOUR_HEADSCALE_URL --authkey=YOUR_KEY
   ```

## Database Schema

### Tables

- **user_profiles** - User accounts and settings
- **nodes** - Connected devices
- **routes** - Network routes
- **acls** - Access control lists
- **preauth_keys** - Pre-authentication keys for device enrollment
- **activity_logs** - System activity logs
- **headscale_config** - Headscale API configuration

### Security

- All tables have Row Level Security (RLS) enabled
- Users can only access their own data
- Admins can access all data
- Secure password authentication through Supabase Auth

## Development

### Project Structure

```
src/
├── components/          # Reusable components
│   └── Layout.tsx      # Main app layout with sidebar
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
├── lib/                # Utilities and configurations
│   └── supabase.ts    # Supabase client and types
├── pages/              # Application pages
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Dashboard.tsx
│   ├── Nodes.tsx
│   ├── Routes.tsx
│   ├── ACLs.tsx
│   ├── PreauthKeys.tsx
│   ├── Logs.tsx
│   ├── Users.tsx
│   ├── Profile.tsx
│   └── Settings.tsx
├── App.tsx             # Main app component
├── main.tsx            # App entry point
└── index.css           # Global styles
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Credits

This is a modern English rewrite of the original [Headscale-Admin](https://github.com/arounyf/headscale-Admin) project by arounyf.

## License

This project is open source and available under the MIT License






