import React from 'react'
import { Helmet, HelmetProvider } from 'react-helmet-async'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'

import { DOCUMENT_DESCRIPTION, DOCUMENT_TITLE } from '../config/constants'
import { Home } from '../pages/home'
import { Body } from './common/layout/body.component'
import { Header } from './common/layout/header.component'
import { MainWrapper } from './common/layout/mainWrapper.component'

export const Main = () => {
  return (
    <HelmetProvider>
      <Router>
        <MainWrapper>
          <Helmet>
            <title>{DOCUMENT_TITLE}</title>
            <meta content={DOCUMENT_DESCRIPTION} name="description" />
          </Helmet>
          <Header />
          <Body>
            <Switch>
              <Route path="/:search?" component={Home} />
            </Switch>
          </Body>
        </MainWrapper>
      </Router>
    </HelmetProvider>
  )
}
