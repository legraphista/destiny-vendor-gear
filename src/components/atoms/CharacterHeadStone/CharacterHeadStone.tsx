import React from 'react'
import {observer} from "mobx-react";
import {DestinyCharacterComponent} from "bungie-api-ts/destiny2";
import classNames from "classnames";
import classes from './CharacterHeadStone.module.scss';
import {BungieIcon} from "../BungieIcon/BungieIcon";
import {BungieData} from "../../../helpers/data/BungieData";

type CharacterHeadStoneProps = {
  character: DestinyCharacterComponent
  style?: React.CSSProperties,
  className?: string
  onClick?: React.HTMLProps<HTMLDivElement>['onClick']
}
export const CharacterHeadStone = observer(function CharacterHeadStone(props: CharacterHeadStoneProps) {
  const { character, style, className, onClick } = props;
  const destiny = BungieData.destiny;

  return (
    <div
      className={classNames(classes.wrapper, className)}
      style={style}
      onClick={onClick}
    >
      <div className={classes.ar}>
        <div className={classes.content}>
          <BungieIcon
            url={character.emblemBackgroundPath}
            size="inherit"
            className={classes.background}
          />

          <svg viewBox="0 0 100 18" className={classes.class}>
            <text x="0" y="15" fill="white">
              {destiny?.DestinyClassDefinition[character.classHash]?.displayProperties.name ?? character.classHash}
            </text>
          </svg>

          <svg viewBox="0 0 100 18" className={classes.subtext}>
            <text x="0" y="15" fill="white">
              {destiny?.DestinyRaceDefinition[character.raceHash]?.displayProperties.name ?? character.raceHash}
              {/*{destiny?.DestinyGenderDefinition[character.genderHash]?.displayProperties.name ?? character.genderHash}*/}
            </text>
          </svg>
        </div>
      </div>
    </div>
  )
})
