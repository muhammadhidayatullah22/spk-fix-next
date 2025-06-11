import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

// PUT: Update current user profile
export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session_user');

    if (!sessionCookie) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    let sessionData;
    try {
      sessionData = JSON.parse(sessionCookie.value);
    } catch (error) {
      return NextResponse.json({ message: 'Invalid session data' }, { status: 401 });
    }

    const { NAMA, USERNAME, CURRENT_PASSWORD, NEW_PASSWORD } = await request.json();

    if (!NAMA || !USERNAME) {
      return NextResponse.json({ message: 'NAMA and USERNAME are required' }, { status: 400 });
    }

    // Get current user data
    const currentUser = await prisma.user.findUnique({
      where: { ID: sessionData.id },
    });

    if (!currentUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Prepare data to update
    const dataToUpdate: { NAMA: string; USERNAME: string; PASSWORD?: string } = {
      NAMA,
      USERNAME,
    };

    // If password change is requested
    if (NEW_PASSWORD) {
      if (!CURRENT_PASSWORD) {
        return NextResponse.json({ message: 'Current password is required to change password' }, { status: 400 });
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(CURRENT_PASSWORD, currentUser.PASSWORD);
      if (!isCurrentPasswordValid) {
        return NextResponse.json({ message: 'Current password is incorrect' }, { status: 400 });
      }

      // Validate new password
      if (NEW_PASSWORD.length < 6) {
        return NextResponse.json({ message: 'New password must be at least 6 characters long' }, { status: 400 });
      }

      // Hash new password
      dataToUpdate.PASSWORD = await bcrypt.hash(NEW_PASSWORD, 10);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { ID: sessionData.id },
      data: dataToUpdate,
      select: { ID: true, NAMA: true, USERNAME: true, ROLE: true }
    });

    // Update session cookie if username changed
    if (USERNAME !== currentUser.USERNAME) {
      const newSessionData = {
        id: updatedUser.ID,
        nama: updatedUser.NAMA,
        username: updatedUser.USERNAME,
        role: updatedUser.ROLE
      };

      const response = NextResponse.json({
        message: 'Profile updated successfully',
        user: {
          id: updatedUser.ID,
          nama: updatedUser.NAMA,
          username: updatedUser.USERNAME,
          role: updatedUser.ROLE
        }
      }, { status: 200 });

      response.cookies.set('session_user', JSON.stringify(newSessionData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      return response;
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.ID,
        nama: updatedUser.NAMA,
        username: updatedUser.USERNAME,
        role: updatedUser.ROLE
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error updating profile:', error);
    if (error.code === 'P2002' && error.meta?.target?.includes('USERNAME')) {
      return NextResponse.json({ message: 'Username already exists' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
