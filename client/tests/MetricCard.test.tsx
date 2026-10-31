import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MetricCard } from '../src/components/MetricCard.js';
import { Thermometer } from 'lucide-react';

describe('MetricCard Component', () => {
  it('renders title, value, unit, and status badge', () => {
    render(
      <MetricCard
        title="Room Temperature"
        value="72.5"
        unit="°F"
        icon={<Thermometer data-testid="temp-icon" />}
        statusText="Optimal"
        statusType="normal"
        percentage={50}
        subtext="Threshold: 125°F"
      />
    );

    expect(screen.getByText('Room Temperature')).toBeInTheDocument();
    expect(screen.getByText('72.5')).toBeInTheDocument();
    expect(screen.getByText('°F')).toBeInTheDocument();
    expect(screen.getByText('Optimal')).toBeInTheDocument();
    expect(screen.getByText('Threshold: 125°F')).toBeInTheDocument();
  });

  it('applies danger styling when statusType is danger', () => {
    render(
      <MetricCard
        title="Temperature"
        value="135"
        icon={<Thermometer />}
        statusText="Fire Risk"
        statusType="danger"
      />
    );

    const badge = screen.getByText('Fire Risk');
    expect(badge.className).toContain('text-rose-300');
  });
});
