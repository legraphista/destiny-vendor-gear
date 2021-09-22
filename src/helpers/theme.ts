import {createTheme} from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      // default: 'rgb(32,0,73)',
      // paper: 'rgb(44,0,98)'
    }
  },
  components: {
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: 4
        }
      }
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          padding: 0
        }
      }
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: 0
        }
      }
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          padding: 0
        }
      }
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 0
        }
      }
    }
  }
})

