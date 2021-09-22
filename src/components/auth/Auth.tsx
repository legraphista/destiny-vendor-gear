import * as React from 'react'
import {useEffect, useState} from 'react'
import Button from '@mui/material/Button';
import {beginAuthProcess, finishAuthProcess} from "./auth";
import {Alert} from "@mui/material";
import {BungieRequests} from "../../helpers/comms";
import {observer} from "mobx-react";

export const Auth = observer(function Auth() {
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const url = new URL(window.location.toString());

    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    if (code && state) {
      finishAuthProcess(code, state)
        .then((data) => {
          BungieRequests.setUserAuth(data);
          window.close();
        })
        .catch(setError);
    }
  }, [window.location.search, setError]);


  return (
    <div>
      <h2>Login</h2>
      <Button
        onClick={beginAuthProcess}
      >
        Login
      </Button>

      {error && (
        <Alert severity="error">
          {error.message}
        </Alert>
      )}
    </div>
  );
});
