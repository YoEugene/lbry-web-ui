import React from 'react';
import lbry from '../lbry.js';
import Modal from './modal.js';
import {Icon, ToolTip} from './common.js';


export let Link = React.createClass({
  handleClick: function() {
    if (this.props.onClick) {
      this.props.onClick();
    }
  },
  render: function() {
    var href = this.props.href ? this.props.href : 'javascript:;',
      icon = this.props.icon ? <Icon icon={this.props.icon} fixed={true} />  : '',
      className = (this.props.className ? this.props.className : '') +
        (this.props.button ? ' button-block button-' + this.props.button : '') +
        (this.props.hidden ? ' hidden' : '') +
        (this.props.disabled ? ' disabled' : '');

    return (
      <a className={className ? className : 'button-text'} href={href} style={this.props.style ? this.props.style : {}}
         title={this.props.title} onClick={this.handleClick}>
        {this.props.icon ? icon : '' }
        <span className="link-label">{this.props.label}</span>
        {this.props.badge ? <span className="badge">{this.props.badge}</span> : '' }
      </a>
    );
  }
});

var linkContainerStyle = {
  position: 'relative',
};

export let ToolTipLink = React.createClass({
  getInitialState: function() {
    return {
      showTooltip: false,
    };
  },
  handleClick: function() {
    if (this.props.tooltip) {
      this.setState({
        showTooltip: !this.state.showTooltip,
      });
    }
    if (this.props.onClick) {
      this.props.onClick();
    }
  },
  handleTooltipMouseOut: function() {
    this.setState({
      showTooltip: false,
    });
  },
  render: function() {
    var href = this.props.href ? this.props.href : 'javascript:;',
      icon = this.props.icon ? <Icon icon={this.props.icon} />  : '',
      className = this.props.className +
        (this.props.button ? ' button-block button-' + this.props.button : '') +
        (this.props.hidden ? ' hidden' : '') +
        (this.props.disabled ? ' disabled' : '');

    return (
      <span style={linkContainerStyle}>
        <a className={className ? className : 'button-text'} href={href} style={this.props.style ? this.props.style : {}}
           title={this.props.title} onClick={this.handleClick}>
          {this.props.icon ? icon : '' }
          {this.props.label}
        </a>
        {(!this.props.tooltip ? null :
          <ToolTip open={this.state.showTooltip} onMouseOut={this.handleTooltipMouseOut}>
            {this.props.tooltip}
          </ToolTip>
        )}
      </span>
    );
  }
});

export let DownloadLink = React.createClass({
  propTypes: {
    type: React.PropTypes.string,
    streamName: React.PropTypes.string,
    label: React.PropTypes.string,
    downloadingLabel: React.PropTypes.string,
    button: React.PropTypes.string,
    style: React.PropTypes.object,
    hidden: React.PropTypes.bool,
  },
  getDefaultProps: function() {
    return {
      icon: 'icon-download',
      label: 'Download',
      downloadingLabel: 'Downloading...',
    }
  },
  getInitialState: function() {
    return {
      downloading: false,
      filePath: null,
      modal: null,
    }
  },
  closeModal: function() {
    this.setState({
      modal: null,
    })
  },
  handleClick: function() {
    lbry.getCostEstimate(this.props.streamName, (amount) => {
      lbry.getBalance((balance) => {
        if (amount > balance) {
          this.setState({
            modal: 'notEnoughCredits',
          });
        } else {
          this.startDownload();
        }
      });
    });
  },
  startDownload: function() {
    if (!this.state.downloading) { //@TODO: Continually update this.state.downloading based on actual status of file
      this.setState({
        downloading: true
      });

      lbry.getStream(this.props.streamName, (streamInfo) => {
        this.setState({
          modal: 'downloadStarted',
          filePath: streamInfo.path,
        });
      });
    }
  },
  render: function() {
    var label = (!this.state.downloading ? this.props.label : this.props.downloadingLabel);
    return (
      <span className="button-container">
        <Link button={this.props.button} hidden={this.props.hidden} style={this.props.style}
              disabled={this.state.downloading} label={label} icon={this.props.icon} onClick={this.handleClick} />
        <Modal isOpen={this.state.modal == 'downloadStarted'} onConfirmed={this.closeModal}>
          Downloading to {this.state.filePath}
        </Modal>
        <Modal isOpen={this.state.modal == 'notEnoughCredits'} onConfirmed={this.closeModal}>
          You don't have enough LBRY credits to pay for this stream.
        </Modal>
      </span>
    );
  }
});

export let WatchLink = React.createClass({
  propTypes: {
    type: React.PropTypes.string,
    streamName: React.PropTypes.string,
    label: React.PropTypes.string,
    button: React.PropTypes.string,
    style: React.PropTypes.object,
    hidden: React.PropTypes.bool,
  },
  handleClick: function() {
    lbry.getCostEstimate(this.props.streamName, (amount) => {
      lbry.getBalance((balance) => {
        if (amount > balance) {
          this.setState({
            modal: 'notEnoughCredits',
          });
        } else {
          window.location = '?watch=' + this.props.streamName;
        }
      });
    });
  },
  getInitialState: function() {
    return {
      modal: null,
    };
  },
  closeModal: function() {
    this.setState({
      modal: null,
    });
  },
  getDefaultProps: function() {
    return {
      icon: 'icon-play',
      label: 'Watch',
    }
  },
  render: function() {
    return (
      <span className="button-container">
        <Link button={this.props.button} hidden={this.props.hidden} style={this.props.style}
                   label={this.props.label} icon={this.props.icon} onClick={this.handleClick} />
        <Modal isOpen={this.state.modal == 'notEnoughCredits'} onConfirmed={this.closeModal}>
          You don't have enough LBRY credits to pay for this stream.
        </Modal>
      </span>
    );
  }
});
