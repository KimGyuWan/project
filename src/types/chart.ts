// 차트 데이터 타입 정의

export interface CoffeeBrandData {
  brand: string;
  popularity: number;
}

export interface SnackBrandData {
  name: string;
  share: number;
}

export interface MoodTrendData {
  week: string;
  happy: number;
  tired: number;
  stressed: number;
  [key: string]: string | number;
}

export interface WorkoutTrendData {
  week: string;
  running: number;
  cycling: number;
  stretching: number;
  [key: string]: string | number;
}

export interface CoffeeConsumptionSeries {
  cups: number;
  bugs: number;
  productivity: number;
}

export interface CoffeeConsumptionTeam {
  team: string;
  series: CoffeeConsumptionSeries[];
}

export interface CoffeeConsumptionData {
  teams: CoffeeConsumptionTeam[];
}

export interface SnackImpactMetric {
  snacks: number;
  meetingsMissed: number;
  morale: number;
}

export interface SnackImpactDepartment {
  name: string;
  metrics: SnackImpactMetric[];
}

export interface SnackImpactData {
  departments: SnackImpactDepartment[];
}
