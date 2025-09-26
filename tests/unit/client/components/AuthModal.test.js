import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthContext } from '../../../../src/contexts/AuthContext';
import AuthModal from '../../../../src/components/AuthModal';

// Mock CSS import
jest.mock('../../../../src/components/AuthModal.css', () => ({}));

const mockAuthContext = {
  login: jest.fn(),
  register: jest.fn()
};

const renderAuthModal = (authContextValue = mockAuthContext, props = {}) => {
  const defaultProps = {
    onClose: jest.fn()
  };

  return render(
    <AuthContext.Provider value={authContextValue}>
      <AuthModal {...defaultProps} {...props} />
    </AuthContext.Provider>
  );
};

describe('AuthModal Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window.alert
    window.alert = jest.fn();
  });

  afterEach(() => {
    window.alert.mockRestore();
  });

  test('renders login form by default', () => {
    renderAuthModal();
    
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Email')).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Confirm Password')).not.toBeInTheDocument();
  });

  test('switches to register form when toggle is clicked', async () => {
    const user = userEvent.setup();
    renderAuthModal();
    
    fireEvent.click(screen.getByText("Don't have an account? Register"));
    
    await waitFor(() => {
      expect(screen.getByText('Register')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Confirm Password')).toBeInTheDocument();
    });
  });

  test('switches back to login form', async () => {
    renderAuthModal();
    
    // Switch to register
    fireEvent.click(screen.getByText("Don't have an account? Register"));
    
    await waitFor(() => {
      expect(screen.getByText('Register')).toBeInTheDocument();
    });
    
    // Switch back to login
    fireEvent.click(screen.getByText('Already have an account? Login'));
    
    await waitFor(() => {
      expect(screen.getByText('Login')).toBeInTheDocument();
      expect(screen.queryByPlaceholderText('Email')).not.toBeInTheDocument();
    });
  });

  test('calls onClose when close button is clicked', () => {
    const mockOnClose = jest.fn();
    renderAuthModal(mockAuthContext, { onClose: mockOnClose });
    
    fireEvent.click(screen.getByText('×'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('calls onClose when overlay is clicked', () => {
    const mockOnClose = jest.fn();
    renderAuthModal(mockAuthContext, { onClose: mockOnClose });
    
    const overlay = document.querySelector('.modal-overlay');
    fireEvent.click(overlay);
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('does not close when modal content is clicked', () => {
    const mockOnClose = jest.fn();
    renderAuthModal(mockAuthContext, { onClose: mockOnClose });
    
    const modal = document.querySelector('.modal');
    fireEvent.click(modal);
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  test('handles login form submission', async () => {
    const mockLogin = jest.fn().mockResolvedValue();
    const mockOnClose = jest.fn();
    const user = userEvent.setup();
    
    renderAuthModal({ ...mockAuthContext, login: mockLogin }, { onClose: mockOnClose });
    
    await user.type(screen.getByPlaceholderText('Username'), 'testuser');
    await user.type(screen.getByPlaceholderText('Password'), 'testpass');
    
    fireEvent.click(screen.getByText('Login'));
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('testuser', 'testpass');
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  test('handles register form submission', async () => {
    const mockRegister = jest.fn().mockResolvedValue();
    const mockOnClose = jest.fn();
    const user = userEvent.setup();
    
    renderAuthModal({ ...mockAuthContext, register: mockRegister }, { onClose: mockOnClose });
    
    // Switch to register form
    fireEvent.click(screen.getByText("Don't have an account? Register"));
    
    await waitFor(() => {
      expect(screen.getByText('Register')).toBeInTheDocument();
    });
    
    await user.type(screen.getByPlaceholderText('Username'), 'newuser');
    await user.type(screen.getByPlaceholderText('Email'), 'new@example.com');
    await user.type(screen.getByPlaceholderText('Password'), 'newpass123');
    await user.type(screen.getByPlaceholderText('Confirm Password'), 'newpass123');
    
    fireEvent.click(screen.getByText('Register'));
    
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('newuser', 'new@example.com', 'newpass123');
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  test('shows error when passwords do not match during registration', async () => {
    const user = userEvent.setup();
    renderAuthModal();
    
    // Switch to register form
    fireEvent.click(screen.getByText("Don't have an account? Register"));
    
    await waitFor(() => {
      expect(screen.getByText('Register')).toBeInTheDocument();
    });
    
    await user.type(screen.getByPlaceholderText('Username'), 'newuser');
    await user.type(screen.getByPlaceholderText('Email'), 'new@example.com');
    await user.type(screen.getByPlaceholderText('Password'), 'password1');
    await user.type(screen.getByPlaceholderText('Confirm Password'), 'password2');
    
    fireEvent.click(screen.getByText('Register'));
    
    expect(window.alert).toHaveBeenCalledWith('Passwords do not match!');
  });

  test('shows error when login fails', async () => {
    const mockLogin = jest.fn().mockRejectedValue(new Error('Invalid credentials'));
    const user = userEvent.setup();
    
    renderAuthModal({ ...mockAuthContext, login: mockLogin });
    
    await user.type(screen.getByPlaceholderText('Username'), 'wronguser');
    await user.type(screen.getByPlaceholderText('Password'), 'wrongpass');
    
    fireEvent.click(screen.getByText('Login'));
    
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Invalid credentials');
    });
  });

  test('shows generic error when error has no message', async () => {
    const mockLogin = jest.fn().mockRejectedValue({});
    const user = userEvent.setup();
    
    renderAuthModal({ ...mockAuthContext, login: mockLogin });
    
    await user.type(screen.getByPlaceholderText('Username'), 'testuser');
    await user.type(screen.getByPlaceholderText('Password'), 'testpass');
    
    fireEvent.click(screen.getByText('Login'));
    
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('An error occurred');
    });
  });

  test('updates form data when inputs change', async () => {
    const user = userEvent.setup();
    renderAuthModal();
    
    const usernameInput = screen.getByPlaceholderText('Username');
    await user.type(usernameInput, 'testuser');
    
    expect(usernameInput.value).toBe('testuser');
  });
});