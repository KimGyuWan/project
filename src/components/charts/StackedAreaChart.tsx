'use client';

import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styled from 'styled-components';
import CustomLegend from './CustomLegend';

interface StackedAreaChartProps {
  data: Array<{ [key: string]: string | number }>;
  xAxisKey: string;
  areas: Array<{ dataKey: string; name: string; color: string }>;
  title: string;
}

interface LegendPayload {
  value: string;
  type?: string;
  id?: string;
  color?: string;
  dataKey?: string | number;
}

export default function StackedAreaChart({ data, xAxisKey, areas, title }: StackedAreaChartProps) {
  const [areaColors, setAreaColors] = useState<{ [key: string]: string }>(
    areas.reduce((acc, area) => ({ ...acc, [area.dataKey]: area.color }), {})
  );
  const [hiddenItems, setHiddenItems] = useState<Set<string>>(new Set());

  const handleColorChange = (dataKey: string, newColor: string) => {
    setAreaColors(prev => ({ ...prev, [dataKey]: newColor }));
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
      const area = areas.find(a => a.name === entry.value);
      const dataKey = area?.dataKey || '';
      return {
        id: dataKey,
        label: entry.value,
        color: areaColors[dataKey] || entry.color || '#8884d8',
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
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xAxisKey} />
          <YAxis 
            label={{ value: '%', angle: -90, position: 'insideLeft' }}
            domain={[0, 100]}
          />
          <Tooltip />
          <Legend content={renderCustomLegend} />
          {areas.map((area) => (
            <Area
              key={area.dataKey}
              type="monotone"
              dataKey={area.dataKey}
              stackId="1"
              stroke={areaColors[area.dataKey] || area.color}
              fill={areaColors[area.dataKey] || area.color}
              name={area.name}
              hide={hiddenItems.has(area.dataKey)}
            />
          ))}
        </AreaChart>
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

