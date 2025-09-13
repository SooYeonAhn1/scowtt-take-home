import { updateMovie } from '../app/actions';
import { getServerSession } from "next-auth";
import { prisma } from "../lib/prisma";
import { revalidatePath } from "next/cache";

jest.mock('../lib/prisma', () => ({
    prisma: {
        user: {
            update: jest.fn(),
        },
    },
}));

jest.mock('next-auth');
jest.mock('../lib/prisma');
jest.mock('next/cache');

describe('updateMovie (Server Action)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test Case 1: Successful movie update
    it('successfully updates a movie for an authenticated user', async () => {
        const mockSession = { user: { email: 'test@example.com' } };
        
        // This is the fix: explicitly mock the return value for this test case.
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);
        
        (prisma.user.update as jest.Mock).mockResolvedValue({
            email: 'test@example.com',
            movie: 'The Dark Knight'
        });
        (revalidatePath as jest.Mock).mockImplementation(() => {});

        await updateMovie('The Dark Knight');

        expect(prisma.user.update).toHaveBeenCalledWith({
            where: { email: mockSession.user.email },
            data: { movie: 'The Dark Knight' },
        });
        expect(revalidatePath).toHaveBeenCalledWith('/');
    });

    // Test Case 2: Unauthorized user
    it('throws an error if the user is not authenticated', async () => {
        // This test case's mock is correct, it intentionally returns null
        (getServerSession as jest.Mock).mockResolvedValue(null);

        await expect(updateMovie('Fight Club')).rejects.toThrow('User not authenticated.');
        expect(prisma.user.update).not.toHaveBeenCalled();
        expect(revalidatePath).not.toHaveBeenCalled();
    });
});