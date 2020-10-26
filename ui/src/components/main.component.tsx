import React from 'react'
import { Helmet, HelmetProvider } from 'react-helmet-async'
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom'

import { DOCUMENT_DESCRIPTION, DOCUMENT_TITLE } from '../config/constants'
import { Body } from './common/layout/body.component'
import { Header } from './common/layout/header.component'
import { MainWrapper } from './common/layout/mainWrapper.component'
import { SearchProvider } from '../state/search.context'
import { Deals } from './deals.component'
import { GitHubCorners } from './gitHubCorners.component'

export const Main = () => {
  return (
    <HelmetProvider>
      <GitHubCorners />
      <Router>
        <MainWrapper>
          <Helmet>
            <title>{DOCUMENT_TITLE}</title>
            <meta content={DOCUMENT_DESCRIPTION} name="description" />
          </Helmet>
          <SearchProvider>
            <Header />
            <Body>
              <Switch>
                <Route exact path={['/', '/deal/:deal', '/:search']} component={Deals} />
                <Redirect to="/" />
              </Switch>
            </Body>
          </SearchProvider>
        </MainWrapper>
      </Router>
    </HelmetProvider>
  )
}
