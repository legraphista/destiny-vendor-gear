import React, {useCallback, useEffect, useState} from 'react'
import {observer} from "mobx-react";
import {BungieData} from "../../helpers/data/BungieData";
import {Alert, AlertTitle, CircularProgress, Paper, Typography} from "@mui/material";
import {CharacterHeadStone} from "../atoms/CharacterHeadStone/CharacterHeadStone";
import classes from './ShowCase.module.scss';
import classNames from "classnames";
import {ArmourGrid} from "./ArmourGrid";
import {destinyData, destinyManifest} from "../../helpers/data/data-frames/BungieDataFrames";
import {Loading} from "../atoms/Loading/Loading";
import {CharactersSelector} from "../atoms/CharactersSelector/CharactersSelector";

export const ShowCase = observer(function ShowCase() {

  const error = BungieData.error;
  const loading = BungieData.fetching;

  useEffect(() => {
    BungieData.populate()
      .then(() => {
        if (BungieData.characterCount > 0) {
          return BungieData.fetchVendors(0);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <Paper className={classes.root}>
      {error && (
        <Alert severity="error">
          <AlertTitle>Opps, something bad happened!</AlertTitle>
          {error.message}
        </Alert>
      )}

      <CharactersSelector/>
      <ArmourGrid className={classes.dataGrid}/>

      {loading && (
        <div className={classes.loading}>
          <Loading />

          {destinyManifest.fetching && (
            <Typography variant="h5">
              Fetching Destiny 2 Manifest...
            </Typography>
          )}

          {destinyData.fetching && (
            <Typography variant="h5">
              Fetching Destiny 2 Data...
            </Typography>
          )}

          {BungieData.membership.fetching && (
            <Typography variant="h5">
              Fetching Destiny 2 Profile...
            </Typography>
          )}

          {BungieData.characters?.fetching && (
            <Typography variant="h5">
              Fetching Destiny 2 Characters...
            </Typography>
          )}

          {BungieData.vendors?.fetching && (
            <Typography variant="h5">
              Fetching Destiny 2 Vendors...
            </Typography>
          )}

        </div>
      )}
    </Paper>
  )
});
