import React from 'react'
import {observer} from "mobx-react";
import {DestinyInventoryItemDefinition} from "bungie-api-ts/destiny2";
import {Card, CardContent, CardHeader, List, ListItem, ListItemIcon, ListItemText, Tooltip} from "@mui/material";
import {BungieData} from "../../helpers/data/BungieData";
import {BungieIcon} from "../atoms/BungieIcon/BungieIcon";
import {StatLine} from "../atoms/StatLine";
import {objectValues} from "../../helpers";


type StatViewerProps = {
  item: DestinyInventoryItemDefinition,
  stats: { [hash: number]: number }
  style?: React.CSSProperties
  className?: string
}
export const StatsViewer = observer(function StatsViewer(props: StatViewerProps) {
  const { item, stats } = props;
  const { StatsDefs } = BungieData;

  if (!StatsDefs) return null;

  const totalPoints = objectValues(stats).reduce((a, c) => a + c, 0);
  const isGold = totalPoints >= 58;

  return (
    <Card
      style={{
        ...props.style,
        padding: 2,
        boxShadow: isGold ? 'inset 0 0 2px 1px gold ' : undefined,
      }}
      className={props.className}
    >
      <CardHeader
        title={item.displayProperties.name}
        subheader={item.displayProperties.description}
        avatar={
          <BungieIcon displayProperties={item.displayProperties} size="large"/>
        }
      />
      <CardContent>
        <List>
          {StatsDefs.map(({ statHash, stat }) => {

            const statValue = stats[statHash] ?? 0;

            return (
              <ListItem key={statHash}>
                <Tooltip title={stat.displayProperties.name}>
                  <ListItemIcon>
                    <BungieIcon displayProperties={stat.displayProperties}/>
                  </ListItemIcon>
                </Tooltip>

                <ListItemText
                  primary={statValue}
                  style={{width: 28}}
                />

                <StatLine
                  value={statValue}
                  displayProperties={stat.displayProperties}
                  isMax={statValue === BungieData.gridData?.maxStats[statHash]}
                />
              </ListItem>
            )

          })}

          <ListItem>
            <ListItemText
              primary={`Total: ${totalPoints}`}
              style={{
                color: isGold ? 'gold' : undefined
              }}
            />
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
})
