import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DemoModeToggle from '../DemoModeToggle';
import { setupLocalStorageMock } from '@/utils/testUtils';
import * as backendDetection from '@/utils/backendDetection';
import * as mockService from '@/utils/mockService';

// Mock the dependencies
jest.mock('@/utils/backendDetection', () => ({
  isDemoModeForced: jest.fn().mockReturnValue(false),
  forceEnableDemoMode: jest.fn(),
  disableForcedDemoMode: jest.fn()
}));

jest.mock('@/utils/mockService', () => ({
  isDemoModeSync: jest.fn().mockReturnValue(false)
}));

describe('DemoModeToggle', () => {
  beforeAll(() => {
    // Setup localStorage mock
    setupLocalStorageMock();
    
    // Mock process.env
    process.env.NEXT_PUBLIC_DEMO_MODE = 'false';
  });
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders correctly in initial state with demo mode off', () => {
    render(<DemoModeToggle />);
    
    // Toggle should exist
    const toggle = screen.getByRole('checkbox', { name: /Toggle Demo Mode/i });
    expect(toggle).toBeInTheDocument();
    expect(toggle).not.toBeChecked();
    
    // Label should show correct state
    expect(screen.getByText(/Demo Mode Off/i)).toBeInTheDocument();
  });
  
  it('renders with demo mode on when forced by environment', () => {
    // Mock environment variable
    const originalEnv = process.env.NEXT_PUBLIC_DEMO_MODE;
    process.env.NEXT_PUBLIC_DEMO_MODE = 'true';
    
    render(<DemoModeToggle />);
    
    // Toggle should exist and be checked
    const toggle = screen.getByRole('checkbox', { name: /Toggle Demo Mode/i });
    expect(toggle).toBeChecked();
    
    // Label should show correct state
    expect(screen.getByText(/Demo Mode On/i)).toBeInTheDocument();
    expect(screen.getByText(/\(Forced by environment\)/i)).toBeInTheDocument();
    
    // Restore original env
    process.env.NEXT_PUBLIC_DEMO_MODE = originalEnv;
  });
  
  it('renders with demo mode on when localStorage forces it', () => {
    // Mock isDemoModeForced to return true
    (backendDetection.isDemoModeForced as jest.Mock).mockReturnValueOnce(true);
    
    render(<DemoModeToggle />);
    
    // Toggle should exist and be checked
    const toggle = screen.getByRole('checkbox', { name: /Toggle Demo Mode/i });
    expect(toggle).toBeChecked();
    
    // Label should show correct state
    expect(screen.getByText(/Demo Mode On/i)).toBeInTheDocument();
  });
  
  it('enables demo mode when clicked', () => {
    render(<DemoModeToggle />);
    
    // Toggle should initially be unchecked
    const toggle = screen.getByRole('checkbox', { name: /Toggle Demo Mode/i });
    expect(toggle).not.toBeChecked();
    
    // Click the toggle
    fireEvent.click(toggle);
    
    // forceEnableDemoMode should have been called
    expect(backendDetection.forceEnableDemoMode).toHaveBeenCalled();
    
    // Toggle should now be checked
    expect(toggle).toBeChecked();
  });
  
  it('disables demo mode when clicked while enabled', () => {
    // Mock isDemoModeForced to return true
    (backendDetection.isDemoModeForced as jest.Mock).mockReturnValueOnce(true);
    
    render(<DemoModeToggle />);
    
    // Toggle should initially be checked
    const toggle = screen.getByRole('checkbox', { name: /Toggle Demo Mode/i });
    expect(toggle).toBeChecked();
    
    // Click the toggle
    fireEvent.click(toggle);
    
    // disableForcedDemoMode should have been called
    expect(backendDetection.disableForcedDemoMode).toHaveBeenCalled();
    
    // UI should reflect the change
    expect(screen.getByRole('checkbox', { name: /Toggle Demo Mode/i })).not.toBeChecked();
  });
  
  it('cannot disable demo mode when forced by environment', () => {
    // Mock environment variable
    const originalEnv = process.env.NEXT_PUBLIC_DEMO_MODE;
    process.env.NEXT_PUBLIC_DEMO_MODE = 'true';
    
    render(<DemoModeToggle />);
    
    // Toggle should initially be checked
    const toggle = screen.getByRole('checkbox', { name: /Toggle Demo Mode/i });
    expect(toggle).toBeChecked();
    
    // Click the toggle
    fireEvent.click(toggle);
    
    // disableForcedDemoMode should have been called
    expect(backendDetection.disableForcedDemoMode).toHaveBeenCalled();
    
    // But toggle should still be checked because it's forced by environment
    expect(toggle).toBeChecked();
    
    // Restore original env
    process.env.NEXT_PUBLIC_DEMO_MODE = originalEnv;
  });
});