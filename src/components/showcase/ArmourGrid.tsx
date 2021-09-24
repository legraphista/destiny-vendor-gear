import React from 'react'
import {observer} from "mobx-react";
import {BungieData} from "../../helpers/data/BungieData";
import {VendorHeadStone} from "../atoms/VendorHeadStone/VendorHeadStone";
import {ArmourSubtypes} from "../../helpers/stats";
import {StatsViewer} from "./StatViewer";
import classes from './ArmourGrid.module.scss';
import classNames from "classnames";
import {Table, TableBody, TableCell, TableHead, TableRow} from "@mui/material";

type ArmourGridProps = {
  className?: string
}

export const ArmourGrid = observer(function ArmourGrid(props: ArmourGridProps) {
  const data = BungieData.gridData;
  const { className } = props;
  if (!data) return null;

  return (
    <div className={classNames(classes.root, className)}>
      <Table className={classes.table}>
        {/* head */}
        <TableHead
          // className={classNames(classes.row, classes.header)}
        >
          <TableRow>
            {
              data.list.map(x => (
                <TableCell
                  key={x.vendor.hash}
                  width={100 / data.list.length + '%'}
                >
                  <VendorHeadStone
                    vendor={x.vendor}
                    className={classes.vendorHeadStone}
                  />
                </TableCell>
              ))
            }
          </TableRow>
        </TableHead>

        {/* body */}
        <TableBody>
          {BungieData.ArmourTypeList.map(armourType => {
            if (!armourType) return null;

            return (
              <TableRow key={armourType.hash} className={classes.row}>

                {data.list.map(({ vendor, armor: armours }, i) => {
                  const armour = armours[armourType.grantDestinySubType as ArmourSubtypes];

                  if (!armour) {
                    return (
                      <TableCell
                        key={i}
                        width={100 / data.list.length + '%'}
                      >-</TableCell>
                    )
                  }

                  const cantBuy = armour.saleItem.failureIndexes.length > 0;

                  const cantBuyReason = cantBuy && vendor.failureStrings[armour.saleItem.failureIndexes[0]]

                  return (

                    <TableCell
                      key={armour.item.hash}
                      width={100 / data.list.length + '%'}
                      className={classNames(
                        cantBuy && classes.cantBuy
                      )}
                    >
                      <StatsViewer
                        stats={armour.stats}
                        item={armour.item}
                      />
                      {cantBuy && (
                        <div className={classes.cantBuyReason}>
                          {cantBuyReason}
                        </div>
                      )}
                    </TableCell>

                  );
                })}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
});
