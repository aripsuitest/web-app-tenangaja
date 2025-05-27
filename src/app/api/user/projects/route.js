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

    // Get all projects (orders) for this user
    const projects = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        worker: {
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
            categories: {
              include: {
                category: {
                  select: {
                    name: true
                  }
                }
              },
              take: 1
            }
          }
        },
        payment: {
          select: {
            id: true,
            amount: true,
            status: true,
            method: true,
            paidAt: true
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
    const projectPromises = projects.map(async project => ({
      id: project.id,
      title: project.title || `Project ${project.id.substring(0, 8)}`,
      category: project.worker?.categories?.[0]?.category?.name || 'General',
      worker: project.worker ? {
        id: project.worker.user.id,
        name: project.worker.user.name,
        email: project.worker.user.email,
        phone: project.worker.user.phone,
        avatar: project.worker.user.profile_pic || '/images/user_default_profile.webp',
        rating: await getWorkerAverageRating(project.worker.id),
        reviews: await getWorkerRatingsCount(project.worker.id),
        skills: project.worker.categories?.map(c => c.category.name) || ['General'],
        joined_date: project.worker.user.createdAt || new Date()
      } : null,
      rating: project.rating,
      start_date: project.date,
      end_date: new Date(project.date.getTime() + project.deadline * 24 * 60 * 60 * 1000),
      duration: project.deadline || 7,
      budget: project.budget || 0,
      status: project.status.toLowerCase(),
      userConfirmed: project.userConfirmed,
      payment_status: project.payment?.status || 'unpaid',
      payment_method: project.payment?.method || null,
      payment_date: project.payment?.paidAt || null,
      description: project.description || project.notes || 'No description provided',
      requirements: project.requirements?.split(';') || ['Complete on time', 'Follow specifications'],
      attachments: project.attachments || [],
      created_at: project.date,
      user_confirmed: project.userConfirmed || false
    }));

    const formattedProjects = await Promise.all(projectPromises);

    return NextResponse.json(formattedProjects);
  } catch (error) {
    console.error('Error fetching user projects:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

async function getWorkerAverageRating(workerId) {
  const orders = await prisma.order.findMany({
    where: { workerId },
    include: { rating: true }
  });

  const ratings = orders.filter(o => o.rating).map(o => o.rating.rating);
  if (ratings.length === 0) return 0;
  const average = ratings.reduce((a, b) => a + b, 0) / ratings.length;
  return average.toFixed(1);
}

async function getWorkerRatingsCount(workerId) {
  const orders = await prisma.order.findMany({
    where: { workerId },
    include: { rating: true }
  });

  return orders.filter(o => o.rating).length;
}