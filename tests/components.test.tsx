import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Simple test component
const TestButton: React.FC<{ children: React.ReactNode; onClick?: () => void }> = ({
  children,
  onClick,
}) => {
  return (
    <button onClick={onClick} data-testid="test-button">
      {children}
    </button>
  );
};

// Simple test component for tournament card
const TournamentCard: React.FC<{ title: string; status: string }> = ({ title, status }) => {
  return (
    <div data-testid="tournament-card">
      <h3>{title}</h3>
      <span className={`status-${status}`}>{status}</span>
    </div>
  );
};

describe('React Components', () => {
  it('should render button with text', () => {
    render(<TestButton>Click me</TestButton>);

    const button = screen.getByTestId('test-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Click me');
  });

  it('should render tournament card with title and status', () => {
    render(<TournamentCard title="Test Tournament" status="active" />);

    const card = screen.getByTestId('tournament-card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveTextContent('Test Tournament');
    expect(card).toHaveTextContent('active');
  });

  it('should apply correct status class', () => {
    render(<TournamentCard title="Test" status="completed" />);

    const statusElement = screen.getByText('completed');
    expect(statusElement).toHaveClass('status-completed');
  });
});
