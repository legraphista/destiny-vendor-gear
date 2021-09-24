import React, {useEffect} from 'react'
import {observer} from "mobx-react";
import {BungieData} from "../../helpers/data/BungieData";
import {Alert, AlertTitle, Paper, Tab, Tabs, Typography} from "@mui/material";
import classes from './ShowCase.module.scss';
import {ArmourGrid} from "./ArmourGrid";
import {destinyData, destinyManifest} from "../../helpers/data/data-frames/BungieDataFrames";
import {Loading} from "../atoms/Loading/Loading";
import {CharactersSelector} from "../atoms/CharactersSelector/CharactersSelector";
import {AppState} from "../../helpers/AppState";
import Shield from "@mui/icons-material/Shield";
import {BungieIcon} from "../atoms/BungieIcon/BungieIcon";
import Store from "@mui/icons-material/Store";
import classNames from "classnames";
import {Spider} from "./Spider";

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
        <Alert severity="error" className={classes.error}>
          <AlertTitle>Opps, something bad happened!</AlertTitle>
          {error.message}
        </Alert>
      )}

      <Tabs
        value={AppState.activePage}
        onChange={(e, v) => AppState.setActivePage(v)}
        centered
        className={classes.tabs}
      >
        <Tab
          value="armour"
          icon={<Shield/>}
          label="Armour"
        />
        <Tab
          value="spider"
          icon={BungieData.spider
            ? <BungieIcon displayProperties={BungieData.spider.displayProperties} variant="smallTransparentIcon"/>
            : <Store/>
          }
          label="Spider"
        />
      </Tabs>

      {AppState.activePage === 'armour' && (
        <>
          <CharactersSelector/>
          <ArmourGrid className={classNames(classes.dataGrid, classes.restrictedWidth)}/>
        </>
      )}

      {AppState.activePage === 'spider' && BungieData.spider && (
        <Spider/>
      )}

      {loading && (
        <div className={classes.loading}>
          <Loading/>

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
