import {DestinyDisplayPropertiesDefinition} from "bungie-api-ts/destiny2";
import {DestinyVendorDisplayPropertiesDefinition} from "bungie-api-ts/destiny2/interfaces";
import {ExtractKeysOfValueType} from "../../helpers";
import React from "react";

type PropDefsSupport = DestinyDisplayPropertiesDefinition | DestinyVendorDisplayPropertiesDefinition


type BungieIconCommonProps = {
  size?: number | 'small' | 'large' | 'inherit'
  style?: React.CSSProperties
  className?: string
}

type BungieIconDisplayPropertiesProps<T extends PropDefsSupport = DestinyDisplayPropertiesDefinition> = {
  displayProperties: T
  variant?: ExtractKeysOfValueType<T, string>
} & BungieIconCommonProps;

type BungieIconURLProps = {
  url: string
  size?: number | 'small' | 'large' | 'inherit',
} & BungieIconCommonProps


export function BungieIcon<T extends PropDefsSupport = DestinyDisplayPropertiesDefinition>(props: BungieIconDisplayPropertiesProps<T> | BungieIconURLProps) {

  const {
    size = 24,
    style,
    className
  } = props;

  const realSize = (
    size === 'small' ? 24 :
      size === 'large' ? 48 :
        size
  );

  const icon = 'url' in props ?
    props.url :
    props.variant ?
      props.displayProperties[props.variant] :
      props.displayProperties.highResIcon ?? props.displayProperties.icon;

  return (
    <div
      style={{
        width: realSize,
        height: realSize,
        backgroundImage: `url(https://www.bungie.net/${icon})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        ...style
      }}
      className={className}
    />
  )
}
