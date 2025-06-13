# Role-Based Access Control (RBAC) Implementation

## Overview
Sistem RBAC telah diimplementasikan sesuai dengan kebutuhan:

- **Admin**: Dapat mengakses semua fitur termasuk menambah user
- **Kepala Sekolah**: Dapat mengakses semua halaman kecuali add user, tetapi hanya bisa READ (tidak bisa CRUD)
- **Guru**: Dapat mengakses semua halaman kecuali add user, dapat melakukan CRUD

## Files Created/Modified

### 1. Core RBAC Files
- `middleware.ts` - Route protection middleware
- `lib/rbac.ts` - Role definitions and permission utilities
- `lib/auth-utils.ts` - Authentication utilities for API routes
- `components/ProtectedRoute.tsx` - Higher-order component for page protection

### 2. API Routes Updated
All API routes now include authentication and authorization checks:

#### User Management (Admin only)
- `app/api/user/route.ts` - GET, POST
- `app/api/user/[id]/route.ts` - GET, PUT, DELETE

#### Student Management (Admin & Guru can CRUD, Kepala Sekolah read-only)
- `app/api/siswa/route.ts` - GET, POST
- `app/api/siswa/[id]/route.ts` - GET, PUT, DELETE

#### Criteria Management (Admin & Guru can CRUD, Kepala Sekolah read-only)
- `app/api/kriteria/route.ts` - GET, POST
- `app/api/kriteria/[id]/route.ts` - GET, PUT, DELETE

#### Assessment Management (Admin & Guru can CRUD, Kepala Sekolah read-only)
- `app/api/penilaian/route.ts` - GET, POST
- `app/api/penilaian/siswa/[siswaId]/route.ts` - GET, POST

#### Results (All roles can read)
- `app/api/hasil/route.ts` - GET

### 3. Frontend Pages Updated

#### Layout
- `app/(main)/layout.tsx` - Hide "Add User" menu for non-admin users

#### Protected Pages
- `app/(main)/add-user/page.tsx` - Protected with ProtectedRoute component
- `app/(main)/siswa/page.tsx` - CRUD buttons hidden based on role
- `app/(main)/kriteria/page.tsx` - CRUD buttons hidden based on role
- `app/(main)/penilaian/page.tsx` - Input buttons hidden based on role
- `app/(main)/hasil/page.tsx` - Access control for viewing results

## Permission Matrix

| Feature | Admin | Guru | Kepala Sekolah |
|---------|-------|------|----------------|
| User Management | ✅ CRUD | ❌ | ❌ |
| Student Management | ✅ CRUD | ✅ CRUD | 👁️ Read Only |
| Criteria Management | ✅ CRUD | ✅ CRUD | 👁️ Read Only |
| Assessment Management | ✅ CRUD | ✅ CRUD | 👁️ Read Only |
| Results Viewing | ✅ Read | ✅ Read | ✅ Read |

## Key Features

### 1. Middleware Protection
- Protects all routes except API, static files, and auth pages
- Redirects unauthenticated users to login
- Prevents non-admin users from accessing `/add-user`

### 2. API Route Protection
- All API routes check for valid session
- CRUD operations check for appropriate permissions
- Consistent error responses for unauthorized access

### 3. Frontend Role Checking
- Dynamic UI based on user permissions
- Hide/show buttons and menu items
- Protected route components

### 4. Session Management
- Cookie-based session storage
- User role information included in session
- Automatic session validation

## Usage Examples

### Checking Permissions in Components
```typescript
import { useAuth } from '@/hooks/useAuth';
import { canCreate, canUpdate, canDelete, User } from '@/lib/rbac';

const { user } = useAuth();

// Check if user can create students
if (canCreate(user as User, 'student')) {
  // Show create button
}

// Check if user can update students
if (canUpdate(user as User, 'student')) {
  // Show edit button
}
```

### Protecting Pages
```typescript
import ProtectedRoute from '@/components/ProtectedRoute';
import { PERMISSIONS } from '@/lib/rbac';

export default function AdminPage() {
  return (
    <ProtectedRoute requiredPermission={PERMISSIONS.CREATE_USER}>
      {/* Page content */}
    </ProtectedRoute>
  );
}
```

### API Route Protection
```typescript
import { getSessionUser, canWrite } from '@/lib/auth-utils';

export async function POST(request: Request) {
  // Check authentication
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Check authorization
  if (!canWrite(sessionUser)) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  // Proceed with operation
}
```

## Security Considerations

1. **Server-side Validation**: All permissions are validated on the server
2. **Session Security**: HTTP-only cookies prevent XSS attacks
3. **Consistent Authorization**: Same permission logic used across frontend and backend
4. **Graceful Degradation**: UI adapts based on user permissions

## Testing

To test the RBAC system:

1. Create users with different roles (admin, guru, kepala_sekolah)
2. Login with each role and verify:
   - Menu visibility
   - Button availability
   - API access restrictions
   - Page access controls

## Notes

- The system uses the existing session management with cookies
- All role checks are case-sensitive
- Database enum values match the role definitions in code
- Frontend components gracefully handle missing permissions
