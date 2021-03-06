import { HttpService, Injectable } from '@nestjs/common';
const csv = require('csvtojson');

@Injectable()
export class BotService {
  constructor(private httpService: HttpService) {}

  async getStockData(ticker: string) {
    const response = await this.httpService
      .get<string>(`https://stooq.com/q/l/?s=${ticker}&f=sd2t2ohlcv&h&e=csv`)
      .toPromise();

    const [dataRow]: StockDataResponse[] = await csv().fromString(
      response.data,
    );

    return dataRow;
  }
}
