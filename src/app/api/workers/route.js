// app/api/workers/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('categoryId');
  const q = searchParams.get('q')?.trim();
  const page = parseInt(searchParams.get('page') || '1');
  const perPage = 10;

  // Validate page number
  if (isNaN(page) || page < 1) {
    return NextResponse.json(
      { error: 'Invalid page number' },
      { status: 400 }
    );
  }

  try {
    // Base where clause
    const where = {
      status: 'active'
    };

    // Add category filter only if valid categoryId is provided
    if (categoryId && /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/.test(categoryId)) {
      where.categories = {
        some: {
          categoryId: categoryId
        }
      };
    }

    // Add search filter if q is provided
    if (q && q.length > 0) {
      where.user = {
        OR: [
          { name: { contains: q } },
          { address: { contains: q } }
        ]
      };
    }

    // First get all workers with their ratings in a single query
    const [workers, totalWorkers] = await Promise.all([
      prisma.worker.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              profile_pic: true,
              address: true,
              phone: true,
              email: true,
            }
          },
          categories: {
            include: {
              category: true
            }
          },
          orders: {
            include: {
              rating: true
            },
            where: {
              status: 'COMPLETED'
            }
          }
        },
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: {
          user: {
            name: 'asc'
          }
        }
      }),
      prisma.worker.count({ where })
    ]);

    // Calculate ratings for each worker
    const workersWithRatings = workers.map(worker => {
      // Get all ratings from completed orders
      const ratings = worker.orders
        .filter(order => order.rating)
        .map(order => order.rating.rating);

      const reviewCount = ratings.length;
      const averageRating = reviewCount > 0 
      ? (ratings.reduce((sum, rating) => sum + Number(rating), 0) / reviewCount).toFixed(1)
      : "0.0";

      return {
        id: worker.id,
        userId: worker.userId,
        name: worker.user.name,
        image: worker.user.profile_pic || '/images/user_default_profile.webp',
        address: worker.user.address,
        email: worker.user.email,
        phone: worker.user.phone,
        description: worker.description,
        banner: worker.banner,
        categories: worker.categories.map(c => ({
          id: c.category.id,
          name: c.category.name
        })),
        rating: averageRating,
        reviewCount,
        // Add more fields if needed
        skills: worker.categories.map(c => c.category.name),
        joinedDate: worker.user.createdAt
      };
    });

    return NextResponse.json({
      workers: workersWithRatings,
      totalPages: Math.ceil(totalWorkers / perPage),
      currentPage: page,
      totalWorkers
    });
  } catch (error) {
    console.error('Error fetching workers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workers', details: error.message },
      { status: 500 }
    );
  }
}