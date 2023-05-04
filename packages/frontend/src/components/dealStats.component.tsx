import styled from 'styled-components'
import { useStats } from '../hooks/useStats.hook'
import prettyBytes from 'pretty-bytes';
import React from 'react';
import * as table from './common/layout/table.component'

const { Table, TH, THead } = table

const StatValue = styled.th`
  font-family: Poppins;
  font-size: 16px;
  font-weight: 800;
  line-height: 18px;
  text-align: left;
  color: #cfe0ff;
  text-transform: uppercase;
`

export const DealStats = () => {
  const { stats } = useStats()
  return (
    <>
      <Table>
        <THead>
          <tr>
            <TH>TOTAL UNIQUE CIDS</TH>
            <TH>TOTAL UNIQUE PROVIDERS</TH>
            <TH>TOTAL UNIQUE CLIENTS</TH>
            <TH>TOTAL STORAGE DEALS</TH>
            <TH>TOTAL DATA STORED</TH>
            <TH>LATEST HEIGHT</TH>
          </tr>
        </THead>
        <tbody>
          <tr>
            <StatValue>{stats?.numberOfUniqueCIDs}</StatValue>
            <StatValue>{stats?.numberOfUniqueProviders}</StatValue>
            <StatValue>{stats?.numberOfUniqueClients}</StatValue>
            <StatValue>{stats?.totalDeals}</StatValue>
            <StatValue>
              {stats && stats.totalDealSize ? prettyBytes(stats.totalDealSize) : null}
            </StatValue>
            <StatValue>{stats?.latestHeight}</StatValue>
            </tr>
        </tbody>
      </Table>
    </>
  )
}