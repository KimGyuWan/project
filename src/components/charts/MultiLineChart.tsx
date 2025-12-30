'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styled from 'styled-components';
import CustomLegend from './CustomLegend';

interface TeamLine {
  team: string;
  color: string;
  solidDataKey: string;
  dashedDataKey: string;
  solidName: string;
  dashedName: string;
}

interface MultiLineChartProps {
  data: Array<{ [key: string]: string | number }>;
  xAxisKey: string;
  teams: TeamLine[];
  title: string;
  xAxisLabel: string;
  leftYAxisLabel: string;
  rightYAxisLabel: string;
}

interface TooltipPayload {
  dataKey: string;
  name: string;
  value: number;
  color: string;
}

interface TooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string | number;
  xAxisKey: string;
}

interface DotProps {
  cx?: number;
  cy?: number;
}

interface LegendPayload {
  value: string;
  type?: string;
  id?: string;
  color?: string;
  dataKey?: string | number;
}

// 커스텀 툴팁: 호버된 라인의 팀 데이터만 표시
const CustomTooltip = ({ active, payload, label, xAxisKey }: TooltipProps) => {
  if (active && payload && payload.length) {
    // 호버된 라인의 팀 정보 추출
    const hoveredDataKey = payload[0].dataKey;
    const teamMatch = hoveredDataKey.match(/^(.+?)_(solid|dashed)_/);
    const hoveredTeam = teamMatch ? teamMatch[1] : null;
    
    if (!hoveredTeam) return null;
    
    // 해당 팀의 데이터만 필터링
    const teamData = payload.filter((p) => 
      p.dataKey.startsWith(`${hoveredTeam}_`)
    );
    
    return (
      <TooltipContainer>
        <TooltipLabel>{`${xAxisKey === 'cups' ? '커피 섭취량' : '스낵 수'}: ${label}`}</TooltipLabel>
        {teamData.map((entry, index: number) => {
          const isDashed = entry.dataKey.includes('dashed');
          
          return (
            <TooltipItem key={index} color={entry.color}>
              <TooltipDot style={{ 
                borderStyle: isDashed ? 'dashed' : 'solid',
                borderWidth: '2px',
                borderColor: entry.color,
                backgroundColor: isDashed ? 'transparent' : entry.color,
                width: isDashed ? '12px' : '8px',
                height: isDashed ? '12px' : '8px',
                borderRadius: isDashed ? '2px' : '50%'
              }} />
              {entry.name}: {entry.value}
            </TooltipItem>
          );
        })}
      </TooltipContainer>
    );
  }
  return null;
};

// 사각형 마커 컴포넌트 (각 팀별로 생성)
const createSquareDot = (color: string) => {
  const SquareDot = (props: DotProps) => {
    const { cx, cy } = props;
    if (cx === undefined || cy === undefined) {
      return <g />;
    }
    return (
      <rect
        x={cx - 5}
        y={cy - 5}
        width={10}
        height={10}
        fill={color}
        stroke={color}
        strokeWidth={2}
      />
    );
  };
  SquareDot.displayName = `SquareDot(${color})`;
  return SquareDot;
};

export default function MultiLineChart({ 
  data, 
  xAxisKey, 
  teams, 
  title,
  xAxisLabel,
  leftYAxisLabel,
  rightYAxisLabel
}: MultiLineChartProps) {
  const [teamColors, setTeamColors] = useState<{ [key: string]: string }>(
    teams.reduce((acc, team) => ({ ...acc, [team.team]: team.color }), {})
  );
  const [hiddenItems, setHiddenItems] = useState<Set<string>>(new Set());

  const handleColorChange = (teamName: string, newColor: string) => {
    setTeamColors(prev => ({ ...prev, [teamName]: newColor }));
  };

  const handleToggle = (lineName: string) => {
    const newHidden = new Set(hiddenItems);
    if (newHidden.has(lineName)) {
      newHidden.delete(lineName);
    } else {
      newHidden.add(lineName);
    }
    setHiddenItems(newHidden);
  };

  const renderCustomLegend = (props: object) => {
    const typedProps = props as { payload?: LegendPayload[] };
    const payload = typedProps.payload;
    if (!payload || payload.length === 0) return null;

    // 팀별로 그룹화
    const teamGroups: { [key: string]: LegendPayload[] } = {};
    payload.forEach((entry) => {
      const dataKeyStr = typeof entry.dataKey === 'string' ? entry.dataKey : String(entry.dataKey || '');
      const valueStr = typeof entry.value === 'string' ? entry.value : String(entry.value || '');
      const teamMatch = dataKeyStr.match(/^(.+?)_(solid|dashed)_/) || valueStr.match(/^(.+?)\s*-\s*/);
      const teamName = teamMatch ? teamMatch[1] : valueStr;
      if (!teamGroups[teamName]) {
        teamGroups[teamName] = [];
      }
      teamGroups[teamName].push(entry);
    });

    const legendItems: Array<{
      id: string;
      label: string;
      color: string;
      isHidden: boolean;
      iconStyle?: React.CSSProperties;
      groupId?: string;
    }> = [];

    Object.entries(teamGroups).forEach(([teamName, entries]) => {
      const currentColor = teamColors[teamName] || teams.find(t => t.team === teamName)?.color || '#8884d8';
      entries.forEach((entry) => {
        const dataKeyStr = typeof entry.dataKey === 'string' ? entry.dataKey : String(entry.dataKey || '');
        const valueStr = typeof entry.value === 'string' ? entry.value : String(entry.value || '');
        const isDashed = dataKeyStr.includes('dashed') || valueStr.includes(teams.find(t => t.team === teamName)?.dashedName || '');
        const entryId = dataKeyStr || valueStr;
        const isHidden = hiddenItems.has(entryId);
        legendItems.push({
          id: entryId,
          label: valueStr,
          color: currentColor,
          isHidden,
          iconStyle: {
            borderStyle: isDashed ? 'dashed' : 'solid',
            borderWidth: '2px',
            borderColor: isHidden ? '#ccc' : currentColor,
            backgroundColor: isDashed ? 'transparent' : (isHidden ? '#ccc' : currentColor),
            width: isDashed ? '12px' : '8px',
            height: isDashed ? '12px' : '8px',
            borderRadius: isDashed ? '2px' : '50%',
            opacity: isHidden ? 0.5 : 1
          },
          groupId: teamName,
        });
      });
    });

    // 팀별로 그룹화된 렌더링을 위해 커스텀 렌더링
    const teamGroupsForRender: { [key: string]: typeof legendItems } = {};
    legendItems.forEach(item => {
      const groupId = item.groupId || '';
      if (!teamGroupsForRender[groupId]) {
        teamGroupsForRender[groupId] = [];
      }
      teamGroupsForRender[groupId].push(item);
    });

    return (
      <LegendContainer>
        {Object.entries(teamGroupsForRender).map(([teamName, items]) => (
          <LegendGroup key={teamName}>
            {items.map((item, index) => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CustomLegend
                  items={[item]}
                  onColorChange={(id, newColor) => {
                    if (id === item.id && index === 0) {
                      handleColorChange(teamName, newColor);
                    }
                  }}
                  onToggle={(id) => handleToggle(id)}
                />
              </div>
            ))}
          </LegendGroup>
        ))}
      </LegendContainer>
    );
  };

  return (
    <ChartContainer>
      <ChartTitle>{title}</ChartTitle>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey={xAxisKey} 
            label={{ value: xAxisLabel, position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            yAxisId="left"
            label={{ value: leftYAxisLabel, angle: -90, position: 'insideLeft' }}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right"
            label={{ value: rightYAxisLabel, angle: 90, position: 'insideRight' }}
          />
          <Tooltip content={<CustomTooltip xAxisKey={xAxisKey} />} />
          <Legend content={renderCustomLegend} />
          {teams.map((team) => {
            const currentColor = teamColors[team.team] || team.color;
            const solidKey = `${team.team}_solid_${team.solidDataKey}`;
            const dashedKey = `${team.team}_dashed_${team.dashedDataKey}`;
            return (
              <>
                {/* 실선: 버그 수 또는 회의불참 (원형 마커) */}
                <Line
                  key={solidKey}
                  yAxisId="left"
                  type="monotone"
                  dataKey={solidKey}
                  stroke={currentColor}
                  name={`${team.team} - ${team.solidName}`}
                  strokeWidth={2}
                  dot={{ fill: currentColor, r: 5, strokeWidth: 2 }}
                  activeDot={{ r: 7 }}
                  hide={hiddenItems.has(solidKey)}
                />
                {/* 점선: 생산성 또는 사기 (사각형 마커) */}
                <Line
                  key={dashedKey}
                  yAxisId="right"
                  type="monotone"
                  dataKey={dashedKey}
                  stroke={currentColor}
                  name={`${team.team} - ${team.dashedName}`}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={createSquareDot(currentColor)}
                  activeDot={{ r: 7 }}
                  hide={hiddenItems.has(dashedKey)}
                />
              </>
            );
          })}
        </LineChart>
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

const TooltipContainer = styled.div`
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`;

const TooltipLabel = styled.div`
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
`;

const TooltipItem = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${props => props.color};
  font-size: 14px;
  margin-bottom: 4px;
`;

const TooltipDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
`;

const LegendContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  column-gap: 20px;
  margin-top: 20px;
`;

const LegendGroup = styled.div`
  display: flex;
  flex-direction: column;
  column-gap: 8px;
`;

