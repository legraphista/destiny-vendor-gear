import React from 'react'
import {observer} from "mobx-react";
import {BungieIcon} from "../atoms/BungieIcon/BungieIcon";
import {BungieData} from "../../helpers/data/BungieData";
import classes from './Spider.module.scss';
import {Typography} from "@mui/material";
import {DestinyItemType} from "bungie-api-ts/destiny2/interfaces";
import classNames from "classnames";
import ArrowDownward from "@mui/icons-material/ArrowDownward";

export const Spider = observer(function Spider() {

  const { spider, spiderSells } = BungieData;
  if (!spider || !spiderSells) return null;

  const consummables = spiderSells.filter(x => x.item.itemType === DestinyItemType.Dummy);

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <BungieIcon
          displayProperties={spider.displayProperties}
          variant="largeIcon"
          className={classes.image}
          size="inherit"
        />
        <div className={classes.gradient}/>

        <div className={classes.text}>
          <Typography variant="h2" className={classes.name}>
            <b>{spider.displayProperties.name.toUpperCase()}</b>
          </Typography>
          <Typography variant="h6" className={classes.subName}>
            {spider.displayProperties.description}
          </Typography>
        </div>
      </div>

      <div className={classes.content}>
        <div className={classes.list}>
          {consummables.map(x => {
            return (
              <div
                className={classes.transaction}
                key={x.sale.itemHash}
              >
                <div className={classNames(classes.item, classes.cost)}>
                  {x.costItems[0].displayProperties.name}

                  <BungieIcon
                    displayProperties={x.costItems[0].displayProperties}
                    className={classes.itemImage}
                    size="inherit"
                  >
                    <div className={classes.itemQuantity}>
                      {
                        x.sale.costs[0].quantity <= 1 ?
                          '' :
                          x.sale.costs[0].quantity
                      }
                    </div>
                  </BungieIcon>
                </div>

                <ArrowDownward
                  className={classes.arrow}
                  fontSize="inherit"
                />

                <div className={classNames(classes.item, classes.receive)}>
                  {x.item.displayProperties.name.replace(/Purchase/i, '')}

                  <BungieIcon
                    displayProperties={x.item.displayProperties}
                    className={classes.itemImage}
                    size="inherit"
                  >
                    <div className={classes.itemQuantity}>
                      {
                        x.sale.quantity <= 1
                          ? ''
                          : x.sale.quantity
                      }
                    </div>
                  </BungieIcon>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
})
