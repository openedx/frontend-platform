import React from 'react';
import { render, screen } from '@testing-library/react';
import OptionalReduxProvider from './OptionalReduxProvider'; // Adjust the import path as needed

describe('OptionalReduxProvider', () => {
  it('should handle error when react-redux import fails', async () => {
    // Simulate the failed import of 'react-redux'
    jest.mock('react-redux', () => {
      throw new Error('Failed to load react-redux');
    });

    const mockStore = {}; // Mock store object
    render(
      <OptionalReduxProvider store={mockStore}>
        <span>Test Children</span>
      </OptionalReduxProvider>,
    );

    // Check that the children are still rendered even when react-redux fails to load
    const childrenElement = await screen.findByText('Test Children');
    expect(childrenElement).toBeInTheDocument();
  });
});
