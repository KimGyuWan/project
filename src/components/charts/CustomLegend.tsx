'use client';

import { useState } from 'react';
import styled from 'styled-components';

interface LegendItemConfig {
  id: string;
  label: string;
  color: string;
  isHidden: boolean;
  iconStyle?: React.CSSProperties;
}

interface CustomLegendProps {
  items: LegendItemConfig[];
  onColorChange: (id: string, newColor: string) => void;
  onToggle: (id: string) => void;
  colorOptions?: string[];
}

const DEFAULT_COLOR_OPTIONS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe', '#00c49f', '#ffbb28', '#ff8042', '#ff6b6b', '#8B4513', '#00FF00'];

export default function CustomLegend({ 
  items, 
  onColorChange, 
  onToggle,
  colorOptions = DEFAULT_COLOR_OPTIONS
}: CustomLegendProps) {
  const [colorPickers, setColorPickers] = useState<{ [key: string]: boolean }>({});

  const toggleColorPicker = (id: string) => {
    setColorPickers(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleColorChange = (id: string, color: string) => {
    onColorChange(id, color);
    setColorPickers(prev => ({
      ...prev,
      [id]: false
    }));
  };

  if (!items || items.length === 0) return null;

  return (
    <LegendContainer>
      {items.map((item) => (
        <LegendItem key={item.id}>
          <LegendContent onClick={() => onToggle(item.id)}>
            <LegendIcon style={{ 
              backgroundColor: item.isHidden ? '#ccc' : item.color,
              opacity: item.isHidden ? 0.5 : 1,
              ...item.iconStyle
            }} />
            <LegendLabel style={{ opacity: item.isHidden ? 0.5 : 1 }}>
              {item.label}
            </LegendLabel>
          </LegendContent>
          <LegendActions>
            <ColorPickerButton onClick={(e) => {
              e.stopPropagation();
              toggleColorPicker(item.id);
            }}>
              🎨
            </ColorPickerButton>
            {colorPickers[item.id] && (
              <ColorPickerContainer>
                {colorOptions.map((c) => (
                  <ColorOption
                    key={c}
                    color={c}
                    onClick={() => handleColorChange(item.id, c)}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </ColorPickerContainer>
            )}
          </LegendActions>
        </LegendItem>
      ))}
    </LegendContainer>
  );
}

const LegendContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
`;

const LegendContent = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
`;

const LegendIcon = styled.span`
  width: 16px;
  height: 16px;
  border-radius: 2px;
  display: inline-block;
  cursor: pointer;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 0.7;
  }
`;

const LegendLabel = styled.span`
  font-size: 14px;
  color: #333;
  user-select: none;
`;

const LegendActions = styled.div`
  position: relative;
`;

const ColorPickerButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 2px 4px;
  opacity: 0.6;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 1;
  }
`;

const ColorPickerContainer = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 5px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px;
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  min-width: 200px;
`;

const ColorOption = styled.button`
  width: 24px;
  height: 24px;
  border: 2px solid #fff;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover {
    transform: scale(1.2);
    border-color: #333;
  }
`;

