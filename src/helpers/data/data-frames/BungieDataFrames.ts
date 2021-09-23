import {DataFrame, DataFrameOptions} from "./index";
import {
  BungieMembershipType,
  DestinyComponentType,
  DestinyManifest,
  DestinyVendorsResponse,
  getDestinyManifestSlice,
  getProfile,
  getVendors
} from "bungie-api-ts/destiny2";
import {BungieRequests} from "../../comms";
import {AllDestinyManifestComponents} from "bungie-api-ts/destiny2/manifest";
import {getMembershipDataForCurrentUser, UserMembershipData} from "bungie-api-ts/user";
import {ServerResponse} from "bungie-api-ts/common";
import {computed} from "mobx";
import {DestinyProfileResponse} from "bungie-api-ts/destiny2/interfaces";

export class DestinyManifestFrame extends DataFrame<DestinyManifest> {

  protected async fetch() {
    const manifest: DestinyManifest = await BungieRequests.noApiKeyReq<DestinyManifest>({
      url: 'https://www.bungie.net/Platform/Destiny2/Manifest/',
      method: 'GET',
    }).then(serverResponseToData);

    return manifest;
  }
}

export const destinyManifest = new DestinyManifestFrame({ autoFetch: true });

export class DestinyDataFrame extends DataFrame<Pick<AllDestinyManifestComponents,
  'DestinyInventoryItemDefinition' |
  'DestinyItemCategoryDefinition' |
  'DestinyVendorDefinition' |
  'DestinyGenderDefinition' |
  'DestinyClassDefinition' |
  'DestinyRaceDefinition' |
  'DestinyStatDefinition'>> {
  protected async fetch() {
    const manifest = await destinyManifest.get();
    return await getDestinyManifestSlice(BungieRequests.noApiKeyReq, {
      destinyManifest: manifest,
      language: "en",
      tableNames: [
        'DestinyInventoryItemDefinition',
        'DestinyItemCategoryDefinition',
        'DestinyVendorDefinition',
        'DestinyGenderDefinition',
        'DestinyClassDefinition',
        'DestinyRaceDefinition',
        'DestinyStatDefinition'
      ]
    });
  }

}

export const destinyData = new DestinyDataFrame({ autoFetch: true });
// @ts-ignore
window.destinyData = destinyData;

function serverResponseToData<T>(resp: ServerResponse<T>): T {
  return resp.Response;
}

export class MembershipDataFrame extends DataFrame<UserMembershipData> {

  @computed get primaryMembershipId() {
    return this.data?.primaryMembershipId;
  }

  @computed get primaryMembership() {
    return this.data?.destinyMemberships.find(x => x.membershipId === this.primaryMembershipId);
  }

  @computed get primaryMembershipType() {
    return this.data?.destinyMemberships.find(x => x.membershipId === this.primaryMembershipId)?.membershipType;
  }

  protected async fetch() {
    return await getMembershipDataForCurrentUser(BungieRequests.userReq).then(serverResponseToData);
  }
}

export class CharactersDataFrame extends DataFrame<DestinyProfileResponse> {

  readonly membershipType: BungieMembershipType;
  readonly membershipId: string

  constructor(membershipType: BungieMembershipType, membershipId: string, options?: DataFrameOptions) {
    super(options);
    this.membershipType = membershipType;
    this.membershipId = membershipId;
  }

  protected async fetch() {

    const { membershipType, membershipId } = this;

    return await getProfile(BungieRequests.userReq, {
      membershipType,
      destinyMembershipId: membershipId,
      components: [DestinyComponentType.Characters]
    }).then(serverResponseToData);
  }
}


export class VendorsDataFrame extends DataFrame<DestinyVendorsResponse> {

  readonly characterId: string;
  readonly membershipType: BungieMembershipType;
  readonly membershipId: string

  constructor(characterId: string, membershipType: BungieMembershipType, membershipId: string, options?: DataFrameOptions) {
    super(options);
    this.characterId = characterId;
    this.membershipType = membershipType;
    this.membershipId = membershipId;
  }

  protected async fetch() {

    const { membershipType, membershipId, characterId } = this;

    return await getVendors(BungieRequests.userReq, {
      characterId,
      membershipType,
      destinyMembershipId: membershipId,
      components: [
        // DestinyComponentType.Vendors,
        DestinyComponentType.VendorSales,
        DestinyComponentType.ItemInstances,
        DestinyComponentType.ItemStats,
      ]
    }).then(serverResponseToData);
  }
}
