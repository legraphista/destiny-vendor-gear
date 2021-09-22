import {computed, makeObservable, observable} from "mobx";
import {CharactersDataFrame, destinyData, MembershipDataFrame, VendorsDataFrame} from "./data-frames/BungieDataFrames";
import {assertExists, assertTrue, objectKV, objectValues} from "../index";
import {BungieRequests} from "../comms";
import {
  DestinyInventoryItemDefinition,
  DestinyItemCategoryDefinition,
  DestinyItemType,
  DestinyStatAggregationType,
  DestinyStatCategory,
  DestinyVendorDefinition
} from "bungie-api-ts/destiny2";
import {ArmourSubTypeList, ArmourSubtypes, sortArmourStatsByHashes} from "../stats";
import {DestinyItemSubType} from "bungie-api-ts/destiny2/interfaces";

export class BungieDataClass {

  @computed get destiny() {
    return destinyData.data;
  }

  membership: MembershipDataFrame = new MembershipDataFrame();
  @observable.ref
  characters: CharactersDataFrame | null = null;
  @observable.ref
  vendors: VendorsDataFrame | null = null;

  @computed get characterData() {
    const data = this.characters?.data?.characters.data ?? {};
    return objectValues(data);
  }

  @computed get characterCount() {
    return Object.keys(this.characters?.data?.characters.data ?? {}).length;
  }

  @computed get fetching() {
    return this.membership.fetching || this.characters?.fetching || this.vendors?.fetching || false;
  }

  @computed get error() {
    return this.membership.error || this.characters?.error || this.vendors?.error || null;
  }

  @computed get canFetchVendors() {
    return !!this.membership.data && !!this.characters?.data
  }

  @computed get StatsDefs() {
    if (!this.destiny) return null;

    const { DestinyStatDefinition } = this.destiny;

    const list = objectKV(DestinyStatDefinition)
      .filter(([hash, stat]) =>
        stat.aggregationType === DestinyStatAggregationType.Character &&
        stat.statCategory === DestinyStatCategory.Defense
      )
      .map(([statHash, stat]) => ({ statHash, stat }));

    return sortArmourStatsByHashes(list);
  }

  @computed
  get ArmourTypeList() {

    const map = new Map<DestinyItemSubType, DestinyItemCategoryDefinition>();

    if (this.destiny) {
      const { DestinyItemCategoryDefinition } = this.destiny;
      objectValues(DestinyItemCategoryDefinition)
        .forEach(def => {
          map.set(def.grantDestinySubType, def);
        });
    }

    return ArmourSubTypeList.map(x => map.get(x));
  }

  @computed
  get gridData() {
    const vendorsData = this.vendors?.data;
    const { destiny } = this;

    if (!destiny || !vendorsData) {
      return null;
    }

    const list: {
      vendor: DestinyVendorDefinition,
      armor: {
        [s in ArmourSubtypes]?: {
          item: DestinyInventoryItemDefinition,
          stats: { [hash: number]: number }
        }
      }
    }[] = [];

    const maxStats: { [hash: number]: number } = {};

    for (const [vendorHash, vendorSales] of objectKV(vendorsData.sales.data!)) {
      const vendor = destiny.DestinyVendorDefinition[vendorHash as unknown as number];
      const components = vendorsData.itemComponents[vendorHash as unknown as number];

      // Yana doesn't have component instances
      if (!components) continue;

      const armourSales = objectKV(vendorSales.saleItems).filter(([_, saleItem]) => {
        const item = destiny.DestinyInventoryItemDefinition[saleItem.itemHash];
        return item.itemType === DestinyItemType.Armor;
      });

      // we don't care about vendors with no armor sales
      if (!armourSales.length) continue;

      const vendorData: typeof list[number] = {
        vendor,
        armor: {}
      }

      for (const [saleItemIdx, saleItem] of armourSales) {

        const item = destiny.DestinyInventoryItemDefinition[saleItem.itemHash];
        // const itemTypeDesc = allData.DestinyItemCategoryDefinition[item.itemCategoryHashes];
        // item.itemSubType

        // const cat = item.itemCategoryHashes?.map(c => allData.DestinyItemCategoryDefinition[c]);

        vendorData.armor[item.itemSubType as ArmourSubtypes] = {
          item,
          stats: {}
        }
        const armourStats = vendorData.armor[item.itemSubType as ArmourSubtypes]!;

        const stats = components.stats.data![saleItemIdx].stats;

        for (const [, stat] of objectKV(stats)) {
          // const statDesc = destiny.DestinyStatDefinition[statIndex];

          armourStats.stats[stat.statHash] = stat.value;
          maxStats[stat.statHash] = Math.max(maxStats[stat.statHash] ?? -Infinity, stat.value);
        }
      }

      list.push(vendorData);
    }

    console.log('computed max stats')
    return { list, maxStats };
  }

  constructor() {
    makeObservable(this);
  }

  populate = async () => {
    assertTrue(BungieRequests.isLoggedIn, 'you have to login first');

    await this.membership.populate();

    const { primaryMembershipId, primaryMembershipType } = this.membership;

    assertExists(primaryMembershipId && primaryMembershipType);

    this.characters = await new CharactersDataFrame(primaryMembershipType, primaryMembershipId).populate();

    await destinyData.populate();
  }

  fetchVendors = async (characterIndex: number) => {
    const character = this.characterData[characterIndex];
    assertExists(character);

    const { primaryMembershipId, primaryMembershipType } = this.membership;
    const { characterId } = character;
    assertExists(primaryMembershipId && primaryMembershipType);

    this.vendors = await new VendorsDataFrame(characterId, primaryMembershipType, primaryMembershipId).populate();
  }
}

export const BungieData = new BungieDataClass();

//@ts-ignore
window.BungieData = BungieData;
