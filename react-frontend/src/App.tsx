import { CssBaseline, ThemeProvider } from "@material-ui/core";
import { SnackbarProvider } from "notistack";
import { Mapping } from "./components/mapping";
import theme from "./theme/theme";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider maxSnack={3}>
        <CssBaseline/>
        <Mapping/>
      </SnackbarProvider>
        
    </ThemeProvider>
    
  );
}

export default App;
