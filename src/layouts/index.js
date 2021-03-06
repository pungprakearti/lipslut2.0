import React, { Component } from 'react'
import styled from 'styled-components'
import Helmet from 'react-helmet'
import { Navbar, Footer } from '../components'
import ChatButton from '../components/atoms/ChatButton'
import postLambda from '../utilities/postLambda'
import Cart from '../utilities/cart'
import { CartProvider } from '../containers/CartContext'
import FirebaseProvider from '../containers/FirebaseProvider'
import firebase from '../utilities/firebase'
import { UserProvider } from '../containers/UserContext'
import './index.css'
// import 'pace-js/themes/pink/pace-theme-minimal.css'

const Container = styled.div`
  h1,
  h2,
  h3,
  h4,
  p,
  a,
  label,
  button,
  input,
  select {
    font-family: futura-pt, sans-serif;
  }

  h3,
  h4,
  p {
    font-weight: 100;
  }

  p {
    font-size: 0.9rem;
    line-height: 1.3rem;
  }
  a {
    text-decoration: none;
  }
  img {
    border-radius: 1.5px;
  }

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .all-components-layout {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    max-width: 1260px;
    padding: 0px 1.0875rem;
    min-height: 80vh;

    @media (max-width: 1200px) {
      padding: 0;
      margin: 0;
    }
    @media (max-width: 420px) {
      max-width: 100vw;
      padding-left: 1rem;
      padding-right: 1rem;
      margin: auto;
    }
  }
`

// Gatsby window object problem hack
const windowGlobal = typeof window !== 'undefined' && window

class Layout extends Component {
  constructor(props) {
    super(props)
    this.state = {
      cart: [],
      curUser: null,
      sidebar: false,
      displayFix: false,
      bannerMargin: 5.9,
    }
  }

  componentDidMount() {
    let cartData = windowGlobal.localStorage.getItem('cart') || '[]'
    cartData = JSON.parse(cartData)
    this.setState({ cart: cartData })

    firebase.auth().onAuthStateChanged(user => {
      if (user && !this.state.curUser) {
        this.signIn(user)
      } else {
        this.setState({ curUser: null })
      }
    })
  }

  // Firebase Functionality
  signIn = user => {
    // TODO: Seperate database schema into more react friendly schema
    firebase
      .signIn(user.uid)
      .then(curUser => {
        // If the user info exists in the database sign them in
        if (curUser.data()) {
          curUser = curUser.data()
          postLambda('getAccount', curUser).then(res => {
            curUser['orderHistory'] = res.data.customer.orders
            this.setState({ curUser })
          })
        }
      })
      .catch(err => {
        console.log(err)
      })
  }
  handleSignup = user => {
    this.setState({ curUser: user })
  }

  // Sidebar/Banner UI Logic
  handleSidebar = () => {
    this.setState({
      sidebar: !this.state.sidebar,
      displayFix: true,
    })
  }
  resetSidebar = () => {
    this.setState({ sidebar: false })
  }
  handleBannerMargin = rem => {
    this.setState({ bannerMargin: rem })
  }

  handleCart = (cartFunc, ...args) => {
    switch (cartFunc) {
      case 'add':
        Cart.addItem(this, ...args)
        break
      case 'edit':
        Cart.editItem(this, ...args)
        break
      case 'remove':
        Cart.removeItem(this, ...args)
        break
      case 'clear':
        Cart.clearCart(this)
        break
      default:
        console.error('incorrect usage')
        break
    }
  }

  render() {
    const { children } = this.props
    // TODO: Remove this pattern and convert out of a gatsby v1 magic layout
    // Cannot Pass Props down to children in Gatsby v2 with gatsby v1 magic Layout, Need this Hack for now
    const childrenWithProps = React.Children.map(children, (child, i) =>
      React.cloneElement(child, {
        ...this.props,
        curUser: this.state.curUser,
        resetSidebar: this.resetSidebar,
        signIn: this.signIn,
      })
    )

    // Insert script when in development. Utilize script in Netlify when in production.
    const chatraScript = process.env.GATSBY_NODE_ENV === 'development' && (
      <script>{`
        (function(d, w, c) {
          w.ChatraID = 'JD5jT4iBuacZ26eBx';
          var s = d.createElement('script');
          w[c] = w[c] || function() {
            (w[c].q = w[c].q || []).push(arguments);
          };
          s.async = true;
          s.src = 'https://call.chatra.io/chatra.js';
          if (d.head) d.head.appendChild(s);
        })(document, window, 'Chatra');
      `}</script>
    )

    return (
      <FirebaseProvider firebase={firebase}>
        <UserProvider
          value={{
            curUser: this.state.curUser,
            handleSignup: this.handleSignup,
          }}
        >
          <CartProvider
            value={{
              cart: this.state.cart,
              handleCart: this.handleCart,
            }}
          >
            {/* placeholder div for Modal's children*/}
            <Container>
              <div id="modalContainer" />
              <Helmet
                title="Lipslut"
                // TODO: Fill this out with accurate site metadata for google
                meta={[
                  {
                    name: 'description',
                    content:
                      'Lipslut is fashion, subversion, and a middle finger to the current sociopolitical landscape. By working hard towards solving the issues you care about, Lipslut is ready to help you make a statement.',
                  },
                  { name: 'keywords', content: 'sample, something' },
                ]}
              >
                {chatraScript}
              </Helmet>

              <Navbar
                curUser={this.state.curUser}
                sidebar={this.state.sidebar}
                displayFix={this.state.displayFix}
                handleSidebar={this.handleSidebar}
                handleBannerMargin={this.handleBannerMargin}
              />

              <div
                className="all-components-layout"
                style={{ marginTop: this.state.bannerMargin + 'rem' }}
              >
                {childrenWithProps}
              </div>
              <Footer curUser={this.state.curUser} />
            </Container>
            <ChatButton />
          </CartProvider>
        </UserProvider>
      </FirebaseProvider>
    )
  }
}

export default Layout
