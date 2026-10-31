import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { RoomView } from '../src/components/views/RoomView.js';
import * as AppContextModule from '../src/context/AppContext.js';

describe('RoomView Component', () => {
  it('displays Enter Room when user is outside and calls toggleRoomPresence on click', () => {
    const mockToggle = vi.fn();

    vi.spyOn(AppContextModule, 'useApp').mockReturnValue({
      roomOccupancy: {
        roomId: 'default',
        members: [],
        isOccupied: false,
        lastChanged: Date.now(),
      },
      toggleRoomPresence: mockToggle,
      otrkKey: 'DEMO-OTRK-999',
      currentUser: { name: 'Alex Johnson' },
    } as any);

    render(<RoomView />);

    expect(screen.getByText('You are OUTSIDE this room')).toBeInTheDocument();
    const enterBtn = screen.getByRole('button', { name: /ENTER ROOM/i });
    expect(enterBtn).toBeInTheDocument();

    fireEvent.click(enterBtn);
    expect(mockToggle).toHaveBeenCalledTimes(1);
  });

  it('displays Exit Room when user is inside', () => {
    vi.spyOn(AppContextModule, 'useApp').mockReturnValue({
      roomOccupancy: {
        roomId: 'default',
        members: ['DEMO-OTRK-999'],
        isOccupied: true,
        lastChanged: Date.now(),
      },
      toggleRoomPresence: vi.fn(),
      otrkKey: 'DEMO-OTRK-999',
      currentUser: { name: 'Alex Johnson' },
    } as any);

    render(<RoomView />);

    expect(screen.getByText('You are INSIDE this room')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /EXIT ROOM/i })).toBeInTheDocument();
  });
});
