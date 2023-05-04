import styled from 'styled-components'

export const Table = styled.table`
  table-layout: fixed;
  width: 100%;
`

export const TH = styled.th`
  font-family: Poppins;
  font-size: 12px;
  font-weight: 600;
  line-height: 18px;
  text-align: left;
  color: #cfe0ff;
  text-transform: uppercase;
`

export const THead = styled.thead`
  border-bottom: none;
`

export const THFirst = styled(TH)`
  width: 35%;
  @media (max-width: ${(props) => props.theme.themeBreakPoints.xs}) {
    width: 20%;
  }
`
export const THSecond = styled(TH)`
  @media (max-width: ${(props) => props.theme.themeBreakPoints.lg}) {
    width: 30px;
    visibility: hidden;
  }
`
export const THThird = styled(TH)``

export const THFourth = styled(TH)``

export const THFive = styled(TH)`
  width: 35%;
  text-align: right;
  @media (max-width: ${(props) => props.theme.themeBreakPoints.md}) {
    padding-left: 0px;
    width: 20%;
  }
`

export const THButton = styled.button`
  margin: 0;
  padding: 0;
  border: 0;
  display: flex;
  align-items: center;
  font: inherit;
  color: inherit;
  outline: none;
  background-color: rgba(0, 0, 0, 0);
`
