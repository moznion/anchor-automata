# anchor-automata

A library to make automation for [Anchor.fm](https://anchor.fm).

## Status

THIS LIBRARY IS UNDER-DEVELOPMENT STATUS. DON'T USE THIS ON THE PRODUCTION GROUND.

And this won't cover all the functions, i.e. this library implements the functions what I wanted.
But of course, feature requests are welcome.

## Example

### Make an episode draft

```typescript
import { URL } from 'url';
import * as fs from 'fs';
import { Signin, Publish } from '@moznion/anchor-automata';

(async (): Promise<void> => {
  const baseURL = new URL('https://anchor.fm');

  const signinCmd = new Signin(baseURL);
  const cookies = await signinCmd.do('your-email', 'your-password');

  const publishCmd = new Publish(baseURL, cookies);
  const buff = await fs.readFileSync('/path/to/your/audio.mp4');
  await publishCmd.do(
    'episode title',
    `this is an awesome episode!!<br>
<a href='https://example.com'>https://example.com</a>
`,
    true, // <= HTML supported note
    1, // <= season number
    100, // <= episode number
    buff,
    'mp4',
    true, // <= dry-run mode (i.e. if true, it just makes a draft)
  );
})();
```

## Features

- sign-in
- publish an episode

## Author

moznion (<moznion@mail.moznion.net>)

## License

MIT

