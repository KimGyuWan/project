'use client';

import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import styled from 'styled-components';
import CustomLegend from './CustomLegend';

interface DonutChartProps {
  data: Array<{ name: string; value: number }>;
  title: string;
  colors?: string[];
}


const DEFAULT_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#0088fe', '#00c49f', '#ffbb28', '#ff8042'];

export default function DonutChart({ data, title, colors = DEFAULT_COLORS }: DonutChartProps) {
  const [chartColors, setChartColors] = useState<string[]>(colors);
  const [hiddenItems, setHiddenItems] = useState<Set<string>>(new Set());

  const handleColorChange = (index: number, newColor: string) => {
    const newColors = [...chartColors];
    newColors[index] = newColor;
    setChartColors(newColors);
  };

  const handleToggle = (name: string) => {
    const newHidden = new Set(hiddenItems);
    if (newHidden.has(name)) {
      newHidden.delete(name);
    } else {
      newHidden.add(name);
    }
    setHiddenItems(newHidden);
  };

  const renderCustomLegend = () => {
    if (!data || data.length === 0) return null;

    const legendItems = data.map((item, index: number) => ({
      id: item.name,
      label: item.name,
      color: chartColors[index % chartColors.length],
      isHidden: hiddenItems.has(item.name),
    }));

    return (
      <CustomLegend
        items={legendItems}
        onColorChange={(id, newColor) => {
          const index = data.findIndex(item => item.name === id);
          if (index !== -1) {
            handleColorChange(index, newColor);
          }
        }}
        onToggle={(id) => handleToggle(id)}
      />
    );
  };

  return (
    <ChartContainer>
      <ChartTitle>{title}</ChartTitle>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data.filter(item => !hiddenItems.has(item.name))}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((_, index) => {
              if (hiddenItems.has(data[index].name)) return null;
              return (
                <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
              );
            })}
          </Pie>
          <Tooltip />
          <Legend content={renderCustomLegend} />
        </PieChart>
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

