import { prisma } from "../prisma";

export async function findAll() {
  return prisma.datasets.findMany({
    orderBy: {
      created_at: "desc",
    },
  });
}
