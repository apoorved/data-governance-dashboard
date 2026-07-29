import { prisma } from "../prisma";

export async function findAll() {
  return prisma.datasets.findMany({
    orderBy: {
      created_at: "desc",
    },
  });
}

export async function findById(id: bigint) {
  return prisma.datasets.findUnique({
    where: {
      id,
    },
    include: {
      column_catalog: true,
    },
  });
}
