import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignOutButton from '../app/signoutBtn';
import { signOut } from 'next-auth/react';

jest.mock('next-auth/react', () => ({
    signOut: jest.fn(),
}));

describe('SignOutButton', () => {
    // Test Case 1
    it('calls signOut when the button is clicked', async () => {
        render(<SignOutButton />);

        const button = screen.getByRole('button', { name: 'Sign out' });
        await userEvent.click(button);

        await waitFor(() => {
            expect(signOut).toHaveBeenCalledTimes(1);
        });
    });
});