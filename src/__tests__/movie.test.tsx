import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Movie from '../app/movie';
import { updateMovie } from '../app/actions';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation');
jest.mock('../app/actions');
jest.mock('next-auth/react', () => ({
    useSession: () => ({ data: { user: {} } }),
    signOut: jest.fn(),
}));

const mockCreate = jest.fn();
jest.mock('openai', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    chat: {
      completions: {
        create: mockCreate,
      },
    },
  })),
}));

describe('Movie (Client Component)', () => {
    const mockRouter = { refresh: jest.fn() };

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
        (updateMovie as jest.Mock).mockResolvedValue(undefined);
    });

    // Test Case 1: Display movie submission form
    it('displays a form to submit a movie when none is set', () => {
        const user = { name: 'Test User', movie: null };
        render(<Movie user={user} />);

        expect(screen.getByText('Hello, Test User. Please submit your favorite movie.')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter your favorite movie')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    });

    // Test Case 2: Submit a new movie
    it('submits a new favorite movie and calls router.refresh', async () => {
        const user = { name: 'Test User', movie: null, email: 'test@example.com' };
        render(<Movie user={user} />);

        const input = screen.getByPlaceholderText('Enter your favorite movie');
        const submitButton = screen.getByRole('button', { name: 'Submit' });

        await userEvent.type(input, 'The Matrix');
        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(updateMovie).toHaveBeenCalledWith('The Matrix');
            expect(mockRouter.refresh).toHaveBeenCalledTimes(1);
        });
    });

    // Test Case 3: Display movie and fact
    it('displays the favorite movie and a fact when it is set', async () => {
        const user = { name: 'Test User', movie: 'Inception' };

        // Set the mock resolved value directly on the mocked method.
        mockCreate.mockResolvedValueOnce({
            choices: [{ message: { content: 'Inception fact!' } }]
        });
        
        // Render the component
        render(<Movie user={user} />);

        expect(screen.getByText('Your favorite movie is: Inception.')).toBeInTheDocument();
        expect(screen.getByText(/Loading.../)).toBeInTheDocument();

        // Wait for the fact to appear
        await waitFor(() => {
            // Use a regex to match the text, ignoring whitespace and newlines
            expect(screen.getByText(/One interesting fact about Inception is: Inception fact!/i)).toBeInTheDocument();
        });
    });

    // Test Case 4: Display loading state
    it('displays the loading state while fetching a fact', async () => {
        const user = { name: 'Test User', movie: 'Inception' };
        
        // Make the mock promise never resolve to simulate a loading state.
        mockCreate.mockReturnValue(new Promise(() => {}));

        render(<Movie user={user} />);
        
        expect(screen.getByText(/Loading.../)).toBeInTheDocument();

        // The loading state should remain
        await waitFor(() => {
            expect(screen.queryByText(/Inception fact!/)).not.toBeInTheDocument();
        }, { timeout: 2000 });
    });
});