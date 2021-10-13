import { BrowserRouter, Switch, Route } from 'react-router-dom'
import CreateHID from './component/CreateHID';

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/"><CreateHID /></Route>
      </Switch>
    </BrowserRouter>
  );
}

export default App;
