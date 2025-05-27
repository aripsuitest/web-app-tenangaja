import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = await req.json();

    if (!projectId) {
      return NextResponse.json(
        { message: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Verify the user owns this project
    const project = await prisma.order.findFirst({
      where: {
        id: projectId,
        userId: user.id,
        status: 'PENDING' // Only allow cancel if pending
      }
    });

    if (!project) {
      return NextResponse.json(
        { message: 'Project not found or cannot be cancelled' }, 
        { status: 404 }
      );
    }

    // Update the project status
    const updatedProject = await prisma.order.update({
      where: { id: projectId },
      data: { status: 'CANCELLED' }
    });

    // Create notification for the worker
    if (project.workerId) {
      await prisma.notification.create({
        data: {
          workerId: project.workerId,
          message: `Project #${projectId.substring(0, 8)} has been cancelled by the client`,
        }
      });
    }

    return NextResponse.json({ 
      message: 'Project cancelled successfully',
      project: updatedProject
    });
  } catch (error) {
    console.error('Error cancelling project:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}