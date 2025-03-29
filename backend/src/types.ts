
export interface CountyEVData {
  county: string;
  totalEvs: number;
  chargingStations: number;
}

export interface EVRatioData {
  county: string;
  totalEvs: number;
  chargingStations: number;
  ratio: number;
}

export interface PopularModelData {
  make: string;
  model: string;
  count: number;
}

export interface BrandComparisonData {
  make: string;
  count: number;
}
