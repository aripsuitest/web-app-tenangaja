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

    const { projectId, comment, rating } = await req.json();

    if (!projectId) {
      return NextResponse.json(
        { message: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Verify the project exists and belongs to the user
    const project = await prisma.order.findFirst({
      where: {
        id: projectId,
        userId: user.id,
        status: 'COMPLETED',
        userConfirmed: true
      },
      include: {
        worker: {
          select: {
            userId: true
          }
        },
        payment: {
          select: {
            status: true
          }
        },
        rating: {
          select: {
            id: true,
            rating: true,
            comment: true,
          }
        }
      }
    });

    if (!project) {
      return NextResponse.json(
        { 
          message: 'Project not found, not completed by worker, or already confirmed',
          details: {
            exists: !!await prisma.order.findUnique({ where: { id: projectId } }),
            belongsToUser: !!await prisma.order.findFirst({ 
              where: { id: projectId, userId: user.id }
            }),
            isCompleted: !!await prisma.order.findFirst({
              where: { id: projectId, status: 'COMPLETED' }
            }),
            isConfirmed: !!await prisma.order.findFirst({
              where: { id: projectId, userConfirmed: true }
            })
          }
        },
        { status: 400 }
      );
    }

    // Verify payment was successful
    if (project.rating) {
      return NextResponse.json(
        { message: 'Project has been rated' },
        { status: 400 }
      );
    }

    // Update the project confirmation status
    // const updatedProject = await prisma.order.update({
    //   where: { id: projectId },
    //   data: { userConfirmed: true }
    // });

    const projectRating = await prisma.rating.create({
      data: {
        orderId: projectId,
        comment,
        rating
      }
    });

    // Create notification for the worker
    await prisma.notification.create({
      data: {
        userId: project.worker.userId,
        message: `Client from project #${projectId.slice(0, 8)} give you ${rating} rating`,
        read: false
      }
    });

    return NextResponse.json({ 
      message: 'Project rating submited successfully',
      project: {
        rating: projectRating,
        id: projectId
      }
    });

  } catch (error) {
    console.error('Error to save project rating:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}