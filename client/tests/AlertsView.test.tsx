import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { AlertsView } from '../src/components/views/AlertsView.js';
import * as AppContextModule from '../src/context/AppContext.js';
import { Alert } from '../src/types/index.js';

describe('AlertsView Component', () => {
  const mockAlerts: Alert[] = [
    {
      id: 'alert-1',
      type: 'FIRE_ALERT',
      severity: 'CRITICAL',
      title: 'FIRE IN ROOM',
      message: 'Dangerous heat detected',
      timestamp: Date.now() - 5000,
      status: 'ACTIVE',
    },
    {
      id: 'alert-2',
      type: 'POWER_ALERT',
      severity: 'WARNING',
      title: 'POWER WASTE',
      message: 'Lights left on',
      timestamp: Date.now() - 10000,
      status: 'RESOLVED',
      resolvedAt: Date.now() - 2000,
    },
  ];

  it('renders alerts and filters by status', () => {
    const mockResolve = vi.fn();
    const mockAcknowledge = vi.fn();

    vi.spyOn(AppContextModule, 'useApp').mockReturnValue({
      allAlerts: mockAlerts,
      activeAlerts: [mockAlerts[0]],
      resolveAlert: mockResolve,
      acknowledgeAlert: mockAcknowledge,
    } as any);

    render(<AlertsView />);

    expect(screen.getByText('FIRE IN ROOM')).toBeInTheDocument();
    expect(screen.getByText('POWER WASTE')).toBeInTheDocument();

    // Click 'ACTIVE' filter tab
    const activeTab = screen.getByRole('button', { name: 'ACTIVE' });
    fireEvent.click(activeTab);

    expect(screen.getByText('FIRE IN ROOM')).toBeInTheDocument();
    expect(screen.queryByText('POWER WASTE')).not.toBeInTheDocument();
  });
});
