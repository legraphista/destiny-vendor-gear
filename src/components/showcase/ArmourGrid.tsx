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
      <Table
        // className={classes.table}
        >
        {/* head */}
        <TableHead
          // className={classNames(classes.row, classes.header)}
        >
          <TableRow>
            {
              data.list.map(x => (
                <TableCell
                  // className={classes.cell}
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

                  return (
                    <TableCell
                      key={armour?.item.hash ?? i}
                      // className={classes.cell}
                      width={100 / data.list.length + '%'}
                    >
                      {armour && (
                        <StatsViewer
                          stats={armour.stats}
                          item={armour.item}
                        />
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
