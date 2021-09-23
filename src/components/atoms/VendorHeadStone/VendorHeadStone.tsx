import React from 'react'
import {DestinyVendorDefinition} from "bungie-api-ts/destiny2";
import {BungieIcon} from "../BungieIcon";
import {Typography} from "@mui/material";
import classes from './VendorHeadStone.module.scss';
import classNames from "classnames";

export function VendorHeadStone({
  vendor,
  className,
  style
}: { vendor: DestinyVendorDefinition, className?: string, style?: React.CSSProperties }) {

  return (
    <div className={classNames(classes.root, className)} style={style}>
      <BungieIcon
        displayProperties={vendor.displayProperties}
        variant="largeIcon"
        className={classNames(classes.images, classes.background)}
        size="inherit"
      />
      <BungieIcon
        displayProperties={vendor.displayProperties}
        size="large"
        variant="smallTransparentIcon"
        className={classes.images}
        style={{
          transform: 'translate(-20%,-20%)'
        }}
      />
      <Typography
        className={classes.text}
      >
        {vendor.displayProperties.name}
      </Typography>
    </div>
  )
}
