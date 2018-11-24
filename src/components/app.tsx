import 'normalize.css';
import * as React from 'react';

import { InputText } from './input/text';
import * as appStyles from './styles/app.css';
import * as gridStyles from './styles/grid.css';

export function App() {
  return (
    <div className={gridStyles.container}>
      <div className={gridStyles.colOne}>
        <h1 className={appStyles.mainHeading}>Validation hooks.</h1>
        <InputText />
      </div>
    </div>
  );
}
