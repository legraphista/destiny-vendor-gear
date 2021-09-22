import {DestinyItemSubType} from "bungie-api-ts/destiny2/interfaces";

export type ArmourSubtypes =
  DestinyItemSubType.HelmetArmor |
  DestinyItemSubType.GauntletsArmor |
  DestinyItemSubType.ChestArmor |
  DestinyItemSubType.LegArmor |
  DestinyItemSubType.ClassArmor;

export const ArmourSubTypeList = [
  DestinyItemSubType.HelmetArmor,
  DestinyItemSubType.GauntletsArmor,
  DestinyItemSubType.ChestArmor,
  DestinyItemSubType.LegArmor,
  DestinyItemSubType.ClassArmor
] as const;

export const ArmourSubTypeNames = {
  [DestinyItemSubType.HelmetArmor]: 'Helmet',
  [DestinyItemSubType.GauntletsArmor] : 'Gauntlets',
  [DestinyItemSubType.ChestArmor]: 'Chest',
  [DestinyItemSubType.LegArmor]: 'Legs',
  [DestinyItemSubType.ClassArmor]: 'Class Item'
} as const;

export const KnownArmourStatsHashesObject = {
  mobility: '2996146975',
  resilience: '392767087',
  recovery: '1943323491',
  discipline: '1735777505',
  intellect: '144602215',
  strength: '4244567218'
}

export const KnownArmourStatList = [
  KnownArmourStatsHashesObject.mobility,
  KnownArmourStatsHashesObject.resilience,
  KnownArmourStatsHashesObject.recovery,
  KnownArmourStatsHashesObject.discipline,
  KnownArmourStatsHashesObject.intellect,
  KnownArmourStatsHashesObject.strength,
]

const statsSortMap = new Map(KnownArmourStatList.map((hash, index) => [hash, index]));

export function sortArmourStatsByHashes<T extends { statHash: number | string }>(list: T[]): T[] {
  list.sort((a, b) =>
    (statsSortMap.get(a.statHash.toString()) ?? 99) -
    (statsSortMap.get(b.statHash.toString()) ?? 99)
  );

  return list;
}

