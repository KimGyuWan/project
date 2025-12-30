'use client';

import { useState } from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styled from 'styled-components';
import CustomLegend from './CustomLegend';

interface StackedBarChartProps {
  data: Array<{ [key: string]: string | number }>;
  xAxisKey: string;
  bars: Array<{ dataKey: string; name: string; color: string }>;
  title: string;
}

interface LegendPayload {
  value: string;
  type?: string;
  id?: string;
  color?: string;
  dataKey?: string | number;
}

export default function StackedBarChart({ data, xAxisKey, bars, title }: StackedBarChartProps) {
  const [barColors, setBarColors] = useState<{ [key: string]: string }>(
    bars.reduce((acc, bar) => ({ ...acc, [bar.dataKey]: bar.color }), {})
  );
  const [hiddenItems, setHiddenItems] = useState<Set<string>>(new Set());

  const handleColorChange = (dataKey: string, newColor: string) => {
    setBarColors(prev => ({ ...prev, [dataKey]: newColor }));
  };

  const handleToggle = (dataKey: string) => {
    const newHidden = new Set(hiddenItems);
    if (newHidden.has(dataKey)) {
      newHidden.delete(dataKey);
    } else {
      newHidden.add(dataKey);
    }
    setHiddenItems(newHidden);
  };

  const renderCustomLegend = (props: object) => {
    const typedProps = props as { payload?: LegendPayload[] };
    const payload = typedProps.payload;
    if (!payload || payload.length === 0) return null;

    const legendItems = payload.map((entry) => {
      const bar = bars.find(b => b.name === entry.value);
      const dataKey = bar?.dataKey || '';
      return {
        id: dataKey,
        label: entry.value,
        color: barColors[dataKey] || entry.color || '#8884d8',
        isHidden: hiddenItems.has(dataKey),
      };
    });

    return (
      <CustomLegend
        items={legendItems}
        onColorChange={(id, newColor) => handleColorChange(id, newColor)}
        onToggle={(id) => handleToggle(id)}
      />
    );
  };

  return (
    <ChartContainer>
      <ChartTitle>{title}</ChartTitle>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xAxisKey} />
          <YAxis 
            label={{ value: '%', angle: -90, position: 'insideLeft' }}
            domain={[0, 100]}
          />
          <Tooltip />
          <Legend content={renderCustomLegend} />
          {bars.map((bar) => (
            <Bar 
              key={bar.dataKey} 
              dataKey={bar.dataKey} 
              stackId="a" 
              fill={barColors[bar.dataKey] || bar.color} 
              name={bar.name}
              hide={hiddenItems.has(bar.dataKey)}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

const ChartContainer = styled.div`
  width: 100%;
  height: 400px;
  padding: 20px;
  background: white;
`;

const ChartTitle = styled.h3`
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 600;
  color: #333;
`;

