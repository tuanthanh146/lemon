import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdmin } from '@/lib/adminAuth';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminId = await checkAdmin(req);
    if (!adminId) return NextResponse.json({ error: 'Unauthorized or Forbidden' }, { status: 403 });

    const { id } = await params;
    
    // Prevent admin from locking/changing their own role
    if (adminId === id) {
       return NextResponse.json({ success: false, error: 'Cannot modify your own account' }, { status: 400 });
    }

    const body = await req.json();
    const updateData: any = {};
    if (body.role !== undefined) updateData.role = body.role;
    if (body.isLocked !== undefined) updateData.isLocked = body.isLocked;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, username: true, role: true, isLocked: true }
    });

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error: any) {
    console.error('Admin Update User API Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminId = await checkAdmin(req);
    if (!adminId) return NextResponse.json({ error: 'Unauthorized or Forbidden' }, { status: 403 });

    const { id } = await params;

    if (adminId === id) {
       return NextResponse.json({ success: false, error: 'Cannot delete your own account' }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  } catch (error: any) {
    console.error('Admin Delete User API Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete user' }, { status: 500 });
  }
}
