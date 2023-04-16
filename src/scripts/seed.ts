import { prisma } from "~/server/db";
import { lorelei } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";

async function makeUser(name: string, email: string) {
  const avatar = await createAvatar(lorelei, {
    seed: name,
  }).toDataUri();

  return prisma.user.create({
    data: {
      name,
      email,
      password: "v1.9a7ae20e46924586831f058e07e32333.b94a1bede95219eb6115f86c5032ec86",
      profilePicture: avatar,
      bio: "test user",
    }
  });
}

async function main() {
  // create 5 different users
  const users = await Promise.all([
    makeUser("Alice", "alice@gmail.com"),
    makeUser("Bob", "bob@gmail.com"),
    makeUser("Charlie", "charlie@gmail.com"),
    makeUser("David", "david@gmail.com"),
    makeUser("Eve", "eve@gmail.com"),
  ]);
}