import {HttpClientConfig} from "bungie-api-ts/http";
import * as querystring from "querystring";
import {API_TOKEN} from "./config";
import {UserTokensWithTimestamp} from "../components/auth/types";
import {action, computed, makeObservable, observable} from "mobx";
import {assertExists} from "./index";
import {ServerResponse} from "bungie-api-ts/common";

class BungieRequestsClass {

  @observable
  userToken: UserTokensWithTimestamp | null = null;

  constructor() {
    makeObservable(this);

    const tokenString = localStorage.getItem('tokens');
    if (tokenString) {
      this.userToken = JSON.parse(tokenString);
    }
  }

  @action
  setUserAuth = (t: UserTokensWithTimestamp) => {
    this.userToken = t;
    localStorage.setItem('tokens', JSON.stringify(t));
  }

  @computed
  get isLoggedIn() {
    return !!this.userToken && this.userToken.created + this.userToken.expires_in > Date.now() / 1000;
  }

  req = async <T>(config: HttpClientConfig & { headers?: { [s: string]: string | undefined }, noApiKey?: boolean }) => {

    let queryStrings = '';
    if (config.params) {
      Object.keys(config.params).forEach(k => {
        if (config.params[k] === undefined) {
          delete config.params[k];
        }
      });
      queryStrings = querystring.stringify(config.params);
    }

    const ret = await fetch(config.url + (queryStrings ? '?' + queryStrings : ''), {
      method: config.method,
      body: config.body,
      mode: "cors",
      headers: {
        ...(config.noApiKey ? {} : { 'X-API-Key': API_TOKEN }),
        ...config.headers
      }
    });


    if (ret.status === 401) {
      const text = await ret.text();

      throw new Error(`${ret.statusText} ${ret.status} ${config.url}\n${text}`);
    }

    try {
      const data: ServerResponse<T> = await ret.json() as ServerResponse<T>;

      if (data.ErrorCode > 1) {
        throw new Error(
          data.ErrorStatus + '\n' +
          data.MessageData + '\n' +
          JSON.stringify(data.MessageData)
        );
      }

      return data;
    } catch (e) {
      // console.error(text);
      throw e;
    }

  }

  userReq = async <T>(config: Parameters<BungieRequestsClass['req']>[0]) => {
    assertExists(this.userToken);

    // todo add token refresh

    if (!config.headers) {
      config.headers = {};
    }
    config.headers['Authorization'] = `${this.userToken.token_type} ${this.userToken.access_token}`;

    return this.req<T>(config);
  }

  noApiKeyReq = async <T>(config: Parameters<BungieRequestsClass['req']>[0]) => {
    config.noApiKey = true;
    return this.req<T>(config);
  }
}

export const BungieRequests = new BungieRequestsClass();

// @ts-ignore
window.BungieRequests = BungieRequests;
