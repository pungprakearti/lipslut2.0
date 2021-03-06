import React, { Component } from 'react'
import styled from 'styled-components'
import 'animate.css'
import { AccountOrderHistory, AccountDetails } from '../components'
import { Loading } from '../components/atoms'
import lightBlueLayout from '../layouts/lightBlue.jsx'

const Container = styled.div`
  display: flex;
  justify-content: space-around;
  padding: 2rem;
  animation: fadein 1s;
  min-height: 80vh;
  @keyframes fadein {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  @media (max-width: 420px) {
    flex-direction: column;
    align-items: center;
    padding: 1rem;
  }
`

class Account extends Component {
  componentDidMount() {
    this.props.resetSidebar()
  }
  render() {
    const { curUser, signIn } = this.props
    return (
      <div>
        {curUser ? (
          <Container>
            <AccountDetails curUser={curUser} signIn={signIn} />
            <AccountOrderHistory curUser={curUser} signIn={signIn} />
          </Container>
        ) : (
          <Loading height={'35rem'} />
        )}
      </div>
    )
  }
}

export default lightBlueLayout(Account)
