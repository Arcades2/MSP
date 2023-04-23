/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { PrismaClient, type Prisma } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create users
  const users: Prisma.UserCreateInput[] = [
    {
      name: "Etienne",
      email: "etienne.test@test.com",
      roles: "ROLE_SUPER_ADMIN",
    },
    {
      name: "Alice",
      email: "alice.test@test.com",
    },
    {
      name: "Bob",
      email: "bob.test@test.com",
    },
  ];

  for (const user of users) {
    await prisma.user.create({ data: user });
  }

  // Create relationships
  await prisma.user.update({
    where: { email: "etienne.test@test.com" },
    data: {
      following: {
        connect: [
          { email: "alice.test@test.com" },
          { email: "bob.test@test.com" },
        ],
      },
    },
  });

  // Create posts
  const posts: Prisma.PostCreateInput[] = [
    {
      description: "This is Alice post",
      user: {
        connect: { email: "alice.test@test.com" },
      },
      url: "https://www.youtube.com/watch?v=4GmLoVGmgDw&list=LL&index=3",
    },
    {
      description: "This is Bob post",
      user: {
        connect: { email: "bob.test@test.com" },
      },
      url: "https://www.youtube.com/watch?v=UGeJoaBYg04&list=LL&index=3",
    },
  ];

  for (const post of posts) {
    await prisma.post.create({ data: post });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
