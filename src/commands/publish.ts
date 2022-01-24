import { URL } from 'url';
import * as fs from 'fs';
import Puppeteer from 'puppeteer';
import * as tmp from 'tmp-promise';
import { Cookies } from '../types/cookies';

export class Publish {
  public constructor(private baseURL: URL, private cookies: Cookies) {}

  public async do(
    title: string,
    note: string,
    isHTMLNote: boolean,
    seasonNumber: number,
    episodeNumber: number,
    fileContent: Buffer,
    fileExtension: string,
    isDryrun: boolean,
  ): Promise<void> {
    const browser = await Puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setCookie(...this.cookies);

    const url = new URL('/dashboard/episode/new', this.baseURL);
    await page.goto(url.toString());
    // XXX wondering why, but networkidle0 and networkidle2 don't work expectedly...
    await page.waitForSelector('input[type=file]', {
      timeout: 15000,
    });

    const uploadButton = await page.$('input[type=file]');
    if (uploadButton == null) {
      throw new Error('file upload button not found');
    }

    const submitButtonSelector = 'button.styles__saveButton___lWrNZ'; // XXX flaky!
    const submitButton = await page.$(submitButtonSelector);
    if (submitButton == null) {
      throw new Error('submit button not found');
    }

    const tmpfile = await tmp.file({ postfix: `.${fileExtension}` });
    try {
      fs.writeFileSync(tmpfile.fd, fileContent);
      await uploadButton.uploadFile(tmpfile.path);
      await page.waitForTimeout(500); // XXX A buffer for the button's status transition
      await page.waitForSelector(`${submitButtonSelector}:not([disabled])`, {
        timeout: 1800000, // 30 mins
      });
    } finally {
      await tmpfile.cleanup();
    }

    await page.click(submitButtonSelector);

    await page.waitForSelector('#title', {
      timeout: 15000,
    });

    await page.focus('#title');
    await page.keyboard.type(title);

    if (isHTMLNote) {
      const buttons = await page.$x("//button[contains(., 'Switch to HTML')]");
      for (const button of buttons) {
        await button.click();
      }
    }
    await page.focus('textarea');
    await page.keyboard.type(note);

    await page.focus('#podcastSeasonNumber');
    await page.keyboard.type(seasonNumber.toString(10));

    await page.focus('#podcastEpisodeNumber');
    await page.keyboard.type(episodeNumber.toString(10));

    const buttonLabel = isDryrun ? 'Save as draft' : 'Publish now';
    const buttons = await page.$x(`//button[contains(., '${buttonLabel}')]`);
    if (buttons.length < 1) {
      throw new Error(`'${buttonLabel}' button not found`);
    }
    await buttons[0].click();
    await page.waitForTimeout(1000);

    await browser.close();

    return;
  }
}
