import * as _ from 'lodash';
import * as cheerio from 'cheerio';
import * as iconv from 'iconv-lite';
import { DateTime } from 'luxon';
import { Scraper } from './scraper';
import { asExchange, asIndustry } from '../utils';
import { FutOpt, Stock } from '../interfaces';

export class IsinScraper extends Scraper {
  async fetchListed(options: { symbol: string }) {
    const { symbol } = options;
    const url = `https://isin.twse.com.tw/isin/single_main.jsp?owncode=${symbol}`;
    const response = await this.httpService.get(url, { responseType: 'arraybuffer' });
    const page = iconv.decode(response.data, 'big5');
    const $ = cheerio.load(page);

    const data = $('.h4 tr').slice(1).map((_, el) => {
      const td = $(el).find('td');
      return {
        symbol: td.eq(2).text().trim(),
        name: td.eq(3).text().trim(),
        exchange: asExchange(td.eq(4).text().trim()),
        type: td.eq(5).text().trim(),
        industry: asIndustry(td.eq(6).text().trim()),
        listedDate: DateTime.fromFormat(td.eq(7).text().trim(), 'yyyy/MM/dd').toISODate(),
      } as Record<string, any>;
    }).toArray() as Stock[];

    return data;
  }

  async fetchListedStocks(options: { exchange: 'TWSE' | 'TPEx' }) {
    const { exchange } = options;
    const url = {
      'TWSE': 'https://isin.twse.com.tw/isin/class_main.jsp?market=1',
      'TPEx': 'https://isin.twse.com.tw/isin/class_main.jsp?market=2',
    };
    const response = await this.httpService.get(url[exchange], { responseType: 'arraybuffer' });
    const page = iconv.decode(response.data, 'big5');
    const $ = cheerio.load(page);

    const data = $('.h4 tr').slice(1).map((_, el) => {
      const td = $(el).find('td');
      return {
        symbol: td.eq(2).text().trim(),
        name: td.eq(3).text().trim(),
        exchange: asExchange(td.eq(4).text().trim()),
        type: td.eq(5).text().trim(),
        industry: asIndustry(td.eq(6).text().trim()),
        listedDate: DateTime.fromFormat(td.eq(7).text().trim(), 'yyyy/MM/dd').toISODate(),
      } as Record<string, any>;
    }).toArray() as Stock[];

    return data;
  }

  async fetchListedFutOpt(options?: { type?: 'F' | 'O'}) {
    const { type } = options ?? {};
    const url = 'https://isin.twse.com.tw/isin/class_main.jsp?market=7';
    const response = await this.httpService.get(url, { responseType: 'arraybuffer' });
    const page = iconv.decode(response.data, 'big5');
    const $ = cheerio.load(page);

    const data = $('.h4 tr').slice(1).map((_, el) => {
      const td = $(el).find('td');
      return {
        symbol: td.eq(2).text().trim(),
        name: td.eq(3).text().trim(),
        exchange: asExchange(td.eq(4).text().trim()),
        type: td.eq(5).text().trim(),
        listedDate: DateTime.fromFormat(td.eq(7).text().trim(), 'yyyy/MM/dd').toISODate(),
      } as Record<string, any>;
    }).toArray() as FutOpt[];

    return data.filter(row => {
      if (type === 'F') return row.type.includes('期貨');
      if (type === 'O') return row.type.includes('選擇權');
      return true;
    });
  }
}
