import React, {useEffect, useState} from 'react'
import {observer} from "mobx-react";
import {BungieData} from "../../helpers/data/BungieData";
import {ArmourSubTypeList, ArmourSubtypes} from "../../helpers/stats";
import {Paper, Table, TableBody, TableCell, TableHead, TableRow} from "@mui/material";
import {StatsViewer} from "./StatViewer";
import {BungieIcon} from "../atoms/BungieIcon";

export const ShowCase = observer(function ShowCase() {

  const [charIdx, setCharIdx] = useState(0);
  const [error, setError] = useState<null | Error>(null);

  useEffect(() => {
    BungieData.populate()
      .then(() => {
        if (BungieData.characterCount > 0) {
          return BungieData.fetchVendors(0);
        }
      })
      .catch(setError);
  }, [setError]);

  // useEffect(() => {
  //   if(BungieData.canFetchVendors) {
  //     BungieData.fetchVendors(charIdx).catch(setError);
  //   }
  // }, [BungieData.canFetchVendors, charIdx, setError]);

  const data = BungieData.gridData;

  return (
    <Paper>
    <pre>
      loading?: {JSON.stringify(BungieData.fetching)}<br/>
      error?: {error?.stack ?? error?.toString()}<br/>
      store error?: {BungieData.error?.stack}<br/>

    </pre>

      {data && (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>-</TableCell>
              {
                data.list.map(x => (
                  <TableCell key={x.vendor.hash}>
                    {x.vendor.displayProperties.name}
                  </TableCell>
                ))
              }
            </TableRow>
          </TableHead>
          <TableBody>
            {BungieData.ArmourTypeList.map(armourType => {
              if (!armourType) return null;

              return (
                <TableRow key={armourType.hash}>
                  <TableCell>
                    <BungieIcon displayProperties={armourType.displayProperties} size="small"/>
                    {armourType.displayProperties.name}
                  </TableCell>

                  {data?.list.map(({ vendor, armor: armours }) => {
                    const armour = armours[armourType.grantDestinySubType as ArmourSubtypes];

                    if (!armour) {
                      return <TableCell>-</TableCell>;
                    }

                    return (
                      <TableCell key={armour.item.hash}>
                        <StatsViewer
                          stats={armour.stats}
                          item={armour.item}
                          style={{
                            width: 200
                          }}
                        />
                      </TableCell>
                    );
                  })}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
    </Paper>
  )
});
