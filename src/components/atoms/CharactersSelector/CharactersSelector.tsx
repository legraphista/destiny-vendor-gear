import React from 'react'
import {observer} from "mobx-react";
import classes from "./CharactersSelector.module.scss";
import {CharacterHeadStone} from "../CharacterHeadStone/CharacterHeadStone";
import classNames from "classnames";
import {BungieData} from "../../../helpers/data/BungieData";

type CharactersSelectorProps = {
  className?: string
  style?: React.CSSProperties
}

export const CharactersSelector = observer(function CharactersSelector(props: CharactersSelectorProps) {
  const characters = BungieData.characterData;

  return (
    <div className={classNames(classes.characters, props.className)} style={props.style}>
      {characters.map((c, i) => (
        <CharacterHeadStone
          className={classNames(classes.character, i === BungieData.characterIndex && classes.selected)}
          onClick={() => BungieData.setCharacterIndex(i)}
          character={c}
          key={c.characterId}
        />
      ))}
    </div>
  )
})
