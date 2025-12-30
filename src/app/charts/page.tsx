'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import BarChart from '@/components/charts/BarChart';
import DonutChart from '@/components/charts/DonutChart';
import StackedBarChart from '@/components/charts/StackedBarChart';
import StackedAreaChart from '@/components/charts/StackedAreaChart';
import MultiLineChart from '@/components/charts/MultiLineChart';
import { CoffeeBrandData, SnackBrandData, MoodTrendData, WorkoutTrendData, CoffeeConsumptionData, SnackImpactData } from '@/types/chart';

export default function ChartsPage() {
  const router = useRouter();
  const [coffeeBrands, setCoffeeBrands] = useState<CoffeeBrandData[]>([]);
  const [snackBrands, setSnackBrands] = useState<SnackBrandData[]>([]);
  const [moodTrend, setMoodTrend] = useState<MoodTrendData[]>([]);
  const [workoutTrend, setWorkoutTrend] = useState<WorkoutTrendData[]>([]);
  const [coffeeConsumption, setCoffeeConsumption] = useState<CoffeeConsumptionData | null>(null);
  const [snackImpact, setSnackImpact] = useState<SnackImpactData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 모든 Mock API 데이터를 병렬로 가져오기
        const [
          coffeeRes,
          snackRes,
          moodRes,
          workoutRes,
          consumptionRes,
          impactRes,
        ] = await Promise.all([
          fetch('/api/mock/top-coffee-brands'),
          fetch('/api/mock/popular-snack-brands'),
          fetch('/api/mock/weekly-mood-trend'),
          fetch('/api/mock/weekly-workout-trend'),
          fetch('/api/mock/coffee-consumption'),
          fetch('/api/mock/snack-impact'),
        ]);

        // 응답 처리
        const coffeeData = await coffeeRes.json();
        const snackData = await snackRes.json();
        const moodData = await moodRes.json();
        const workoutData = await workoutRes.json();
        const consumptionData = await consumptionRes.json();
        const impactData = await impactRes.json();

        // 데이터 설정 (실제 API 응답 구조에 맞게)
        if (Array.isArray(coffeeData)) {
          setCoffeeBrands(coffeeData);
        } else if (coffeeData.data && Array.isArray(coffeeData.data)) {
          setCoffeeBrands(coffeeData.data);
        }
        
        if (Array.isArray(snackData)) {
          setSnackBrands(snackData);
        } else if (snackData.data && Array.isArray(snackData.data)) {
          setSnackBrands(snackData.data);
        }
        
        if (Array.isArray(moodData)) {
          setMoodTrend(moodData);
        } else if (moodData.data && Array.isArray(moodData.data)) {
          setMoodTrend(moodData.data);
        }
        
        if (Array.isArray(workoutData)) {
          setWorkoutTrend(workoutData);
        } else if (workoutData.data && Array.isArray(workoutData.data)) {
          setWorkoutTrend(workoutData.data);
        }
        
        if (consumptionData.teams) {
          setCoffeeConsumption(consumptionData);
        } else if (consumptionData.data && consumptionData.data.teams) {
          setCoffeeConsumption(consumptionData.data);
        }
        
        if (impactData.departments) {
          setSnackImpact(impactData);
        } else if (impactData.data && impactData.data.departments) {
          setSnackImpact(impactData.data);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '데이터를 불러오는데 실패했습니다.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  if (loading) {
    return (
      <Container>
        <HomeButton onClick={() => router.push('/')}>
          이전 페이지
        </HomeButton>
        <Title>데이터 시각화</Title>
        <LoadingText>로딩 중...</LoadingText>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <HomeButton onClick={() => router.push('/')}>
          이전 페이지
        </HomeButton>
        <Title>데이터 시각화</Title>
        <ErrorText>{error}</ErrorText>
      </Container>
    );
  }

  return (
    <Container>
      <HomeButton onClick={() => router.push('/')}>
        이전 페이지
      </HomeButton>
      <Title>데이터 시각화</Title>

      {/* Top Coffee Brands */}
      <Section>
        <SectionTitle>Top Coffee Brands</SectionTitle>
        <ChartsGrid>
          <BarChart
            data={coffeeBrands.map(item => ({ brand: item.brand, popularity: item.popularity }))}
            dataKey="popularity"
            xAxisKey="brand"
            title="Top Coffee Brands (Bar Chart)"
            color="#8B4513"
          />
          <DonutChart
            data={coffeeBrands.map(item => ({ name: item.brand, value: item.popularity }))}
            title="Top Coffee Brands (Donut Chart)"
          />
        </ChartsGrid>
      </Section>

      {/* Popular Snack Brands */}
      <Section>
        <SectionTitle>Popular Snack Brands</SectionTitle>
        <ChartsGrid>
          <BarChart
            data={snackBrands.map(item => ({ name: item.name, share: item.share }))}
            dataKey="share"
            xAxisKey="name"
            title="Popular Snack Brands (Bar Chart)"
            color="#FF6B6B"
          />
          <DonutChart
            data={snackBrands.map(item => ({ name: item.name, value: item.share }))}
            title="Popular Snack Brands (Donut Chart)"
          />
        </ChartsGrid>
      </Section>

      {/* Weekly Mood Trend */}
      <Section>
        <SectionTitle>Weekly Mood Trend</SectionTitle>
        <ChartsGrid>
          <StackedBarChart
            data={moodTrend}
            xAxisKey="week"
            bars={[
              { dataKey: 'happy', name: 'Happy', color: '#82ca9d' },
              { dataKey: 'tired', name: 'Tired', color: '#ffc658' },
              { dataKey: 'stressed', name: 'Stressed', color: '#ff6b6b' },
            ]}
            title="Weekly Mood Trend (Stacked Bar Chart)"
          />
          <StackedAreaChart
            data={moodTrend}
            xAxisKey="week"
            areas={[
              { dataKey: 'happy', name: 'Happy', color: '#82ca9d' },
              { dataKey: 'tired', name: 'Tired', color: '#ffc658' },
              { dataKey: 'stressed', name: 'Stressed', color: '#ff6b6b' },
            ]}
            title="Weekly Mood Trend (Stacked Area Chart)"
          />
        </ChartsGrid>
      </Section>

      {/* Weekly Workout Trend */}
      <Section>
        <SectionTitle>Weekly Workout Trend</SectionTitle>
        <ChartsGrid>
          <StackedBarChart
            data={workoutTrend}
            xAxisKey="week"
            bars={[
              { dataKey: 'running', name: 'Running', color: '#ff7300' },
              { dataKey: 'cycling', name: 'Cycling', color: '#0088fe' },
              { dataKey: 'stretching', name: 'Stretching', color: '#00c49f' },
            ]}
            title="Weekly Workout Trend (Stacked Bar Chart)"
          />
          <StackedAreaChart
            data={workoutTrend}
            xAxisKey="week"
            areas={[
              { dataKey: 'running', name: 'Running', color: '#ff7300' },
              { dataKey: 'cycling', name: 'Cycling', color: '#0088fe' },
              { dataKey: 'stretching', name: 'Stretching', color: '#00c49f' },
            ]}
            title="Weekly Workout Trend (Stacked Area Chart)"
          />
        </ChartsGrid>
      </Section>

      {/* Coffee Consumption */}
      <Section>
        <SectionTitle>Coffee Consumption</SectionTitle>
        {coffeeConsumption && coffeeConsumption.teams && (() => {
          // 모든 팀의 cups 값을 수집하여 고유한 X축 값 생성
          const allCups = new Set<number>();
          coffeeConsumption.teams.forEach(team => {
            team.series.forEach(series => allCups.add(series.cups));
          });
          const sortedCups = Array.from(allCups).sort((a, b) => a - b);
          
          // 각 cups 값에 대해 모든 팀의 데이터를 포함하는 데이터 포인트 생성
          const chartData = sortedCups.map(cups => {
            const dataPoint: { [key: string]: number } = { cups };
            coffeeConsumption.teams.forEach(team => {
              const series = team.series.find(s => s.cups === cups);
              if (series) {
                dataPoint[`${team.team}_solid_bugs`] = series.bugs;
                dataPoint[`${team.team}_dashed_productivity`] = series.productivity;
              }
            });
            return dataPoint;
          });
          
          const teamColors = ['#8884d8', '#82ca9d', '#ffc658'];
          
          return (
            <MultiLineChart
              data={chartData}
              xAxisKey="cups"
              teams={coffeeConsumption.teams.map((team, index) => ({
                team: team.team,
                color: teamColors[index % teamColors.length],
                solidDataKey: 'bugs',
                dashedDataKey: 'productivity',
                solidName: 'Bugs',
                dashedName: 'Productivity',
              }))}
              title="Coffee Consumption Impact (Multi-Line Chart)"
              xAxisLabel="커피 섭취량 (잔/일)"
              leftYAxisLabel="버그 수"
              rightYAxisLabel="생산성 점수"
            />
          );
        })()}
      </Section>

      {/* Snack Impact */}
      <Section>
        <SectionTitle>Snack Impact</SectionTitle>
        {snackImpact && snackImpact.departments && (() => {
          // 모든 부서의 snacks 값을 수집하여 고유한 X축 값 생성
          const allSnacks = new Set<number>();
          snackImpact.departments.forEach(dept => {
            dept.metrics.forEach(metric => allSnacks.add(metric.snacks));
          });
          const sortedSnacks = Array.from(allSnacks).sort((a, b) => a - b);
          
          // 각 snacks 값에 대해 모든 부서의 데이터를 포함하는 데이터 포인트 생성
          const chartData = sortedSnacks.map(snacks => {
            const dataPoint: { [key: string]: number } = { snacks };
            snackImpact.departments.forEach(dept => {
              const metric = dept.metrics.find(m => m.snacks === snacks);
              if (metric) {
                dataPoint[`${dept.name}_solid_meetingsMissed`] = metric.meetingsMissed;
                dataPoint[`${dept.name}_dashed_morale`] = metric.morale;
              }
            });
            return dataPoint;
          });
          
          const deptColors = ['#8884d8', '#82ca9d', '#ffc658'];
          
          return (
            <MultiLineChart
              data={chartData}
              xAxisKey="snacks"
              teams={snackImpact.departments.map((dept, index) => ({
                team: dept.name,
                color: deptColors[index % deptColors.length],
                solidDataKey: 'meetingsMissed',
                dashedDataKey: 'morale',
                solidName: 'Meetings Missed',
                dashedName: 'Morale',
              }))}
              title="Snack Impact on Departments (Multi-Line Chart)"
              xAxisLabel="스낵 수"
              leftYAxisLabel="회의불참"
              rightYAxisLabel="사기"
            />
          );
        })()}
      </Section>
    </Container>
  );
}

const Container = styled.div`
  padding: 40px;
  max-width: 1400px;
  margin: 0 auto;
`;

const HomeButton = styled.button`
  padding: 8px 16px;
  background: #f8f9fa;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  margin-bottom: 20px;

  &:hover {
    background: #e9ecef;
    border-color: #adb5bd;
    transform: translateY(-1px);
  }
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 40px;
  color: #333;
`;

const Section = styled.section`
  margin-bottom: 60px;
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 30px;
  color: #444;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 20px;
`;

const LoadingText = styled.div`
  text-align: center;
  padding: 40px;
  font-size: 16px;
  color: #666;
`;

const ErrorText = styled.div`
  text-align: center;
  padding: 40px;
  font-size: 16px;
  color: #d32f2f;
`;

