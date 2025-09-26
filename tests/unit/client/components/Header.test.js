import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthContext } from '../../../../src/contexts/AuthContext';
import Header from '../../../../src/components/Header';

// Mock CSS import
jest.mock('../../../../src/components/Header.css', () => ({}));

const mockAuthContext = {
  user: null,
  logout: jest.fn()
};

const renderHeader = (authContextValue = mockAuthContext, props = {}) => {
  const defaultProps = {
    onShowAuth: jest.fn(),
    onViewChange: jest.fn(),
    currentView: 'map'
  };

  return render(
    <AuthContext.Provider value={authContextValue}>
      <Header {...defaultProps} {...props} />
    </AuthContext.Provider>
  );
};

describe('Header Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders logo and basic navigation', () => {
    renderHeader();
    
    expect(screen.getByText('🌍 Travel Journal')).toBeInTheDocument();
    expect(screen.getByText('Map')).toBeInTheDocument();
  });

  test('shows login button when user is not authenticated', () => {
    renderHeader();
    
    expect(screen.getByText('Login / Register')).toBeInTheDocument();
    expect(screen.queryByText('My Journal')).not.toBeInTheDocument();
    expect(screen.queryByText('Profile')).not.toBeInTheDocument();
  });

  test('shows user menu when user is authenticated', () => {
    const authContextWithUser = {
      user: { id: 1, username: 'testuser' },
      logout: jest.fn()
    };

    renderHeader(authContextWithUser);
    
    expect(screen.getByText('My Journal')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.queryByText('Login / Register')).not.toBeInTheDocument();
  });

  test('calls onViewChange when navigation links are clicked', () => {
    const mockOnViewChange = jest.fn();
    const authContextWithUser = {
      user: { id: 1, username: 'testuser' },
      logout: jest.fn()
    };

    renderHeader(authContextWithUser, { onViewChange: mockOnViewChange });
    
    fireEvent.click(screen.getByText('Map'));
    expect(mockOnViewChange).toHaveBeenCalledWith('map');

    fireEvent.click(screen.getByText('My Journal'));
    expect(mockOnViewChange).toHaveBeenCalledWith('journal');

    fireEvent.click(screen.getByText('Profile'));
    expect(mockOnViewChange).toHaveBeenCalledWith('profile');
  });

  test('calls onShowAuth when login button is clicked', () => {
    const mockOnShowAuth = jest.fn();
    
    renderHeader(mockAuthContext, { onShowAuth: mockOnShowAuth });
    
    fireEvent.click(screen.getByText('Login / Register'));
    expect(mockOnShowAuth).toHaveBeenCalled();
  });

  test('calls logout when logout button is clicked', () => {
    const mockLogout = jest.fn();
    const authContextWithUser = {
      user: { id: 1, username: 'testuser' },
      logout: mockLogout
    };

    renderHeader(authContextWithUser);
    
    fireEvent.click(screen.getByText('Logout'));
    expect(mockLogout).toHaveBeenCalled();
  });

  test('applies active class to current view', () => {
    renderHeader(mockAuthContext, { currentView: 'map' });
    
    const mapLink = screen.getByText('Map');
    expect(mapLink).toHaveClass('active');
  });

  test('applies active class to journal view when authenticated', () => {
    const authContextWithUser = {
      user: { id: 1, username: 'testuser' },
      logout: jest.fn()
    };

    renderHeader(authContextWithUser, { currentView: 'journal' });
    
    const journalLink = screen.getByText('My Journal');
    expect(journalLink).toHaveClass('active');
  });

  test('prevents default action on navigation link clicks', () => {
    const mockOnViewChange = jest.fn();
    
    renderHeader(mockAuthContext, { onViewChange: mockOnViewChange });
    
    const mapLink = screen.getByText('Map');
    const clickEvent = new MouseEvent('click', { bubbles: true });
    const preventDefault = jest.fn();
    clickEvent.preventDefault = preventDefault;
    
    fireEvent(mapLink, clickEvent);
    
    expect(preventDefault).toHaveBeenCalled();
  });
});