import { environment } from '@env/environment';

export class Urls {
  public static readonly rates = {
    getQuotes: `${environment.backend}/api/generate-rate-quote`,
  };
}
