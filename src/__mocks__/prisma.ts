import { PrismaClient } from "@prisma/client";

export const mockPrismaClient = {
    user: {
        findUnique: jest.fn(),
        update: jest.fn(),
    },
};

export const prisma = mockPrismaClient as unknown as PrismaClient;