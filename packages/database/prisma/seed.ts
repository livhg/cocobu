import { PrismaClient, BookType, MembershipRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data in a transaction to ensure atomicity
  console.log('🧹 Cleaning existing data...');
  await prisma.$transaction([
    prisma.allocation.deleteMany(),
    prisma.split.deleteMany(),
    prisma.entry.deleteMany(),
    prisma.settlement.deleteMany(),
    prisma.category.deleteMany(),
    prisma.membership.deleteMany(),
    prisma.book.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  // Create sample users in parallel
  console.log('👤 Creating sample users...');
  const [alice, bob, charlie] = await Promise.all([
    prisma.user.create({
      data: {
        email: 'alice@example.com',
        name: 'Alice',
      },
    }),
    prisma.user.create({
      data: {
        email: 'bob@example.com',
        name: 'Bob',
      },
    }),
    prisma.user.create({
      data: {
        email: 'charlie@example.com',
        name: 'Charlie',
      },
    }),
  ]);

  const users = [alice, bob, charlie];
  console.log(`✅ Created ${users.length} users`);

  // Create personal book for Alice
  console.log('📚 Creating personal books...');
  const alicePersonalBook = await prisma.book.create({
    data: {
      name: "Alice's Personal Expenses",
      type: BookType.personal,
      currency: 'TWD',
      ownerId: alice.id,
      memberships: {
        create: [
          {
            userId: alice.id,
            role: MembershipRole.owner,
          },
        ],
      },
    },
  });

  // Create split book for Alice, Bob, and Charlie
  console.log('📚 Creating split books...');
  const tripBook = await prisma.book.create({
    data: {
      name: '🏖️ Summer Trip 2025',
      type: BookType.split,
      currency: 'TWD',
      ownerId: alice.id,
      memberships: {
        create: [
          {
            userId: alice.id,
            role: MembershipRole.owner,
          },
          {
            userId: bob.id,
            role: MembershipRole.writer,
          },
          {
            userId: charlie.id,
            role: MembershipRole.writer,
          },
        ],
      },
    },
  });

  const householdBook = await prisma.book.create({
    data: {
      name: '🏠 Household Expenses',
      type: BookType.split,
      currency: 'TWD',
      ownerId: bob.id,
      memberships: {
        create: [
          {
            userId: bob.id,
            role: MembershipRole.owner,
          },
          {
            userId: charlie.id,
            role: MembershipRole.writer,
          },
        ],
      },
    },
  });

  const books = [alicePersonalBook, tripBook, householdBook];
  console.log(`✅ Created ${books.length} books`);

  // Create categories in parallel
  console.log('🏷️ Creating categories...');
  const [foodCategory, transportCategory, accommodationCategory] =
    await Promise.all([
      prisma.category.create({
        data: {
          bookId: tripBook.id,
          name: 'Food & Drinks',
          color: '#FF6B6B',
          icon: '🍔',
        },
      }),
      prisma.category.create({
        data: {
          bookId: tripBook.id,
          name: 'Transportation',
          color: '#4ECDC4',
          icon: '🚗',
        },
      }),
      prisma.category.create({
        data: {
          bookId: tripBook.id,
          name: 'Accommodation',
          color: '#95E1D3',
          icon: '🏨',
        },
      }),
    ]);

  const categories = [foodCategory, transportCategory, accommodationCategory];
  console.log(`✅ Created ${categories.length} categories`);

  // Create entries for personal book
  console.log('💰 Creating personal entries...');
  const personalEntries = await Promise.all([
    prisma.entry.create({
      data: {
        bookId: alicePersonalBook.id,
        creatorId: alice.id,
        amount: 150.5,
        currency: 'TWD',
        occurredOn: new Date('2025-10-15'),
        categoryId: null,
        note: 'Morning coffee',
      },
    }),
    prisma.entry.create({
      data: {
        bookId: alicePersonalBook.id,
        creatorId: alice.id,
        amount: 850.0,
        currency: 'TWD',
        occurredOn: new Date('2025-10-16'),
        categoryId: null,
        note: 'Grocery shopping',
      },
    }),
  ]);

  console.log(`✅ Created ${personalEntries.length} personal entries`);

  // Create entries for split book (trip)
  console.log('💰 Creating split book entries...');

  // Hotel entry - split equally
  const hotelEntry = await prisma.entry.create({
    data: {
      bookId: tripBook.id,
      creatorId: alice.id,
      amount: 9000.0,
      currency: 'TWD',
      occurredOn: new Date('2025-10-20'),
      categoryId: accommodationCategory.id,
      note: 'Hotel booking for 3 nights',
      split: {
        create: {
          mode: 'shares',
          allocations: {
            create: [
              {
                userId: alice.id,
                shares: 1,
                calculatedAmount: 3000.0,
              },
              {
                userId: bob.id,
                shares: 1,
                calculatedAmount: 3000.0,
              },
              {
                userId: charlie.id,
                shares: 1,
                calculatedAmount: 3000.0,
              },
            ],
          },
        },
      },
    },
  });

  // Dinner entry - split by ratio
  const dinnerEntry = await prisma.entry.create({
    data: {
      bookId: tripBook.id,
      creatorId: bob.id,
      amount: 1500.0,
      currency: 'TWD',
      occurredOn: new Date('2025-10-21'),
      categoryId: foodCategory.id,
      note: 'Seafood dinner',
      split: {
        create: {
          mode: 'ratio',
          allocations: {
            create: [
              {
                userId: alice.id,
                ratio: 40.0,
                calculatedAmount: 600.0,
              },
              {
                userId: bob.id,
                ratio: 30.0,
                calculatedAmount: 450.0,
              },
              {
                userId: charlie.id,
                ratio: 30.0,
                calculatedAmount: 450.0,
              },
            ],
          },
        },
      },
    },
  });

  // Gas entry - split by exact amounts
  const gasEntry = await prisma.entry.create({
    data: {
      bookId: tripBook.id,
      creatorId: charlie.id,
      amount: 1200.0,
      currency: 'TWD',
      occurredOn: new Date('2025-10-22'),
      categoryId: transportCategory.id,
      note: 'Gas for road trip',
      split: {
        create: {
          mode: 'exact',
          allocations: {
            create: [
              {
                userId: alice.id,
                exactAmount: 500.0,
                calculatedAmount: 500.0,
              },
              {
                userId: bob.id,
                exactAmount: 400.0,
                calculatedAmount: 400.0,
              },
              {
                userId: charlie.id,
                exactAmount: 300.0,
                calculatedAmount: 300.0,
              },
            ],
          },
        },
      },
    },
  });

  const splitEntries = [hotelEntry, dinnerEntry, gasEntry];
  console.log(
    `✅ Created ${splitEntries.length} split book entries with allocations`,
  );

  // Create entries for household book
  const householdEntry = await prisma.entry.create({
    data: {
      bookId: householdBook.id,
      creatorId: bob.id,
      amount: 2500.0,
      currency: 'TWD',
      occurredOn: new Date('2025-10-25'),
      note: 'Monthly utilities',
      split: {
        create: {
          mode: 'shares',
          allocations: {
            create: [
              {
                userId: bob.id,
                shares: 1,
                calculatedAmount: 1250.0,
              },
              {
                userId: charlie.id,
                shares: 1,
                calculatedAmount: 1250.0,
              },
            ],
          },
        },
      },
    },
  });

  const householdEntries = [householdEntry];
  console.log(`✅ Created ${householdEntries.length} household entry`);

  const totalEntries =
    personalEntries.length + splitEntries.length + householdEntries.length;

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Users: ${users.length}`);
  console.log(`   - Books: ${books.length} (1 personal, 2 split)`);
  console.log(`   - Categories: ${categories.length}`);
  console.log(
    `   - Entries: ${totalEntries} (${personalEntries.length} personal, ${splitEntries.length + householdEntries.length} with splits)`,
  );

  // Count memberships dynamically
  const membershipCount = await prisma.membership.count();
  console.log(`   - Memberships: ${membershipCount}`);

  console.log('\n💡 Test accounts:');
  console.log(`   - alice@example.com (1 personal book + 1 split book)`);
  console.log(`   - bob@example.com (2 split books)`);
  console.log(`   - charlie@example.com (2 split books)`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
