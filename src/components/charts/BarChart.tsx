'use client';

import { useState } from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styled from 'styled-components';
import CustomLegend from './CustomLegend';

interface BarChartProps {
  data: Array<{ [key: string]: string | number }>;
  dataKey: string;
  xAxisKey: string;
  title: string;
  color?: string;
}

interface LegendPayload {
  value: string;
  type?: string;
  id?: string;
  color?: string;
  dataKey?: string | number;
}

export default function BarChart({ data, dataKey, xAxisKey, title, color = '#8884d8' }: BarChartProps) {
  const [barColor, setBarColor] = useState(color);
  const [isHidden, setIsHidden] = useState(false);

  const handleColorChange = (newColor: string) => {
    setBarColor(newColor);
  };

  const handleToggle = () => {
    setIsHidden(!isHidden);
  };

  const renderCustomLegend = (props: object) => {
    const typedProps = props as { payload?: LegendPayload[] };
    const payload = typedProps.payload;
    if (!payload || payload.length === 0) return null;

    const legendItems = payload.map((entry) => ({
      id: entry.value,
      label: entry.value,
      color: barColor,
      isHidden: isHidden,
    }));

    return (
      <CustomLegend
        items={legendItems}
        onColorChange={(id, newColor) => handleColorChange(newColor)}
        onToggle={() => handleToggle()}
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
          <YAxis />
          <Tooltip />
          <Legend content={renderCustomLegend} />
          <Bar dataKey={dataKey} fill={barColor} hide={isHidden} />
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

