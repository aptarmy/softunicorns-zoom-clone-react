import React from 'react';
import { BrowserRouter as Router, Switch, Route, /*Link*/ } from "react-router-dom";

const Home = React.lazy(() => import('./pages/Home'));
const Room = React.lazy(() => import('./pages/Room'));

const App = () => {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <Router>
        <Switch>
          <Route path="/room" render={() => <Room/>} />
          <Route path="/" render={() => <Home/>} />
        </Switch>
      </Router>
    </React.Suspense>
  );
}

export default App;
