import React, { Component } from 'react';
import propTypes from 'prop-types';
import { connect } from 'react-redux';

import AppBar from '@material-ui/core/AppBar';
import IconButton from '@material-ui/core/IconButton';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

import MenuIcon from '@material-ui/icons/Menu';
import NowPlayingIcon from '@material-ui/icons/PlaylistPlay';
import PlayListIcon from '@material-ui/icons/List';
import HomeIcon from '@material-ui/icons/Home';
import SettingsIcon from '@material-ui/icons/CloudUpload';
import {
  addSongs, addJwk, HOME_PAGE, SETTINGS_PAGE, NOW_PLAYING_PAGE, PLAYLIST_PAGE,
} from '../actions';

import {getAudios} from "../utils/arweave";

const mapDispatchToProps = dispatch => ({
  openPage: type => dispatch({ type }),
  addJwk: jwk => dispatch(addJwk(jwk)),
  addSongs: songs => dispatch(addSongs(songs)),
});

const menuOptions = [
  {
    option: 'Home',
    page: HOME_PAGE,
    icon: <HomeIcon />,
  },
  {
    option: 'Currently Playing',
    page: NOW_PLAYING_PAGE,
    icon: <NowPlayingIcon />,
  },
  {
    option: 'Upload Wallet',
    page: SETTINGS_PAGE,
    icon: <SettingsIcon />,
  },
];

const loadWallet = (wallet) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => {
      reader.abort()
      reject()
    }
    reader.addEventListener("load", () => {resolve(reader.result)}, false)
    reader.readAsText(wallet)
  })
}

class Header extends Component {
  state = {
    open: false,
  };

  
  loadWallet = async (file) => {
    let key = JSON.parse(await loadWallet(file));
    let x = await getAudios(key);
    this.props.addJwk(key);
    this.props.addSongs(x);
  }
  clickWallet = () => {
    document.getElementById("upload-wallet").click();
  }
  openPage = page => () => {
    const { openPage, playState, openSnackbar } = this.props;
    this.setState(prevState => ({ open: !prevState.open }));
    if (page === SETTINGS_PAGE) {
      this.clickWallet();
      return;
    }
    // Don't Open now playing page when there is no song
    if (!playState && page === NOW_PLAYING_PAGE) return;
    if (page) openPage(page);
  }

  render() {
    const { open } = this.state;
    return (
      <div>
        <input type="file" style={{display: "none"}} id="upload-wallet" onChange={(e)=>{this.loadWallet(e.target.files[0])}}/>
        <AppBar>
          <Toolbar>
            <IconButton onClick={this.openPage()} color="inherit" aria-label="Menu">
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" color="inherit">
            Arweafy Web - Personal Music Player
            </Typography>
          </Toolbar>
        </AppBar>
        <div className="header-padding" style={{ height: '55px' }} />
        <SwipeableDrawer anchor="left" open={open} onClose={this.openPage()} onOpen={this.openPage()}>
          <div style={{ paddingTop: '50px' }} />
          {
            menuOptions.map(option => (
              <ListItem key={option.option} button onClick={this.openPage(option.page)}>
                <ListItemIcon>{option.icon}</ListItemIcon>
                <ListItemText>{option.option}</ListItemText>
              </ListItem>
            ))
          }
        </SwipeableDrawer>
      </div>
    );
  }
}

Header.propTypes = {
  openPage: propTypes.func.isRequired,
  playState: propTypes.objectOf(propTypes.any).isRequired,
  openSnackbar: propTypes.func.isRequired,
};

export default connect(null, mapDispatchToProps)(Header);
