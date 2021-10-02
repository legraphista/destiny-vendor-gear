import {action, computed, flow, makeObservable, observable, reaction} from "mobx";
import {
  CharactersDataFrame,
  destinyData,
  destinyManifest,
  MembershipDataFrame,
  VendorsDataFrame
} from "./data-frames/BungieDataFrames";
import {assertExists, assertTrue, objectKV, objectValues} from "../index";
import {BungieRequests} from "../comms";
import {
  DestinyInventoryItemDefinition,
  DestinyItemCategoryDefinition,
  DestinyItemType,
  DestinyStatAggregationType,
  DestinyStatCategory,
  DestinyVendorDefinition,
  DestinyVendorSaleItemComponent
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

  @observable
  characterIndex = 0;

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
    return destinyManifest.error || destinyData.error || this.membership.error || this.characters?.error || this.vendors?.error || null;
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
          saleItem: DestinyVendorSaleItemComponent
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
          stats: {},
          saleItem: saleItem,
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

    return { list, maxStats };
  }

  @computed get spider() {
    if (!this.vendors?.data) return null;

    const { DestinyVendorDefinition } = this.destiny ?? {};
    if (!DestinyVendorDefinition) return null;

    return objectValues(DestinyVendorDefinition)
      .find(x => x.vendorIdentifier === "TANGLED_SHORE_SPIDER");
  }

  @computed get spiderSells() {
    if (!this.vendors?.data) return null;

    const { DestinyVendorDefinition, DestinyInventoryItemDefinition } = this.destiny ?? {};
    if (!DestinyVendorDefinition || !DestinyInventoryItemDefinition) return null;

    const spider = this.spider;
    assertExists(spider, 'Couldn\'t find Spider in the API');

    const spiderSales = this.vendors.data.sales.data?.[spider.hash]?.saleItems;
    assertExists(spiderSales, 'Couldn\'t find Spider\'s items to sell in the API');

    return objectValues(spiderSales).map(sale => {
      return {
        sale,
        item: DestinyInventoryItemDefinition[sale.itemHash],
        inventorySaleItemCounterpart: DestinyInventoryItemDefinition?.[SpiderPurchaseCurrencyToInventoryItems?.[sale.itemHash]] ?? null,
        costItems: sale.costs.map(cost => DestinyInventoryItemDefinition[cost.itemHash])
      }
    })
  }

  @computed get characterCurrencies() {
    const characters = this.characterData;
    const currentCharacter = characters[this.characterIndex];

    const currencies = this.characters?.data?.characterCurrencyLookups?.data?.[currentCharacter.characterId];

    return currencies?.itemQuantities || {};
  }

  constructor() {
    makeObservable(this);

    reaction(
      () => this.characterIndex,
      // todo add proper erroring here
      (idx) => this.fetchVendors(idx).catch(console.error)
    )
  }

  populate = flow(function* populate(this: BungieDataClass) {
    assertTrue(BungieRequests.isLoggedIn, 'You have to login first');

    yield this.membership.populate();

    const { primaryMembershipId, primaryMembershipType } = this.membership;

    assertExists(primaryMembershipId && primaryMembershipType, 'membership not found');

    this.characters = new CharactersDataFrame(primaryMembershipType, primaryMembershipId);
    yield this.characters.populate();

    yield destinyData.populate();
  })

  fetchVendors = flow(function* fetchVendors(this: BungieDataClass, characterIndex: number, holdWhileLoading = false) {
    const character = this.characterData[characterIndex];
    assertExists(character, 'character data not found');

    const { primaryMembershipId, primaryMembershipType } = this.membership;
    const { characterId } = character;
    assertExists(primaryMembershipId && primaryMembershipType, 'membership not found');

    const vendors = new VendorsDataFrame(characterId, primaryMembershipType, primaryMembershipId);

    if (holdWhileLoading) {
      yield vendors.populate();
      this.vendors = vendors;
    } else {
      this.vendors = vendors;
      yield vendors.populate()
    }
  });

  @action
  setCharacterIndex(index: number) {
    this.characterIndex = index;
  }
}

export const BungieData = new BungieDataClass();

//@ts-ignore
window.BungieData = BungieData;


export const SpiderPurchaseCurrencyToInventoryItems: { [s: number]: number } = {
  // Purchase Baryon Boughs
  778553120: 592227263,
  // Purchase Phaseglass
  924468777: 1305274547,
  // Purchase Simulation Seeds
  1420498062: 49145143,
  // Purchase Glacial Starwort
  1760701414: 1485756901,
  // Purchase Enhancement Cores
  1812969468: 3853748946,
  // Purchase Datalattice
  1845310989: 3487922223,
  // Purchase Helium Filaments
  1923884703: 3592324052,
  // Purchase Seraphite
  2536947844: 31293053,
  // Purchase Legendary Shards
  2654422615: 1022552290,
  // Purchase Enhancement Prisms
  3106913645: 4257549984,
  // Purchase Etheric Spiral
  3245502278: 1177810185,
  // Purchase Glimmer
  3664001560: 3159615086, // there are more types of glimmer
  // Purchase Dusklight Shards
  3721881826: 950899352,
  // Purchase Spinmetal Leaves
  4106973372: 293622383,
  // Purchase Alkane Dust
  4153440841: 2014411539,
}
