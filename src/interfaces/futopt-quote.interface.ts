export interface FutOptQuote {
  symbol: string;
  name: string;
  status: string;
  referencePrice: number;
  limitUpPrice: number;
  limitDownPrice: number;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  lastPrice: number;
  lastSize: number;
  testPrice: number;
  testSize: number;
  testTime: number;
  totalVoluem: number;
  openInterest: number;
  bidOrders: number;
  askOrders: number;
  bidVolume: number;
  askVolume: number;
  bidPrice: number[];
  askPrice: number[];
  bidSize: number[];
  askSize: number[];
  extBidPrice: number;
  extAskPrice: number;
  extBidSize: number;
  extAskSize: number;
  lastUpdated: number;
}
