import { URL } from 'url';
import Puppeteer from 'puppeteer';
import { Cookies } from '../types/cookies';

export class Signin {
  public constructor(private baseURL: URL) {}

  public async do(email: string, password: string): Promise<Cookies> {
    const browser = await Puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    const url = new URL('/login', this.baseURL);
    await page.goto(url.toString());
    await page.type('#email', email);
    await page.type('#password', password);
    await page.click('#LoginForm > div > button');
    await page.waitForNavigation({ timeout: 60000, waitUntil: 'domcontentloaded' });
    const cookies = await page.cookies();
    await browser.close();
    return cookies;
  }
}
