import * as _ from 'lodash';
import * as cheerio from 'cheerio';
import * as iconv from 'iconv-lite';
import * as numeral from 'numeral';
import { Scraper } from './scraper';
import { StockEps, StockRevenue } from '../interfaces';

export class MopsScraper extends Scraper {
  async fetchStocksEps(options: { exchange: string, year: number, quarter: number, symbol?: string }) {
    const { exchange, year, quarter, symbol } = options;
    const type: Record<string, string> = { 'TWSE': 'sii', 'TPEx': 'otc' };
    const form = new URLSearchParams({
      encodeURIComponent: '1',
      step: '1',
      firstin: '1',
      off: '1',
      isQuery: 'Y',
      TYPEK: type[exchange],
      year: numeral(year).subtract(1911).format(),
      season: numeral(quarter).format('00'),
    });
    const url = 'https://mops.twse.com.tw/mops/web/t163sb04';

    const response = await this.httpService.post(url, form);
    if (response.data.includes('查詢無資料!')) return null;

    const $ = cheerio.load(response.data);

    const data = $('.even,.odd').map((_, el) => {
      const td = $(el).find('td');
      const symbol = td.eq(0).text().trim();
      const name = td.eq(1).text().trim();
      const eps = numeral(td.eq(td.length - 1).text().trim()).value();
      return { exchange, symbol, name, eps, year, quarter };
    }).toArray() as StockEps[];

    return symbol ? data.find(data => data.symbol === symbol) : _.sortBy(data, 'symbol');
  }

  async fetchStocksRevenue(options: { exchange: string, year: number, month: number, foreign?: boolean, symbol?: string }) {
    const { exchange, year, month, foreign = false, symbol } = options;
    const type: Record<string, string> = { 'TWSE': 'sii', 'TPEx': 'otc' };
    const suffix = `${numeral(year).subtract(1911).value()}_${month}_${+foreign}`;
    const url = `https://mops.twse.com.tw/nas/t21/${type[exchange]}/t21sc03_${suffix}.html`;

    const response = await this.httpService.get(url, { responseType: 'arraybuffer' });
    const page = iconv.decode(response.data, 'big5');
    if (page.toString().includes('查無資料')) return null;

    const $ = cheerio.load(page);

    const data = $('tr [align=right]')
      .filter((_, el) => {
        const th = $(el).find('th');
        const td = $(el).find('td');
        return (th.length === 0) && !!td.eq(0).text();
      })
      .map((_, el) => {
        const td = $(el).find('td');
        const symbol = td.eq(0).text().trim();
        const name = td.eq(1).text().trim();
        const revenue = numeral(td.eq(2).text().trim()).value();
        return { exchange, symbol, name, revenue, year, month };
      })
      .toArray() as StockRevenue[];

    return symbol ? data.find(data => data.symbol === symbol) : _.sortBy(data, 'symbol');
  }
}



