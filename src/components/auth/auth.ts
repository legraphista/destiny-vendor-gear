import {OAUTH_CLIENT_ID} from "../../helpers/config";
import {v4 as uuid} from 'uuid';
import {UserTokensWithTimestamp} from "./types";

export function beginAuthProcess() {
  const state = uuid();
  localStorage.setItem('login_state', state);
  window.open(
    `https://www.bungie.net/en/oauth/authorize?client_id=${OAUTH_CLIENT_ID}&response_type=code&state=${state}`,
    '_blank'
  );
}

export async function finishAuthProcess(code: string, state: string): Promise<UserTokensWithTimestamp> {
  if (state !== localStorage.getItem('login_state')) {
    throw new Error('Invalid login state! Please try again!');
  }
  localStorage.removeItem('login_state');

  const res = await fetch(
    'https://www.bungie.net/platform/app/oauth/token/',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `grant_type=authorization_code&code=${encodeURIComponent(code)}&client_id=${encodeURIComponent(OAUTH_CLIENT_ID)}`
    }
  );

  const data = await res.json();

  if (data.error) {
    throw new Error(`Bungie: ${data.error_description || data.error}`);
  }

  return {
    ...data,
    created: Date.now() / 1000
  }
}
