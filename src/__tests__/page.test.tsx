import { render, screen, waitFor } from '@testing-library/react';
import Home from '../app/page';
import { getServerSession } from "next-auth";
import SignOutButton from "../app/signoutBtn";
import Movie from "../app/movie";

jest.mock('../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('next-auth');
jest.mock('../app/signoutBtn', () => {
    return jest.fn(() => <div>Mocked SignOutButton</div>);
});
jest.mock('../app/movie', () => {
    return jest.fn(({ user }) => (
        <div>
            <h1>Mocked Movie Component</h1>
            <p>User from prop: {JSON.stringify(user)}</p>
        </div>
    ));
});

describe('Home (Server Component)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test Case 1: User is not signed in
    it('displays a sign-in link if the user is not authenticated', async () => {
        (getServerSession as jest.Mock).mockResolvedValue(null);

        const jsx = await Home();
        
        expect(JSON.stringify(jsx)).toContain('Please sign in to view your profile.');
        expect(JSON.stringify(jsx)).toContain('/api/auth/signin');
    });

    // Test Case 2: User is signed in but not found in the database
    it('displays a message if the user is signed in but not found in the database', async () => {
        (getServerSession as jest.Mock).mockResolvedValue({ user: { email: 'test@example.com' } });
        
        // This is the key fix: use a `require` call inside the test to get the mocked module.
        // Then, explicitly cast the method to a Jest mock function.
        const { prisma } = require('../lib/prisma');
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

        const jsx = await Home();
        
        expect(JSON.stringify(jsx)).toContain('User not found in database.');
    });

   // Test Case 3: User is signed in and in the database
    it('renders the user profile and Movie component if authenticated and found', async () => {
        const mockUser = {
            id: '123',
            name: 'Test User',
            email: 'test@example.com',
            image: 'http://example.com/photo.jpg',
            movie: 'Inception'
        };

        (getServerSession as jest.Mock).mockResolvedValue({ user: { email: mockUser.email } });
        
        const { prisma } = require('../lib/prisma');
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

        render(await Home());

        expect(screen.getByText(`Hello, ${mockUser.name}, your email is: ${mockUser.email}!`, { exact: false })).toBeInTheDocument();
        expect(screen.getByAltText(`${mockUser.name}'s profile`)).toBeInTheDocument();
        
        expect(SignOutButton).toHaveBeenCalledTimes(1);

        // This is the new assertion
        const movieMockCalls = (Movie as jest.Mock).mock.calls;
        expect(movieMockCalls.length).toBe(1);
        expect(movieMockCalls[0][0]).toEqual({ user: mockUser });
    });
});