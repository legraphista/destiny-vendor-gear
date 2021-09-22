import {DestinyDisplayPropertiesDefinition} from "bungie-api-ts/destiny2";

type BungieIconProps = {
  displayProperties: DestinyDisplayPropertiesDefinition
  size?: number | 'small' | 'large'
}

export function BungieIcon({ displayProperties, size = 24 }: BungieIconProps) {

  const realSize = (
    size === 'small' ? 24 :
      size === 'large' ? 48 :
        size
  );

  return (
    <div
      style={{
        width: realSize,
        height: realSize,
        background: `url(https://bungie.net/${displayProperties.highResIcon ?? displayProperties.icon})`,
        backgroundSize: 'contain'
      }}
    />
  )
}
