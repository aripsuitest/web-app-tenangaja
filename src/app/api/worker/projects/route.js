import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Get worker ID from user
    const worker = await prisma.worker.findUnique({
      where: { userId: user.id },
      select: { id: true }
    });

    if (!worker) {
      return NextResponse.json({ message: 'Worker not found' }, { status: 404 });
    }

    // Get all projects (orders) for this worker
    const projects = await prisma.order.findMany({
      where: { workerId: worker.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            profile_pic: true,
          }
        },
        payment: {
          select: {
            amount: true,
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
      },
      orderBy: {
        date: 'desc'
      }
    });

    // Format the response
    const formattedProjects = projects.map(project => ({
      id: project.id,
      title: `Project ${project.id.substring(0, 8)}`,
      category: 'General', // You can modify this to get actual category
      client: {
        id: project.user.id,
        name: project.user.name,
        email: project.user.email,
        phone: project.user.phone,
        avatar: project.user.profile_pic || '/images/user_default_profile.webp',
      },
      rating: project.rating,
      start_date: project.date,
      end_date: new Date(project.date.getTime() + project.deadline * 24 * 60 * 60 * 1000),
      duration: project.deadline,
      budget: project.budget || 0,
      status: project.status.toLowerCase(),
      userConfirmed: project.userConfirmed,
      payment_status: project.payment?.status || 'unpaid',
      description: project.notes || 'No description provided',
      requirements: ['Complete on time', 'Follow specifications'], // Example requirements
      attachments: [],
      created_at: project.date
    }));

    return NextResponse.json(formattedProjects);
  } catch (error) {
    console.error('Error fetching worker projects:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}