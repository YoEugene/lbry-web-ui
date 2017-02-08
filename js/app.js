import React from 'react';
import lbry from './lbry.js';
import SettingsPage from './page/settings.js';
import HelpPage from './page/help.js';
import WatchPage from './page/watch.js';
import ReportPage from './page/report.js';
import MyFilesPage from './page/my_files.js';
import StartPage from './page/start.js';
import ClaimCodePage from './page/claim_code.js';
import ReferralPage from './page/referral.js';
import WalletPage from './page/wallet.js';
import DetailPage from './page/show.js';
import PublishPage from './page/publish.js';
import DiscoverPage from './page/discover.js';
import SplashScreen from './component/splash.js';
import DeveloperPage from './page/developer.js';
import Drawer from './component/drawer.js';
import Header from './component/header.js';
import Modal from './component/modal.js';
import {Link} from './component/link.js';

var App = React.createClass({
  _error_key_labels: {
    connectionString: 'API connection string',
    method: 'Method',
    params: 'Parameters',
    code: 'Error code',
    message: 'Error message',
    data: 'Error data',
  },

  getInitialState: function() {
    // For now, routes are in format ?page or ?page=args
    var match, param, val, viewingPage,
        drawerOpenRaw = sessionStorage.getItem('drawerOpen');

    [match, viewingPage, val] = window.location.search.match(/\??([^=]*)(?:=(.*))?/);


    return {
      viewingPage: viewingPage,
      drawerOpen: drawerOpenRaw !== null ? JSON.parse(drawerOpenRaw) : true,
      pageArgs: typeof val !== 'undefined' ? val : null,
      errorInfo: null,
      modal: null,
      updateUrl: null,
      isOldOSX: null,
    };
  },
  componentWillMount: function() {
    document.addEventListener('unhandledError', (event) => {
      this.alertError(event.detail);
    });

    lbry.checkNewVersionAvailable((isAvailable) => {
      if (!isAvailable || sessionStorage.getItem('upgradeSkipped')) {
        return;
      }

      lbry.getVersionInfo((versionInfo) => {
        var isOldOSX = false;
        if (versionInfo.os_system == 'Darwin') {
          var updateUrl = 'https://lbry.io/get/lbry.dmg';

          var maj, min, patch;
          [maj, min, patch] = versionInfo.lbrynet_version.split('.');
          if (maj == 0 && min <= 2 && patch <= 2) {
            isOldOSX = true;
          }
        } else if (versionInfo.os_system == 'Linux') {
          var updateUrl = 'https://lbry.io/get/lbry.deb';
        } else if (versionInfo.os_system == 'Windows') {
          var updateUrl = 'https://lbry.io/get/lbry.msi';
        } else {
          var updateUrl = 'https://lbry.io/get';
        }

        this.setState({
          modal: 'upgrade',
          isOldOSX: isOldOSX,
          updateUrl: updateUrl,
        })
      });
    });
  },
  openDrawer: function() {
    sessionStorage.setItem('drawerOpen', true);
    this.setState({ drawerOpen: true });
  },
  closeDrawer: function() {
    sessionStorage.setItem('drawerOpen', false);
    this.setState({ drawerOpen: false });
  },
  closeModal: function() {
    this.setState({
      modal: null,
    });
  },
  handleUpgradeClicked: function() {
    lbry.stop();
    window.location = this.state.updateUrl;
  },
  handleSkipClicked: function() {
    sessionStorage.setItem('upgradeSkipped', true);
    this.setState({
      modal: null,
    });
  },
  onSearch: function(term) {
    this.setState({
      viewingPage: 'discover',
      pageArgs: term
    });
  },
  alertError: function(error) {
    var errorInfoList = [];
    for (let key of Object.keys(error)) {
      let val = typeof error[key] == 'string' ? error[key] : JSON.stringify(error[key]);
      let label = this._error_key_labels[key];
      errorInfoList.push(<li key={key}><strong>{label}</strong>: <code>{val}</code></li>);
    }

    this.setState({
      modal: 'error',
      errorInfo: <ul className="error-modal__error-list">{errorInfoList}</ul>,
    });
  },
  getHeaderLinks: function()
  {
    switch(this.state.viewingPage)
    {
      case 'wallet':
      case 'send':
      case 'receive':
      case 'claim':
      case 'referral':
        return {
          '?wallet' : 'Overview',
          '?send' : 'Send',
          '?receive' : 'Receive',
          '?claim' : 'Claim Beta Code',
          '?referral' : 'Check Referral Credit',
        };
      case 'downloaded':
      case 'published':
        return {
          '?downloaded': 'Downloaded',
          '?published': 'Published',
        };
      default:
        return null;
    }
  },
  getMainContent: function()
  {
    switch(this.state.viewingPage)
    {
      case 'settings':
        return <SettingsPage />;
      case 'help':
        return <HelpPage />;
      case 'watch':
        return <WatchPage name={this.state.pageArgs} />;
      case 'report':
        return <ReportPage />;
      case 'downloaded':
        return <MyFilesPage show="downloaded" />;
      case 'published':
        return <MyFilesPage show="published" />;
      case 'start':
        return <StartPage />;
      case 'claim':
        return <ClaimCodePage />;
      case 'referral':
        return <ReferralPage />;
      case 'wallet':
      case 'send':
      case 'receive':
        return <WalletPage viewingPage={this.state.viewingPage} />;
      case 'show':
        return <DetailPage name={this.state.pageArgs} />;
      case 'publish':
        return <PublishPage />;
      case 'developer':
        return <DeveloperPage />;
      case 'discover':
      default:
        return <DiscoverPage {... this.state.pageArgs !== null ? {query: this.state.pageArgs} : {} } />;
    }
  },
  render: function() {
    var mainContent = this.getMainContent(),
        headerLinks = this.getHeaderLinks(),
        searchQuery = this.state.viewingPage == 'discover' && this.state.pageArgs ? this.state.pageArgs : '';

    return (
      this.state.viewingPage == 'watch' ?
        mainContent :
        <div id="window" className={ 'drawer-closed' }>
          <Drawer onCloseDrawer={this.closeDrawer} viewingPage={this.state.viewingPage} />
          <div id="main-content" className={ headerLinks ? 'with-sub-nav' : 'no-sub-nav' }>
            <Header onOpenDrawer={this.openDrawer} initialQuery={searchQuery} onSearch={this.onSearch} links={headerLinks} viewingPage={this.state.viewingPage} />
            {mainContent}
          </div>
          <Modal isOpen={this.state.modal == 'upgrade'} contentLabel="Update available"
                 type="confirm" confirmButtonLabel="Upgrade" abortButtonLabel="Skip"
                 onConfirmed={this.handleUpgradeClicked} onAborted={this.handleSkipClicked}>
            <p>Your version of LBRY is out of date and may be unreliable or insecure.</p>
            {this.state.isOldOSX
              ? <p>Before installing the new version, make sure to exit LBRY. If you started the app, click the LBRY icon in your status bar and choose "Quit."</p>
              : null}

          </Modal>
          <Modal isOpen={this.state.modal == 'error'} contentLabel="Error" type="custom"
                 className="error-modal" overlayClassName="error-modal-overlay"  >
            <h3 className="modal__header">Error</h3>

            <div className="error-modal__content">
              <div><img className="error-modal__warning-symbol" src={lbry.imagePath('warning.png')} /></div>
              <p>We're sorry that LBRY has encountered an error. This has been reported and we will investigate the problem.</p>
            </div>
            {this.state.errorInfo}
            <div className="modal__buttons">
              <Link button="alt" label="OK" className="modal__button" onClick={this.closeModal} />
            </div>
          </Modal>
        </div>
    );
  }
});


export default App;
