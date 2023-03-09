import React, { useState, useEffect } from 'react'
import styled from 'styled-components';
import { networks } from '../config/networks'
import { parseQuery } from '../utils/urls'
import { INetwork } from '../utils/types';

const DropdownWrapper = styled.div`
  position: relative;        
`

const SelectedWrapper = styled.div`
  font-family: ${(props) => props.theme.fonts.fontFamily};
  font-size: ${(props) => props.theme.fonts.defaultSize};
  cursor: pointer;
  color: #f0f8ff;
  background: radial-gradient(circle, rgba(207, 224, 255, 0.62) 1px, transparent 1px) repeat-x;
`

const OptionWrapper = styled.li`
    margin: 0;
    padding: 0;
    color: inherit;
    &:hover  {
      background: #42c1ca;
    }
`

const MenuWrapper = styled.ul`
    position: absolute;
  
    list-style-type: none;
    margin: 5px 0;
    padding: 1px;
  
    border: 1px solid grey;
    width: 120px;
`

const AWrapper = styled.a`
  padding: 3px;
  width: 100%;
  color: white;
`

interface DropDownItemOpts {
  network: INetwork
}

const DropdowItem = (opts: DropDownItemOpts) => {
  return <OptionWrapper>
    <AWrapper href={`${opts.network.url}?network=${opts.network.id}`}
       rel="noopener noreferrer"
       target="_blank">
      {opts.network.label}
    </AWrapper>
  </OptionWrapper>
}

export const NetworkSwitcher = () => {
  const [open, setOpen] = useState(false);
  const [network, setNetwork] = useState(networks[0]);

  useEffect(
    () => {
      const parsedQuery = parseQuery()
      let found
      if(parsedQuery && parsedQuery.hasOwnProperty('network')) {
        // @ts-ignore
        found = networks.find(n => n.id === parsedQuery.network)
      }
      if(found) {
        setNetwork(found)
      }
    },
    []
  )

  const handleOpen = () => {
    setOpen(!open);
  };

  const options = networks.filter(n => n.id !== network.id)

  return (
    <DropdownWrapper>
      <SelectedWrapper onClick={handleOpen}>{network.label}</SelectedWrapper>
      {open ? (
        <MenuWrapper>
          {
            options.map(n => {
              return <DropdowItem key={n.id} network={n} />
            })
          }
        </MenuWrapper>
      ) : null}
    </DropdownWrapper>
  )
}

