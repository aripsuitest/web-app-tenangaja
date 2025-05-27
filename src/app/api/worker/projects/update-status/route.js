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

    const body = await req.json();
    const { projectId, status } = body;

    if (!projectId || !status) {
      return NextResponse.json(
        { message: 'Project ID and status are required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status.toUpperCase())) {
      return NextResponse.json(
        { message: 'Invalid status' },
        { status: 400 }
      );
    }

    // Verify the worker owns this project
    const worker = await prisma.worker.findUnique({
      where: { userId: user.id },
      select: { id: true }
    });

    if (!worker) {
      return NextResponse.json({ message: 'Worker not found' }, { status: 404 });
    }

    const project = await prisma.order.findFirst({
      where: {
        id: projectId,
        workerId: worker.id
      }
    });

    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    // Update the project status
    const updatedProject = await prisma.order.update({
      where: { id: projectId },
      data: { status: status.toUpperCase() }
    });

    // Create notification for the client
    await prisma.notification.create({
      data: {
        userId: project.userId,
        message: `Your project status has been updated to ${status.toLowerCase().replace('_', ' ')}`,
      }
    });

    return NextResponse.json({ 
      message: 'Project status updated successfully',
      project: updatedProject
    });
  } catch (error) {
    console.error('Error updating project status:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}